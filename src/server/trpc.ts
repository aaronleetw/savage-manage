import { Prisma } from '@prisma/client';
import { initTRPC, TRPCError } from '@trpc/server';
import SuperJSON from 'superjson';
import { Context } from './context';
 
const t = initTRPC.context<Context>().create({
  transformer: SuperJSON
});

// Base router and procedure helpers
export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;

const isValid = middleware(async (opts) => {
  const { ctx } = opts;
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in" });
  }
  return opts.next(opts);
})

const hasPermission = (permission: string) => {
  return middleware(async (opts) => {
    const { ctx } = opts;
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in" });
    }
    for (const role in ctx.session?.user?.roles) {
      const data = await ctx.prisma.$queryRawUnsafe<any>(
        `SELECT "${permission}" FROM roles WHERE name='${ctx.session.user.roles[role].name}'`)
      if (data[0][permission]) {
        return opts.next(opts);
      }
    }
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You do not have permission to do this" });
  })
}

export const loggedInProcedure = publicProcedure.use(isValid);
export const permissionProcedure = (permission: string) => {
  return publicProcedure.use(hasPermission(permission));
}
