import { describe, it, expect } from "vitest";
import {
  hasCompletePayout,
  isValidIban,
  isValidBlikPhone,
  validatePayoutInput,
} from "../utils/sellerPayout.js";

describe("Seller payout", () => {
  it("accepts a Polish IBAN", () => {
    expect(isValidIban("PL61 1090 1014 0000 0712 1981 2874")).toBe(true);
  });

  it("rejects a short IBAN", () => {
    expect(isValidIban("PL123")).toBe(false);
  });

  it("accepts BLIK phone with +48", () => {
    expect(isValidBlikPhone("+48 600 123 456")).toBe(true);
  });

  it("blocks listing without payout", () => {
    expect(hasCompletePayout({ role: "USER_FULL_VERIFIED" })).toBe(false);
  });

  it("allows admin without payout fields", () => {
    expect(hasCompletePayout({ role: "ADMIN" })).toBe(true);
  });

  it("validates mixed payload", () => {
    const ok = validatePayoutInput({
      payoutMethod: "IBAN",
      payoutIban: "pl61109010140000071219812874",
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.data.payoutIban).toBe("PL61109010140000071219812874");
    }
  });
});
