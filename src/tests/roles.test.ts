import { describe, it, expect } from "vitest";
import { canBid, canCreateAuction } from "@/types/roles";

describe("role permissions", () => {
  it("canBid requires full verification or admin", () => {
    expect(canBid("USER_REGISTERED")).toBe(false);
    expect(canBid("USER_EMAIL_VERIFIED")).toBe(false);
    expect(canBid("USER_FULL_VERIFIED")).toBe(true);
    expect(canBid("ADMIN")).toBe(true);
    expect(canBid(undefined)).toBe(false);
  });

  it("canCreateAuction matches canBid", () => {
    expect(canCreateAuction("USER_EMAIL_VERIFIED")).toBe(false);
    expect(canCreateAuction("USER_FULL_VERIFIED")).toBe(true);
  });
});
