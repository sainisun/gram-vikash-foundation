import { describe, expect, it } from "vitest";
import { GET } from "../app/api/summary/route";

describe("public summary API", () => {
  it("returns the documented snake_case transparency contract", async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual(expect.objectContaining({ total_raised_paise: expect.any(Number), total_spent_paise: expect.any(Number), balance_paise: expect.any(Number), donor_count: expect.any(Number), generated_at: expect.any(String) }));
  });
});
