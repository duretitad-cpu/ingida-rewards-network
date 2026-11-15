import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { questSchema } from "./quest-schema";

describe("Quest Ethiopian signup", () => {
  it("normalizes local 09 numbers to Ethiopian country code", () => {
    assert.equal(questSchema.parse({ name: "Guest", phone: "0911234567" }).phone, "+251 911 234 567");
  });
  it("normalizes local 07 numbers to Ethiopian country code", () => {
    assert.equal(questSchema.parse({ name: "Guest", phone: "0712345678" }).phone, "+251 712 345 678");
  });
  it("accepts the +251 international form", () => {
    assert.equal(questSchema.parse({ name: "Guest", phone: "+251911234567" }).phone, "+251 911 234 567");
  });
  it("rejects foreign country codes", () => {
    assert.equal(questSchema.safeParse({ name: "Guest", phone: "+14155550100" }).success, false);
  });
});