// import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { router } from "./trpc";
import { createContext } from "./context";
import { userRouter } from "./routers/user";
import { testRouter } from "./routers/test";
import express from "express";

const appRouter = router({
    // status: publicProcedure.query(() => "Hola! This is working"),
    user: userRouter,
    test: testRouter,
});

export type AppRouter = typeof appRouter;

async function server() {
    const app = express();

    // simple request logger
    app.use((req, _res, next) => {
        console.log("⬅️ ", req.method, req.path, req.body ?? req.query);

        next();
    });

    // trpc middleware
    app.use(
        "/trpc",
        trpcExpress.createExpressMiddleware({
            router: appRouter,
            createContext,
        })
    );
    app.listen(process.env.PORT || 3000, () => console.log("hello"));
}

server().then();
