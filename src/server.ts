import process from 'node:process';
import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import cors from 'cors';
import { renderTrpcPanel } from 'trpc-panel';
import { createContext } from './context';
import { appRouter } from './routers/_app';
import { env } from './env';

function server() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(cors());

    // simple request logger
    app.use((req, _res, next) => {
        console.log('⬅️ ', req.method, req.path, req.body ?? req.query);

        next();
    });

    // trpc middleware
    app.use(
        '/trpc',
        trpcExpress.createExpressMiddleware({
            router: appRouter,
            createContext,
        }),
    );

    // trpc-panel link: https://github.com/iway1/trpc-panel
    if (env.NODE_ENV === 'development') {
        app.use('/panel', (_, res) => {
            return res.send(
                renderTrpcPanel(appRouter, { url: `${env.SERVER_URL}/trpc`, transformer: 'superjson' }),
            );
        });
    }

    app.listen(port, () => console.log(`Server is listening at ${port}!`));
}

server();
