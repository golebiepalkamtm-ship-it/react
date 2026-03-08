import "./env.js"; // Must be first
// file deepcode ignore HttpToHttps: The API sits behind a reverse proxy that terminates TLS
import "./tracing.js"; // OpenTelemetry bootstrap — initialize before other imports
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setupWebSocketEvents } from "./websocket/bidding.js";
import { initSocket } from "./lib/socket.js";
import app, { allowedOrigins } from "./app.js";
import { initializeAuth } from "./middleware/auth.js";
import { validatedEnv } from "./lib/env.js";
import { execSync } from "child_process";
import fs from "fs";

// Initialize auth system
initializeAuth();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run migrations in production
if (
  validatedEnv.NODE_ENV === "production" &&
  validatedEnv.PRISMA_MIGRATE_DEPLOY === "true"
) {
  try {
    console.log("🔄 Running database migrations...");
    const rootDir = path.resolve(__dirname, "..");

    // Check multiple potential locations
    const possiblePaths = [
      path.join(rootDir, "prisma", "schema.prisma"),
      path.join(rootDir, "server", "prisma", "schema.prisma"),
      path.join(process.cwd(), "prisma", "schema.prisma"),
      path.join(process.cwd(), "server", "prisma", "schema.prisma"),
      "/app/prisma/schema.prisma",
      "/app/server/prisma/schema.prisma",
    ];

    let schemaPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        schemaPath = p;
        break;
      }
    }

    if (!schemaPath) {
      console.error(
        "❌ Could not find schema.prisma in any expected location.",
      );
      possiblePaths.forEach((p) => console.error(`  - ${p}`));
      try {
        console.log("📂 Current directory structure:");
        const structure = execSync('find . -maxdepth 3 -not -path "*/.*"', {
          encoding: "utf8",
        });
        console.log(structure);
      } catch (e) {
        console.log("Could not list directory structure");
      }
      process.exit(1);
    }

    console.log(`✅ Using schema at: ${schemaPath}`);
    execSync(`npx prisma migrate deploy --schema="${schemaPath}"`, {
      stdio: "inherit",
    });
    console.log("✅ Database migrations completed successfully.");
  } catch (error: any) {
    console.error("❌ Database migration failed:", error.message || error);
    // Don't process.exit(1) here to allow the server to start and show DB error details via API
  }
}

let server: any;

const sslPath = path.join(process.cwd(), "certificates");
const sslKeyPath = path.join(sslPath, "server.key");
const sslCertPath = path.join(sslPath, "server.cert");

if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  console.log("🔒 SSL Certificates found, starting HTTPS server...");
  const options = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
  };
  server = createHttpsServer(options, app);
} else {
  if (validatedEnv.NODE_ENV === "production") {
    // In production we require TLS termination (certs) — fail fast to avoid insecure server start
    console.error(
      "❌ SSL Certificates not found in production. Refusing to start HTTP server. Provide certificates or terminate TLS at a reverse proxy.",
    );
    process.exit(1);
  } else {
    // Non-production: allow HTTP for local/dev/testing environments only
    // file deepcode ignore HttpToHttps: The API sits behind a reverse proxy that terminates TLS
    server = createHttpServer(app);
  }
}

const io = initSocket(server, allowedOrigins());
setupWebSocketEvents(io);

const findAvailablePort = (
  startPort: number,
  attempts = 0,
): Promise<number> => {
  const MAX_ATTEMPTS = 20;
  return new Promise((resolve, reject) => {
    if (attempts >= MAX_ATTEMPTS) {
      return reject(
        new Error(
          `No free port found after ${MAX_ATTEMPTS} attempts starting from ${startPort - attempts}`,
        ),
      );
    }

    // file deepcode ignore HttpToHttps: The API sits behind a reverse proxy that terminates TLS
    const testServer = createHttpServer();
    testServer.listen(startPort, () => {
      testServer.close(() => {
        resolve(startPort);
      });
    });
    testServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1, attempts + 1));
      } else {
        reject(err);
      }
    });
  });
};

const PORT = Number(process.env.PORT) || 8001;
const isStaticPort =
  (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") &&
  process.env.FORCE_DYNAMIC_PORT !== "true";

const startServer = (listenPort: number) => {
  server.listen(listenPort, () => {
    console.log(`🚀 Backend server running on port ${listenPort}`);
    console.log(`📊 Health check: http://localhost:${listenPort}/health`);
    console.log(`📡 API endpoint: http://localhost:${listenPort}/api`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${listenPort} is already in use!`);
      if (isStaticPort) {
        process.exit(1);
      } else {
        findAvailablePort(listenPort + 1)
          .then((fallbackPort) => {
            console.log(`↪️  Retrying on free port ${fallbackPort}`);
            startServer(fallbackPort);
          })
          .catch((findErr) => {
            console.error("Failed to find available fallback port:", findErr);
            process.exit(1);
          });
      }
    } else {
      throw err;
    }
  });
};

if (isStaticPort) {
  startServer(PORT);
} else {
  findAvailablePort(PORT)
    .then((availablePort) => startServer(availablePort))
    .catch((err) => {
      console.error("Failed to find available port:", err);
      process.exit(1);
    });
}
