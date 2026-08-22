import { describe, expect, it } from "vitest";

function deriveFinancialTotals(donations: Array<{ amountPaise: number; status: string; memberId: number }>, expenses: Array<{ amountPaise: number }>) {
  const successful = donations.filter(donation => donation.status === "successful");
  const totalRaisedPaise = successful.reduce((sum, donation) => sum + donation.amountPaise, 0);
  const totalSpentPaise = expenses.reduce((sum, expense) => sum + expense.amountPaise, 0);
  return { totalRaisedPaise, totalSpentPaise, balancePaise: totalRaisedPaise - totalSpentPaise, donorCount: new Set(successful.map(donation => donation.memberId)).size };
}

describe("derived financial totals", () => {
  it("includes only successful donations and derives balance from source records", () => {
    expect(deriveFinancialTotals([
      { amountPaise: 5000, status: "successful", memberId: 1 },
      { amountPaise: 1000, status: "pending", memberId: 2 },
      { amountPaise: 3000, status: "successful", memberId: 1 },
      { amountPaise: 2500, status: "failed", memberId: 3 },
    ], [{ amountPaise: 2400 }, { amountPaise: 600 }])).toEqual({ totalRaisedPaise: 8000, totalSpentPaise: 3000, balancePaise: 5000, donorCount: 1 });
  });
});
