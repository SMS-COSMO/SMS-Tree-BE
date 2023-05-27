import * as trpcExpress from "@trpc/server/adapters/express";
import { createContext } from "./context";
import { AppRouter, appRouter } from "./routers/_app";
import express from "express";
import { env } from "./env";
import { renderTrpcPanel } from "trpc-panel";

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

    // trpc-panel link: https://github.com/iway1/trpc-panel
    if (env.NODE_ENV == "development") {
        app.use("/panel", (_, res) => {
            return res.send(renderTrpcPanel(appRouter, { url: `http://localhost:${process.env.PORT}/trpc` }));
        });
    }

    app.listen(process.env.PORT || 3000, () => console.log("Server is on!"));
}

server().then();
