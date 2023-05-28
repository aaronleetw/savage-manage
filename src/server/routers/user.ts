import { router, permissionProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
    all: permissionProcedure("allowViewAllInfo").query(
        async ({ ctx }) => {
            const users = await ctx.prisma.user.findMany({
                select: {
                    id: true,
                    grade: true,
                    class: true,
                    number: true,
                    chineseName: true,
                    englishName: true,
                    email: true,
                    roles: {
                        select: {
                            name: true,
                            color: true,
                        },
                    },
                    accountType: {
                        select: {
                            name: true,
                            color: true,
                        },
                    },
                },
            });
            return users;
        }
    ),
    get: permissionProcedure("allowViewAllInfo").input(
        z.object({
            id: z.number(),
        })).query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findFirst({
                where: {
                    id: input.id,
                },
                select: {
                    id: true,
                    grade: true,
                    class: true,
                    number: true,
                    chineseName: true,
                    englishName: true,
                    email: true,
                    roles: {
                        select: {
                            name: true,
                            color: true,
                        },
                    },
                    accountType: {
                        select: {
                            name: true,
                            color: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }
            return user;
        }
        ),
});
