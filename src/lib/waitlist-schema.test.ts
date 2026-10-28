import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { waitlistSchema } from "./waitlist-schema";

const entry = { name: "Test guest", email: "guest@example.com", phone: "+251911000000", city: "Addis Ababa", role: "member" };
describe("waitlist CRM", () => {
  it("accepts member requests", () => assert.equal(waitlistSchema.parse(entry).role, "member"));
  it("accepts merchant requests", () => assert.equal(waitlistSchema.parse({ ...entry, role: "merchant" }).role, "merchant"));
  it("rejects other roles", () => assert.equal(waitlistSchema.safeParse({ ...entry, role: "admin" }).success, false));
  it("rejects invalid email", () => assert.equal(waitlistSchema.safeParse({ ...entry, email: "invalid" }).success, false));
  it("rejects filled bot field", () => assert.equal(waitlistSchema.safeParse({ ...entry, website: "spam" }).success, false));
});