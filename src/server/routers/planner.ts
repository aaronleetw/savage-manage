import { router, publicProcedure, loggedInProcedure, permissionProcedure, hasPermissionInProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const plannerRouter = router({
    getMany: loggedInProcedure.input(
        z.object({
            startAt: z.date(),
            endAt: z.date(),
        })
    ).query(async ({ ctx, input }) => {
        let events;
        if (await hasPermissionInProcedure("allowViewAllInfo", ctx)) {
            events = await ctx.prisma.event.findMany({
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
        } else {
            events = await ctx.prisma.event.findMany({
                where: {
                    startAt: {
                        gte: input.startAt,
                        lte: input.endAt,
                    },
                    OR: [{
                        allowedUsers: {
                            some: {
                                id: ctx.session?.user.id,
                            },
                        },
                    },
                    {
                        rsvp: {
                            some: {
                                user: {
                                    id: ctx.session?.user.id,
                                },
                            },
                        }
                    }]
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
        }
        return events;
    }),
    get: loggedInProcedure.input(
        z.object({
            id: z.number(),
        })
    ).query(async ({ ctx, input }) => {
        const selection = {
            id: true,
            name: true,
            description: true,
            color: true,
            startAt: true,
            endAt: true,
            useRSVP: true,
            rsvpBefore: true,
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
            attendanceTimeout: true,
        }
        let event;
        if (await hasPermissionInProcedure("allowViewAllInfo", ctx)) {
            event = await ctx.prisma.event.findFirst({
                where: {
                    id: input.id,
                },
                select: selection,
            });
        } else {
            event = await ctx.prisma.event.findFirst({
                where: {
                    id: input.id,
                    OR: [{
                        allowedUsers: {
                            some: {
                                id: ctx.session?.user.id,
                            },
                        },
                    },
                    {
                        rsvp: {
                            some: {
                                user: {
                                    id: ctx.session?.user.id,
                                },
                            },
                        }
                    }]
                },
                select: selection,
            });
        }
        return event;
    }),
    delete: permissionProcedure("allowEditEvent").input(
        z.object({
            id: z.number(),
        })
    ).mutation(async ({ ctx, input }) => {
        await ctx.prisma.rSVP.deleteMany({
            where: {
                eventId: input.id,
            },
        });

        await ctx.prisma.attendance.deleteMany({
            where: {
                eventId: input.id,
            },
        });

        const event = await ctx.prisma.event.delete({
            where: {
                id: input.id,
            }
        });
        return event;
    }),
    create: permissionProcedure("allowCreateEvent").input(
        z.object({
            name: z.string(),
            description: z.string(),
            start: z.string(),
            end: z.string().regex(/^([0-9]+):([0-9]+)$/),
            color: z.string(),
            useAttendance: z.boolean(),
            attendanceTimeout: z.number().nullable(),

            useRSVP: z.boolean(),
            allowedUsers: z.array(z.number()).nullable(),
            rsvpBefore: z.number().nullable(),

            confirmedRSVP: z.array(z.number()).nullable() // User IDs,
        })
    ).mutation(async ({ ctx, input }) => {
        if (input.useRSVP && input.rsvpBefore === null) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "RSVP must have a deadline",
            });
        }
        input.start.split(',').map(async (val: string) => {
            let date = new Date(val);
            if (date.toString() === "Invalid Date") {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid start datetime",
                });
            }
            const startTime = new Date(date);
            let duration = input.end.split(':');
            date.setHours(date.getHours() + parseInt(duration[0]));
            date.setMinutes(date.getMinutes() + parseInt(duration[1]));
            const endTime = new Date(date);

            await ctx.prisma.event.create({
                data: {
                    name: input.name,
                    description: input.description,
                    color: input.color,
                    startAt: startTime,
                    endAt: endTime,
                    useAttendance: input.useAttendance,
                    attendanceTimeout: input.attendanceTimeout,
                    useRSVP: input.useRSVP,
                    allowedUsers: {
                        connect: input.allowedUsers?.map((val: number) => {
                            return {
                                id: val,
                            }
                        })
                    },
                    rsvp: {
                        create: input.confirmedRSVP?.map((val: number) => {
                            return {
                                user: {
                                    connect: {
                                        id: val,
                                    }
                                },
                                confirmed: true,
                            }
                        }),
                    },
                }
            })
        })
    }),
    adminEditRsvp: permissionProcedure("allowEditEvent").input(
        z.object({
            eventId: z.number(),
            userId: z.number(),
            status: z.number().int().min(-1).max(2),
        })
    ).mutation(async ({ ctx, input }) => {
        const currentRSVP = await ctx.prisma.rSVP.findFirst({
            where: {
                eventId: input.eventId,
                userId: input.userId,
            },
        });
        if (currentRSVP === null) {
            if (input.status !== -1 && input.status !== 0)
                await ctx.prisma.rSVP.create({
                    data: {
                        event: {
                            connect: {
                                id: input.eventId,
                            }
                        },
                        user: {
                            connect: {
                                id: input.userId,
                            }
                        },
                        confirmed: input.status === 2,
                    }
                });
            else if (input.status == 0)
                await ctx.prisma.event.update({
                    where: {
                        id: input.eventId,
                    },
                    data: {
                        allowedUsers: {
                            connect: {
                                id: input.userId,
                            }
                        }
                    }
                });
            else
                await ctx.prisma.event.update({
                    where: {
                        id: input.eventId,
                    },
                    data: {
                        allowedUsers: {
                            disconnect: {
                                id: input.userId,
                            }
                        }
                    }
                });
        } else if (currentRSVP !== null) {
            if (input.status === -1) {
                await ctx.prisma.rSVP.delete({
                    where: {
                        id: currentRSVP.id,
                    }
                });
                await ctx.prisma.event.update({
                    where: {
                        id: input.eventId,
                    },
                    data: {
                        allowedUsers: {
                            disconnect: {
                                id: input.userId,
                            }
                        }
                    }
                })
            } else if (input.status === 0) {
                await ctx.prisma.rSVP.delete({
                    where: {
                        id: currentRSVP.id,
                    }
                });
                await ctx.prisma.event.update({
                    where: {
                        id: input.eventId,
                    },
                    data: {
                        allowedUsers: {
                            connect: {
                                id: input.userId,
                            }
                        }
                    }
                })
            } else {
                await ctx.prisma.rSVP.update({
                    where: {
                        id: currentRSVP.id,
                    },
                    data: {
                        confirmed: input.status === 2,
                    }
                });
            }
        } else {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid RSVP status",
            });
        }
        return true;
    }),

    edit: permissionProcedure("allowEditEvent").input(
        z.object({
            id: z.number(),
            name: z.string(),
            description: z.string(),
            start: z.string(),
            end: z.string(),
            color: z.string(),
            useAttendance: z.boolean(),
            attendanceTimeout: z.number().nullable(),
            useRSVP: z.boolean(),
            rsvpBefore: z.number().nullable(),
        })
    ).mutation(async ({ ctx, input }) => {
        let startTime = new Date(input.start);
        let endTime = new Date(input.end);
        if (startTime.toString() === "Invalid Date" || endTime.toString() === "Invalid Date") {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid start datetime",
            });
        }
        if (endTime < startTime) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "End time must be after start time",
            });
        }
        await ctx.prisma.event.update({
            where: {
                id: input.id,
            },
            data: {
                name: input.name,
                description: input.description,
                color: input.color,
                startAt: startTime,
                endAt: endTime,
                useAttendance: input.useAttendance,
                attendanceTimeout: input.attendanceTimeout,
                useRSVP: input.useRSVP,
                rsvpBefore: input.rsvpBefore,
            }
        });
        return true;
    }),
});