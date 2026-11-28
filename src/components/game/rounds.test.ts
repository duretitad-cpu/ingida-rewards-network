import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ROUNDS } from "./rounds";

describe("Quest fold order", () => {
  it("asks redeem before the alerts fold", () => {
    assert.deepEqual(ROUNDS.map((r) => r.key), ["lifestyle", "monthly", "earn", "redeem", "alerts"]);
  });
  it("numbers every fold out of five", () => {
    for (const r of ROUNDS) assert.match(r.eyebrow, /of 5$/);
  });
  it("gives redeem one option set per category, four options each", () => {
    const redeem = ROUNDS.find((r) => r.key === "redeem");
    assert.equal(redeem?.labelsByCategory?.length, 4);
    for (const set of redeem?.labelsByCategory ?? []) assert.equal(set.length, 4);
  });
  it("asks where players want to earn INGIDA points", () => {
    const earn = ROUNDS.find((r) => r.key === "earn");
    assert.equal(earn?.prompt, "Where Would You Like To Earn INGIDA Points?");
    assert.deepEqual(earn?.parts, ["Where Would You Like To ", "Earn", " INGIDA Points?"]);
  });
});
