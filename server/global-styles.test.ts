import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalStyles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("global stylesheet compatibility", () => {
  it("uses the broadly supported flex-start value for flex alignment", () => {
    expect(globalStyles).not.toContain("align-items:start");
    expect(globalStyles).toContain("align-items:flex-start");
  });
});
