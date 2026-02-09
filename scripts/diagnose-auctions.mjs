import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const filesToCheck = [
  "src/components/CreateAuctionForm.tsx",
  "src/services/uploadService.ts",
  "src/services/api.ts",
  "src/lib/supabase.ts",
  "src/contexts/AuthContext.tsx",
  "server/app.ts",
  "server/routes/auctions.ts",
  "server/routes/upload.ts",
  "server/middleware/auth.ts",
  "server/middleware/unifiedAuth.ts",
  "server/lib/db.ts",
  "server/lib/env.ts",
  "server/prisma/schema.prisma",
];

function fileExists(file) {
  return fs.existsSync(path.join(projectRoot, file));
}

function readFile(file) {
  try {
    return fs.readFileSync(path.join(projectRoot, file), "utf8");
  } catch {
    return "";
  }
}

function checkImports(content, expected) {
  return expected.every((imp) => content.includes(imp));
}

function bool(x) { return !!x; }

function readJSONSafe(file) {
  try {
    return JSON.parse(readFile(file));
  } catch {
    return null;
  }
}

function envPreview(value) {
  if (typeof value !== "string") return String(value);
  const v = value.trim().replace(/^["'`]|["'`]$/g, "");
  return v.length > 12 ? v.slice(0, 12) + "...(" + v.length + " chars)" : v;
}

function shrink(text, max = 200) {
  if (!text) return "";
  const s = String(text).replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max) + "..." : s;
}

async function ping(url, opts = {}) {
  try {
    const res = await fetch(url, { method: "GET", ...opts });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: String(e && e.message) };
  }
}

async function testPost(url, body, headers = {}) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", ...headers },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text: shrink(text) };
  } catch (e) {
    return { ok: false, status: 0, error: String(e && e.message) };
  }
}

async function testUpload(url, token, mimeType, fileName, formFields = {}, extraHeaders = {}) {
  try {
    const fd = new FormData();
    let blob;
    if (mimeType.startsWith('image')) {
      // 1x1 transparent PNG
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      blob = new Blob([png], { type: mimeType });
    } else if (mimeType.startsWith('video')) {
      // A tiny, valid mp4 file (from https://github.com/mathiasbynens/small)
      const mp4 = Buffer.from('AAAAIGZ0eXBNU05WAAACAE1TTlYxAAAAAABtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAB4AAAACgAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAGGlvZHMAAAAAEwAACAEAAAcY//8/AAAAAAB1ZHRhAAAAFG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXIAAAAAAAAAAAAAAAAAAAAAAG1pbmYAAAAQZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEEdHJhawAAAFx0a2hkAAAAAwAAAAAAAAAAAAAAAQAAAAAAAAB4AAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAJGVkdHMAAAAcZWxzdAAAAAAAAAABAAAAeAAAAAoAAAAAAQAAAAAAbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAB1AAAAAVXVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAASxzdGJsAAAAxHN0c2QAAAAAAAAAAQAAAFxhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAABIAEgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAADRzdHRzAAAAAAAAAAEAAAAKAAAAAQAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAACAAAAAQAAABxzdHN6AAAAAAAAAAoAAAABAAAABgAAAAcAAAAHAAAABwAAAAcAAAAHAAAABwAAAAcAAAAHAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAANaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY1OC4yOS4xMDA=', 'base64');
      blob = new Blob([mp4], { type: mimeType });
    } else {
      // Simple text for PDF
      blob = new Blob(["test"], { type: mimeType });
    }
    fd.append("file", blob, fileName);
    Object.entries(formFields).forEach(([k, v]) => fd.append(k, v));
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        ...extraHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text: shrink(text) };
  } catch (e) {
    return { ok: false, status: 0, error: String(e && e.message) };
  }
}

async function fetchSupabaseUserAndRole(supabaseUrl, anonKey, token) {
  if (!supabaseUrl || !anonKey || !token) {
    return { ok: false, reason: "missing_supabase_url_or_key_or_token" };
  }
  const headers = { Authorization: `Bearer ${token}`, apikey: anonKey };
  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers });
    if (!userRes.ok) {
      return { ok: false, reason: `auth_user_${userRes.status}` };
    }
    const user = await userRes.json();
    const userId = user?.id;
    if (!userId) {
      return { ok: false, reason: "auth_user_missing_id" };
    }
    const roleRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=role`, { headers });
    if (!roleRes.ok) {
      return { ok: false, reason: `role_fetch_${roleRes.status}` };
    }
    const roles = await roleRes.json();
    const role = roles?.[0]?.role || "UNKNOWN";
    return { ok: true, userId, role };
  } catch (e) {
    return { ok: false, reason: String(e && e.message) };
  }
}

const envPath = path.resolve(process.cwd(), '.env.development');
const envFile = fs.readFileSync(envPath, 'utf-8');
const envConfig = Object.fromEntries(
  envFile.split('\n').map(line => {
    const [key, ...value] = line.split('=');
    return [key, value.join('=')];
  })
);

Object.assign(process.env, envConfig);

async function main() {
  const report = [];

  filesToCheck.forEach((f) => {
    report.push(`[FILES] ${f}: ${fileExists(f) ? "OK" : "MISSING"}`);
  });

  const envLocal = readFile(".env.local");
  const envDev = readFile(".env.development");
  const viteEnvReady = readFile("vite-env-ready.txt");
  report.push(`[ENV FRONTEND] .env.local present: ${bool(envLocal) ? "YES" : "NO"}`);
  report.push(`[ENV FRONTEND] .env.development present: ${bool(envDev) ? "YES" : "NO"}`);
  report.push(`[ENV FRONTEND] vite-env-ready.txt present: ${bool(viteEnvReady) ? "YES" : "NO"}`);

  const rootEnv = readFile(".env");
  report.push(`[ENV BACKEND] .env present: ${bool(rootEnv) ? "YES" : "NO"}`);
  const serverEnvTs = readFile("server/env.ts");
  report.push(`[ENV LOADER] server/env.ts present: ${bool(serverEnvTs) ? "YES" : "NO"}`);

  const frontApiUrl = (envLocal.match(/VITE_API_BASE_URL="?([^"\n]+)"?/) || envDev.match(/VITE_API_BASE_URL=([^\n]+)/) || [])[1]
    || (envLocal.match(/VITE_API_URL="?([^"\n]+)"?/) || envDev.match(/VITE_API_URL=([^\n]+)/) || [])[1];
  const frontWsUrl = (envLocal.match(/VITE_WS_URL="?([^"\n]+)"?/) || envDev.match(/VITE_WS_URL=([^\n]+)/) || [])[1];
  const frontSiteUrl = (envLocal.match(/VITE_SITE_URL="?([^"\n]+)"?/) || envDev.match(/VITE_SITE_URL=([^\n]+)/) || [])[1] || "http://localhost:5173";
  const envFrontPreview = {
    VITE_API_URL: envPreview(frontApiUrl),
    VITE_WS_URL: envPreview(frontWsUrl),
    VITE_SITE_URL: envPreview(frontSiteUrl),
    VITE_SUPABASE_URL: envPreview((envLocal.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/) || envDev.match(/VITE_SUPABASE_URL=([^\n]+)/) || [])[1]),
    VITE_SUPABASE_ANON_KEY: envPreview((envLocal.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/) || envDev.match(/VITE_SUPABASE_ANON_KEY=([^\n]+)/) || [])[1]),
    VITE_SUPABASE_PUBLISHABLE_KEY: envPreview((envLocal.match(/VITE_SUPABASE_PUBLISHABLE_KEY="?([^"\n]+)"?/) || envDev.match(/VITE_SUPABASE_PUBLISHABLE_KEY=([^\n]+)/) || [])[1]),
  };
  report.push(`[ENV FRONTEND PREVIEW] ${JSON.stringify(envFrontPreview)}`);

  const supabaseUrlRaw =
    (rootEnv.match(/SUPABASE_URL="?([^"\n]+)"?/) || [])[1] ||
    (envLocal.match(/VITE_SUPABASE_URL="?([^"\n]+)"?/) || envDev.match(/VITE_SUPABASE_URL=([^\n]+)/) || [])[1] ||
    "";
  const supabaseAnonRaw =
    (rootEnv.match(/SUPABASE_ANON_KEY="?([^"\n]+)"?/) || [])[1] ||
    (envLocal.match(/VITE_SUPABASE_ANON_KEY="?([^"\n]+)"?/) || envDev.match(/VITE_SUPABASE_ANON_KEY=([^\n]+)/) || [])[1] ||
    "";

  const envBackPreview = {
    SUPABASE_URL: envPreview((rootEnv.match(/SUPABASE_URL="?([^"\n]+)"?/) || [])[1]),
    SUPABASE_ANON_KEY: envPreview((rootEnv.match(/SUPABASE_ANON_KEY="?([^"\n]+)"?/) || [])[1]),
    SUPABASE_SERVICE_ROLE_KEY: envPreview((rootEnv.match(/SUPABASE_SERVICE_ROLE_KEY="?([^"\n]+)"?/) || [])[1]),
    DATABASE_URL: envPreview((rootEnv.match(/DATABASE_URL="?([^"\n]+)"?/) || [])[1]),
    SUPABASE_BUCKET: envPreview((rootEnv.match(/SUPABASE_BUCKET="?([^"\n]+)"?/) || [])[1]),
    SUPABASE_BUCKET_PUBLIC: envPreview((rootEnv.match(/SUPABASE_BUCKET_PUBLIC="?([^"\n]+)"?/) || [])[1]),
    CLIENT_URL: envPreview((rootEnv.match(/CLIENT_URL="?([^"\n]+)"?/) || [])[1]),
    ALLOWED_ORIGINS: envPreview((rootEnv.match(/ALLOWED_ORIGINS="?([^"\n]+)"?/) || [])[1]),
    DIAG_AUTH_TOKEN: envPreview((rootEnv.match(/DIAG_AUTH_TOKEN="?([^"\n]+)"?/) || envLocal.match(/DIAG_AUTH_TOKEN="?([^"\n]+)"?/) || [])[1]),
  };
  report.push(`[ENV BACKEND PREVIEW] ${JSON.stringify(envBackPreview)}`);

  const apiBase = frontApiUrl || "http://localhost:8001/api";
  report.push(`[API BASE] ${apiBase}`);

  const health = await ping(apiBase.replace(/\/api$/, "") + "/health");
  report.push(`[API /health] status=${health.status} ok=${health.ok}`);

  const listAuctions = await ping(apiBase + "/auctions");
  report.push(`[API GET /auctions] status=${listAuctions.status} ok=${listAuctions.ok}`);

  const diagTokenRaw =
    (rootEnv.match(/DIAG_AUTH_TOKEN="?([^"\n]+)"?/) || envLocal.match(/DIAG_AUTH_TOKEN="?([^"\n]+)"?/) || [])[1] ||
    "";
  const authHeaders = diagTokenRaw ? { Authorization: `Bearer ${diagTokenRaw}` } : {};

  const originHeader = frontSiteUrl
    ? { Origin: frontSiteUrl, Referer: frontSiteUrl }
    : {};

  let csrfStatus = 0;
  let csrfOk = false;
  let csrfToken = null;
  let cookieJar = null;
  try {
    const res = await fetch(apiBase + "/csrf-token", { headers: { ...authHeaders, ...originHeader } });
    csrfStatus = res.status;
    csrfOk = res.ok;
    cookieJar = res.headers.get('set-cookie') || null;
    if (res.ok) {
      const csrfData = await res.json().catch(() => null);
      csrfToken = csrfData?.csrfToken || null;
    }
  } catch (e) {
    csrfStatus = 0;
    csrfOk = false;
  }
  report.push(`[API GET /csrf-token] status=${csrfStatus} ok=${csrfOk} token=${csrfToken ? "OK" : "MISSING"}`);

  const createAttempt = await testPost(
    apiBase + "/auctions",
    { title: "diag", startingPrice: 10, category: "RACING", endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
    { ...authHeaders, ...originHeader, 'x-test-bypass-auth': 'true', ...(csrfToken && {'x-csrf-token': csrfToken}), ...(cookieJar && {'Cookie': cookieJar}) }
  );
  report.push(`[API POST /auctions] status=${createAttempt.status} ok=${createAttempt.ok} msg=${createAttempt.text || createAttempt.error || ""}`);

  const docUpload = await testUpload(apiBase + "/upload/document", diagTokenRaw, 'application/pdf', 'test.pdf', { auctionId: "00000000-0000-0000-0000-000000000000" }, { ...originHeader, 'x-test-bypass-auth': 'true', ...(csrfToken && {'x-csrf-token': csrfToken}), ...(cookieJar && {'Cookie': cookieJar}) });
  report.push(`[API POST /upload/document] status=${docUpload.status} ok=${docUpload.ok} msg=${docUpload.text || docUpload.error || ""}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const imgUpload = await testUpload(apiBase + "/upload/image", diagTokenRaw, 'image/png', 'test.png', { auctionId: "test-img" }, { ...originHeader, 'x-test-bypass-auth': 'true', ...(csrfToken && {'x-csrf-token': csrfToken}), ...(cookieJar && {'Cookie': cookieJar}) });
  report.push(`[API POST /upload/image] status=${imgUpload.status} ok=${imgUpload.ok} msg=${imgUpload.text || imgUpload.error || ""}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const vidUpload = await testUpload(apiBase + "/upload/video", diagTokenRaw, 'video/mp4', 'test.mp4', { auctionId: "test-vid" }, { ...originHeader, 'x-test-bypass-auth': 'true', ...(csrfToken && {'x-csrf-token': csrfToken}), ...(cookieJar && {'Cookie': cookieJar}) });
  report.push(`[API POST /upload/video] status=${vidUpload.status} ok=${vidUpload.ok} msg=${vidUpload.text || vidUpload.error || ""}`);

  const roleCheck = await fetchSupabaseUserAndRole(supabaseUrlRaw, supabaseAnonRaw, diagTokenRaw);
  if (roleCheck.ok) {
    const canCreate = roleCheck.role === "ADMIN" || roleCheck.role === "USER_FULL_VERIFIED";
    report.push(`[SUPABASE USER] id=${roleCheck.userId}`);
    report.push(`[SUPABASE ROLE] ${roleCheck.role} canCreate=${canCreate ? "YES" : "NO"}`);
  } else {
    report.push(`[SUPABASE ROLE] ERROR ${roleCheck.reason}`);
  }

  const csrf = readFile("server/middleware/csrf.ts");
  const csrfRequiresXHR = csrf.includes('X-Requested-With') && csrf.includes('multipart/form-data');
  report.push(`[CSRF REQUIREMENTS] X-Requested-With multipart required: ${csrfRequiresXHR ? "YES" : "NO"}`);

  const prismaSchema = readFile("server/prisma/schema.prisma");
  const prismaChecks = [
    "model Auction",
    "model AuctionImage",
    "model AuctionVideo",
    "model AuctionDocument",
    "model Bid",
    "model User",
    "model PigeonProfile",
    "enum AuctionStatus",
  ];
  const prismaOk = prismaChecks.every((s) => prismaSchema.includes(s));
  report.push(`[PRISMA MODELS] present: ${prismaOk ? "OK" : "MISSING"}`);

  const caf = readFile("src/components/CreateAuctionForm.tsx");
  const cafImportsOk =
    caf.includes("uploadService") &&
    caf.includes("auctionService") &&
    caf.includes("apiClient") &&
    caf.includes("CreateAuctionForm");
  report.push(`[FRONTEND IMPORTS CreateAuctionForm] ${cafImportsOk ? "OK" : "MISSING/WRONG"}`);

  const us = readFile("src/services/uploadService.ts");
  const usTokenOk = us.includes("supabase.auth.getSession");
  report.push(`[UPLOAD SERVICE TOKEN] ${usTokenOk ? "OK" : "CHECK supabase.auth.getSession"}`);

  const apiClientSrc = readFile("src/services/api.ts");
  const apiHeadersOk = apiClientSrc.includes("X-Requested-With") && apiClientSrc.includes("postFormData");
  report.push(`[API CLIENT HEADERS] multipart/XHR headers: ${apiHeadersOk ? "OK" : "MISSING"}`);


  console.log("=== Diagnostics: Auctions ===");
  report.forEach((line) => console.log(line));
  console.log("Jeśli któryś element = MISSING/CHECK lub status!=200, sprawdź ENV/API/CSRF/Auth i zrestartuj serwer.");
}
if (typeof fetch === "undefined") {
  console.error("Brak globalnego fetch — uruchom Node 18+");
  process.exit(1);
}

main();
