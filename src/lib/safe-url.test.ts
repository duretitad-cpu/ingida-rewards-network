import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeWebUrl, safeInviteRedirect } from "./safe-url";

describe("Safe NFC and invitation destinations", () => {
  it("allows secure NFC destinations", () => assert.equal(safeWebUrl("ingida.com/quest"), "https://ingida.com/quest"));
  it("blocks executable and insecure destinations", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,test", "http://ingida.com", "https://user:password@ingida.com"]) assert.equal(safeWebUrl(url), "");
  });
  it("rejects unrelated Lovable invitation destinations", () => assert.equal(safeInviteRedirect("https://unapproved.lovable.app/operators"), "https://www.ingida.com/operators"));
  it("allows the approved project destination", () => assert.equal(safeInviteRedirect("https://ingida-rewards-network.lovable.app/anything"), "https://ingida-rewards-network.lovable.app/operators"));
});