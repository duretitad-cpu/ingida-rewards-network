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
  it("formats 0911… as +251 911 …", () => assert.equal(waitlistSchema.parse({ ...member, phone: "0911234567" }).phone, "+251 911 234 567"));
  it("formats 2517… as +251 7…", () => assert.equal(waitlistSchema.parse({ ...member, phone: "251712345678" }).phone, "+251 712 345 678"));
  it("rejects non-Ethiopian numbers", () => assert.equal(waitlistSchema.safeParse({ ...member, phone: "+14155550100" }).success, false));
  it("rejects filled bot field", () => assert.equal(waitlistSchema.safeParse({ ...member, website: "spam" }).success, false));
});
