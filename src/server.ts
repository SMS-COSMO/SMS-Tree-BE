import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { AppRouter, appRouter } from "./routers/_app";
import express from "express";

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
    app.listen(process.env.PORT || 3000, () => console.log("Server is on!"));
}

server().then();
