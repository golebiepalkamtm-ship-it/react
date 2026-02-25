import express, { type Router } from "express";
import { prisma } from "../lib/db.js";
import { validatedEnv } from "../lib/env.js";
import {
  createAuctionError,
  AuctionErrorCodes,
} from "../utils/auctionErrors.js";
import Stripe from "stripe";

const router: Router = express.Router();
const stripe = new Stripe(validatedEnv.STRIPE_SECRET_KEY);

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: any, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = validatedEnv.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (!req.body) {
        throw new Error("Request body is missing");
      }
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res
        .status(400)
        .json({ error: "Webhook signature verification failed" });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        try {
          const auctionId = session.metadata?.auction_id;
          const winnerId = session.metadata?.user_id;
          if (!auctionId || !winnerId) {
            console.error("Missing auction_id or user_id in session metadata");
            return res.status(400).json({ error: "Missing metadata" });
          }

          const updatedAuction = await prisma.auction.update({
            where: { id: auctionId },
            data: {
              status: "ENDED",
              winnerId: winnerId,
            },
          });

          console.log("Auction updated via webhook:", updatedAuction.id);
        } catch (error) {
          console.error("Error updating auction:", error);
          return res.status(500).json({ error: "Internal server error" });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  },
);

export default router;
