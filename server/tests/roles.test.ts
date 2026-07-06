import { describe, it, expect } from "vitest";
import { canBid, canCreateAuction } from "../types/roles.js";

describe("server role permissions", () => {
  it("canBid requires USER_FULL_VERIFIED or ADMIN", () => {
    expect(canBid("USER_REGISTERED")).toBe(false);
    expect(canBid("USER_EMAIL_VERIFIED")).toBe(false);
    expect(canBid("USER_FULL_VERIFIED")).toBe(true);
    expect(canBid("ADMIN")).toBe(true);
  });

  it("canCreateAuction matches canBid", () => {
    expect(canCreateAuction("USER_FULL_VERIFIED")).toBe(true);
    expect(canCreateAuction("USER_REGISTERED")).toBe(false);
  });
});
