import express, { type Router, type Request, type Response } from "express";
import { prisma } from "../lib/db.js";
import { authMiddleware } from "../middleware/auth.js";
import { dataFetchLimiter } from "../middleware/rateLimiter.js";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router: Router = express.Router();

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

const parseMeetingPayload = (raw: any) => {
  if (typeof raw?.data === "string") {
    try {
      return { ...JSON.parse(raw.data), files: raw.images };
    } catch {
      return raw;
    }
  }
  return raw;
};

// GET ALL
router.get("/", dataFetchLimiter, async (req: Request, res: Response) => {
  try {
    if (prisma) {
      try {
        const dbMeetings = await prisma.meeting.findMany({
          orderBy: { createdAt: "desc" },
        });
        if (dbMeetings.length > 0) return res.json(dbMeetings);
      } catch (dbErr) {
        console.warn(
          "DB fetch for meetings failed, falling back to file",
          dbErr,
        );
      }
    }

    const meetingsPath = getLocalDataPath("meetings.json");
    if (!fs.existsSync(meetingsPath)) return res.json([]);

    const meetingsData = await fs.promises.readFile(meetingsPath, "utf-8");
    const meetings = JSON.parse(meetingsData);
    res.json(meetings.meetings || []);
  } catch (error: any) {
    console.error("Error reading meetings data:", error);
    res
      .status(500)
      .json({ error: `Failed to load meetings data: ${error.message}` });
  }
});

// CREATE
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!prisma)
      return res.status(503).json({ error: "Baza danych jest niedostępna." });

    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Brak autoryzacji." });

    const { name, location, date, description, images } = req.body;
    if (!name || !location)
      return res
        .status(400)
        .json({ error: "Nazwa i lokalizacja są wymagane." });

    let parsedDate: Date | null = null;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime()))
        return res.status(400).json({ error: "Nieprawidłowy format daty." });
    }

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists)
      return res
        .status(403)
        .json({ error: "Profil nie został zsynchronizowany." });

    const newMeeting = await prisma.meeting.create({
      data: {
        name,
        location,
        date: parsedDate,
        description,
        images: Array.isArray(images) ? images : [],
        authorId: userId,
      },
    });

    res.status(201).json(newMeeting);
  } catch (error: any) {
    console.error("Error adding breeder meeting:", error);
    res
      .status(500)
      .json({
        error: "Nie udało się dodać spotkania.",
        details: error.message,
      });
  }
});

// UPDATE
router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  if (!prisma)
    return res.status(503).json({ error: "Baza danych jest niedostępna." });
  const payload = parseMeetingPayload(req.body);
  const { id } = req.params;

  const meetingSchema = z
    .object({
      name: z.string().min(1).optional(),
      location: z.string().min(1).optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      images: z.array(z.string()).optional(),
      existingImages: z.array(z.string()).optional(),
    })
    .passthrough();

  const parsed = meetingSchema.safeParse(payload);
  if (!parsed.success)
    return res.status(400).json({ error: "Nieprawidłowe dane wejściowe." });

  const mergedImages =
    parsed.data.images ||
    parsed.data.existingImages ||
    (Array.isArray((payload as any)?.files)
      ? (payload as any).files
      : undefined);

  try {
    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        name: parsed.data.name,
        location: parsed.data.location,
        description: parsed.data.description,
        date: parsed.data.date ? new Date(parsed.data.date) : undefined,
        images: mergedImages,
      },
    });
    return res.json(updated);
  } catch (error: any) {
    console.error("Error updating meeting:", error);
    return res
      .status(500)
      .json({
        error: "Nie udało się zaktualizować spotkania.",
        details: error.message,
      });
  }
});

// DELETE
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  if (!prisma)
    return res.status(503).json({ error: "Baza danych jest niedostępna." });
  const { id } = req.params;
  try {
    await prisma.meeting.delete({ where: { id } });
    return res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting meeting:", error);
    return res
      .status(500)
      .json({
        error: "Nie udało się usunąć spotkania.",
        details: error.message,
      });
  }
});

export default router;
