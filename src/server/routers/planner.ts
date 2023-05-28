import { router, publicProcedure, loggedInProcedure, permissionProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { PublicUserType } from '@/utils/types';

export const plannerRouter = router({
    getMany: permissionProcedure("allowViewEvent").input(
        z.object({
            startAt: z.date(),
            endAt: z.date(),
        })
    ).query(async( { ctx, input }) => {
        const events = await ctx.prisma.event.findMany({
            where: {
                startAt: {
                    gte: input.startAt,
                    lte: input.endAt,
                },
            },
            select: {
                id: true,
                name: true,
                description: true,
                color: true,
                startAt: true,
                endAt: true,
            }
        });
        return events;
    }),
    get: permissionProcedure("allowViewEvent").input(
        z.object({
            id: z.number(),
        })
    ).query(async( { ctx, input }) => {
        const event = await ctx.prisma.event.findFirst({
            where: {
                id: input.id,
            },
            select: {
                id: true,
                name: true,
                description: true,
                color: true,
                startAt: true,
                endAt: true,
                useRSVP: true,
                allowedUsers: {
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
                },
                rsvp: {
                    select: {
                        id: true,
                        user: {
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
                        },
                        confirmed: true,
                    },
                },
                useAttendance: true,
            }
        });
        return event;
    }),
    delete: permissionProcedure("allowEditEvent").input(
        z.object({
            id: z.number(),
        })
    ).mutation(async( { ctx, input }) => {
        const event = await ctx.prisma.event.delete({
            where: {
                id: input.id,
            }
        });
        return event;
    }),
    create: permissionProcedure("allowCreateEvent").input(
        z.object({
            // TODO:
        })
    ).mutation(async( { ctx, input }) => {
        // TODO:
    }),
});