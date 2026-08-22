import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function authenticatedContext(): TrpcContext {
  return {
    user: {
      id: 991,
      openId: "test-member",
      name: "Test Member",
      email: "member@example.invalid",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("gated payment procedure", () => {
  it("rejects checkout preparation before the live-payment prerequisite gate opens", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.payments.prepareCheckout({ amountPaise: 10000 })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
