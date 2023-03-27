import { test, expect } from "@playwright/test";
import { inferProcedureInput } from "@trpc/server";
import { AppRouter, appRouter } from "../src/routers/_app";
import { createInnerContext } from "../src/context";

test("user login", async ({ page }) => {
    const ctx = createInnerContext({});
    const caller = appRouter.createCaller(ctx);
    const input: inferProcedureInput<AppRouter["user"]["login"]> = {
        username: "linotest",
        password: "asdfasdf",
    };
    let result = await caller.user.login(input);
    console.log(result);
});
