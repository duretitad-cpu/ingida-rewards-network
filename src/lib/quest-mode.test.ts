import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { questCompletion } from "./quest-mode";

describe("Quest reward mode", () => {
  it("ends a no-rewards signup with thanks, not a merch claim", () => {
    assert.equal(questCompletion(false), "thanks");
  });
  it("keeps inventory rewards available when enabled", () => {
    assert.equal(questCompletion(true), "reward");
  });
});