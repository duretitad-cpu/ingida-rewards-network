import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { waitlistSchema } from "./waitlist-schema";

const member = { name: "Test guest", email: "guest@example.com", phone: "+251911000000", role: "member", alerts: "yes" };
const merchant = { name: "Test host", email: "host@example.com", phone: "+251911000001", role: "merchant", business_name: "Tomoca" };
describe("waitlist CRM", () => {
  it("member alerts yes is stored as true", () => assert.equal(waitlistSchema.parse(member).wants_alerts, true));
  it("member alerts no is stored as false", () => assert.equal(waitlistSchema.parse({ ...member, alerts: "no" }).wants_alerts, false));
  it("member must choose alerts", () => assert.equal(waitlistSchema.safeParse({ ...member, alerts: undefined }).success, false));
  it("merchant keeps business name", () => assert.equal(waitlistSchema.parse(merchant).business_name, "Tomoca"));
  it("merchant requires business name", () => assert.equal(waitlistSchema.safeParse({ ...merchant, business_name: "" }).success, false));
  it("rejects other roles", () => assert.equal(waitlistSchema.safeParse({ ...member, role: "admin" }).success, false));
  it("rejects invalid email", () => assert.equal(waitlistSchema.safeParse({ ...member, email: "invalid" }).success, false));
  it("rejects filled bot field", () => assert.equal(waitlistSchema.safeParse({ ...member, website: "spam" }).success, false));
});
