import express, { type Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validation.js";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../lib/db.js";
import { censorText } from "../utils/antiCircumvention.js";

const router: Router = express.Router();

const messageCreateSchema = z.object({
  recipientId: z.string().uuid(),
  conversationId: z.string().uuid().optional(),
  content: z
    .string()
    .trim()
    .min(1, "Treść nie może być pusta")
    .max(1000, "Za długa wiadomość"),
});

const messagesQuerySchema = z.object({
  conversationId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

router.get(
  "/",
  authMiddleware,
  validate(messagesQuerySchema, { sanitize: true }),
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { conversationId, limit } = req.query as any;

    // prisma client may require regen after schema update; cast to any to avoid type errors until prisma generate
    const messages = await (prisma as any).message.findMany({
      where: {
        OR: [{ senderId: userId }, { recipientId: userId }],
        ...(conversationId ? { conversationId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json(messages);
  },
);

router.post(
  "/",
  authMiddleware,
  validate(messageCreateSchema, { sanitize: true }),
  async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?.id;
    if (!senderId) return res.status(401).json({ error: "Unauthorized" });

    const { recipientId, conversationId, content } = req.body;

    const created = await (prisma as any).message.create({
      data: {
        senderId,
        recipientId,
        conversationId,
        content: censorText(content),
      },
    });

    res.status(201).json(created);
  },
);

export default router;
