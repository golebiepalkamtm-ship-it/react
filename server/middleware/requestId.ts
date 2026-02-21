import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

const HEADER_NAME = "x-request-id";

declare module "express-serve-static-core" {
  interface Request {
    traceId?: string;
  }
}

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const incoming = req.get(HEADER_NAME);
  const traceId = incoming && incoming.trim().length > 0 ? incoming : randomUUID();
  req.traceId = traceId;
  res.setHeader(HEADER_NAME, traceId);
  next();
};
