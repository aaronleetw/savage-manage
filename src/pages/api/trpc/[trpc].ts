import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/routers/_app';
import { NextApiRequest, NextApiResponse } from 'next';
import { myCreateContext } from '@/server/context'

// create the API handler, but don't return it yet
const nextApiHandler = createNextApiHandler({
    router: appRouter,
    createContext: myCreateContext,
    onError(opts) {
        const { error, type, path, input, ctx, req } = opts;
        console.error('Error:', error);
        if (error.code === 'INTERNAL_SERVER_ERROR') {
          // send to bug reporting
        }
    },
});

// @see https://nextjs.org/docs/api-routes/introduction
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    // Allow-Origin has to be set to the requesting domain that you want to send the credentials back to
    res.setHeader('Access-Control-Allow-Origin', '*'); // TODO: change this to the domain you want to allow
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    // finally pass the request on to the tRPC handler
    return nextApiHandler(req, res);
}
