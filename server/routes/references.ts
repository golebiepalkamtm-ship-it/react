import express, { type Router, type Request, type Response } from "express";
import { prisma } from "../lib/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { dataFetchLimiter } from "../middleware/rateLimiter.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router: Router = express.Router();

const REFERENCES_CACHE_TTL_MS = 60_000;

type ReferenceFileCache = {
  data: unknown[];
  expiresAt: number;
  path: string | null;
  mtimeMs: number;
};

let referenceFileCache: ReferenceFileCache = {
  data: [],
  expiresAt: 0,
  path: null,
  mtimeMs: 0,
};

const getLocalDataPath = (filename: string): string => {
  const possiblePaths = [
    path.join(process.cwd(), "server/data", filename),
    path.join(process.cwd(), "data", filename),
    path.join(__dirname, "../data", filename),
    path.join(__dirname, "../../data", filename),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return possiblePaths[0];
};

const normalizeReferenceBody = (body: any) => {
  const src = typeof body?.data === "string" ? JSON.parse(body.data) : body;
  return {
    breederName: src.breederName ?? src.breeder_name,
    location: src.location,
    rating: Number(src.rating ?? 5),
    opinion: src.opinion ?? src.testimonial ?? src.experience,
    experience: src.experience,
    achievements: src.achievements,
    pigeonName: src.pigeonName ?? src.pigeon_name,
    images: Array.isArray(src.images) ? src.images : [],
    isApproved:
      typeof src.isApproved === "boolean"
        ? src.isApproved
        : typeof src.is_approved === "boolean"
          ? src.is_approved
          : false,
  };
};

const readReferencesFromFile = async (): Promise<unknown[]> => {
  const referencesPath = getLocalDataPath("references.json");

  if (!fs.existsSync(referencesPath)) {
    referenceFileCache = {
      data: [],
      expiresAt: Date.now() + REFERENCES_CACHE_TTL_MS,
      path: referencesPath,
      mtimeMs: 0,
    };
    return [];
  }

  const stats = await fs.promises.stat(referencesPath);
  const now = Date.now();

  if (
    referenceFileCache.path === referencesPath &&
    referenceFileCache.expiresAt > now &&
    referenceFileCache.mtimeMs === stats.mtimeMs
  ) {
    return referenceFileCache.data;
  }

  const referencesData = await fs.promises.readFile(referencesPath, "utf-8");
  const references = JSON.parse(referencesData);
  const data = Array.isArray(references)
    ? references
    : Array.isArray(references.references)
      ? references.references
      : [];

  referenceFileCache = {
    data,
    expiresAt: now + REFERENCES_CACHE_TTL_MS,
    path: referencesPath,
    mtimeMs: stats.mtimeMs,
  };

  return data;
};

// GET ALL
router.get("/", dataFetchLimiter, async (req: Request, res: Response) => {
  try {
    if (prisma) {
      try {
        const dbReferences = await prisma.reference.findMany({
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        });
        if (dbReferences.length > 0) return res.json(dbReferences);
      } catch (dbErr) {
        console.warn(
          "DB fetch for references failed, falling back to file",
          dbErr,
        );
      }
    }

    const data = await readReferencesFromFile();
    res.json(data);
  } catch (error: any) {
    console.error("Error reading references data:", error);
    res
      .status(500)
      .json({ error: `Failed to load references data: ${error.message}` });
  }
});

// CREATE
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  if (!prisma)
    return res.status(503).json({ error: "Baza danych jest niedostępna." });
  const user = (req as any).user;
  if (user?.role !== "ADMIN")
    return res.status(403).json({ error: "Brak uprawnień." });

  const payload = normalizeReferenceBody(req.body);
  if (!payload.breederName || !payload.location) {
    return res
      .status(400)
      .json({ error: "breederName i location są wymagane." });
  }

  try {
    const created = await prisma.reference.create({
      data: {
        breederName: payload.breederName,
        location: payload.location,
        rating: payload.rating || 5,
        opinion: payload.opinion,
        experience: payload.experience,
        achievements: payload.achievements,
        pigeonName: payload.pigeonName,
        images: payload.images,
        isApproved: payload.isApproved ?? false,
      },
    });
    return res.status(201).json(created);
  } catch (error: any) {
    console.error("Error creating reference:", error);
    return res
      .status(500)
      .json({
        error: "Nie udało się utworzyć referencji.",
        details: error.message,
      });
  }
});

// UPDATE
router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  if (!prisma)
    return res.status(503).json({ error: "Baza danych jest niedostępna." });
  const user = (req as any).user;
  if (user?.role !== "ADMIN")
    return res.status(403).json({ error: "Brak uprawnień." });

  const payload = normalizeReferenceBody(req.body);
  const { id } = req.params;
  try {
    const updated = await prisma.reference.update({
      where: { id },
      data: {
        breederName: payload.breederName,
        location: payload.location,
        rating: payload.rating || undefined,
        opinion: payload.opinion,
        experience: payload.experience,
        achievements: payload.achievements,
        pigeonName: payload.pigeonName,
        images: payload.images,
        isApproved: payload.isApproved,
      },
    });
    return res.json(updated);
  } catch (error: any) {
    console.error("Error updating reference:", error);
    return res
      .status(500)
      .json({
        error: "Nie udało się zaktualizować referencji.",
        details: error.message,
      });
  }
});

// DELETE
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  if (!prisma)
    return res.status(503).json({ error: "Baza danych jest niedostępna." });
  const user = (req as any).user;
  if (user?.role !== "ADMIN")
    return res.status(403).json({ error: "Brak uprawnień." });

  const { id } = req.params;
  try {
    await prisma.reference.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting reference:", error);
    return res
      .status(500)
      .json({
        error: "Nie udało się usunąć referencji.",
        details: error.message,
      });
  }
});

export default router;
