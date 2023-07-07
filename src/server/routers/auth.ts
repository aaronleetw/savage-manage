import { router, publicProcedure, loggedInProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { PublicUserType } from '@/utils/types';

export const authRouter = router({
    login: publicProcedure.input(
        z.object({
            email: z.string().email(),
            password: z.string(),
        })).mutation(async (opt) => {
            const user = await opt.ctx.prisma.user.findFirst({
                where: {
                    email: opt.input.email,
                },
                select: {
                    id: true,
                    grade: true,
                    class: true,
                    number: true,
                    chineseName: true,
                    englishName: true,
                    roles: {
                        select: {
                            name: true,
                            color: true
                        }
                    },
                    accountType: {
                        select: {
                            name: true,
                            color: true
                        }
                    },
                    email: true,
                    password: true,
                }
            });
            if (!user) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Please check your credentials" });
            }
            // verify password hash with bcrypt
            const valid = await bcrypt.compare(opt.input.password, user.password);
            if (!valid) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Please check your credentials" });
            }
            const session = PublicUserType.parse({
                user: {
                    id: user.id,
                    grade: user.grade,
                    class: user.class,
                    number: user.number,
                    chineseName: user.chineseName,
                    englishName: user.englishName,
                    email: user.email,
                    roles: user.roles,
                    accountType: user.accountType,
                }
            })
            if (session == undefined) {
                throw new TRPCError({ code: "UNAUTHORIZED", message: "Please check your credentials" });
            }
            // create jwt
            const token = jsonwebtoken.sign(session, process.env.JWT_SECRET || "", { expiresIn: "1d" });
            opt.ctx.res.setHeader("Set-Cookie", `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24};`);
            return user;
        }),
    getSession: loggedInProcedure.query(
        async (opt) => {
            return opt.ctx.session?.user;
        }
    ),
    isValid: publicProcedure.query(
        async (opt) => {
            if (opt.ctx.session) {
                return true;
            } else {
                return false;
            }
        }),
    logout: loggedInProcedure.mutation(
        async (opt) => {
            opt.ctx.res.setHeader("Set-Cookie", `token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;`);
            return true;
        }),
});
