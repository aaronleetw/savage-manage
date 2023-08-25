import { router, permissionProcedure, fillPermissions } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import errorMap from 'zod/lib/locales/en';
import { hash } from 'bcrypt';
import { ZCreateAccType as ZCreateAccType, ZCreateRole, ZCreateUser, ZEditUser } from '@/utils/types';
import resend from '../resend';
import { EmailBase } from '../EmailBase';
import { permissions } from '@/utils/permissions';

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
                            priority: true,
                        },
                        orderBy: {
                            priority: "asc",
                        }
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
                    studentId: true,
                    roles: {
                        select: {
                            name: true,
                            color: true,
                        },
                        orderBy: {
                            priority: "asc",
                        }
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
    getRoles: permissionProcedure("allowViewAllInfo").query(
        async ({ ctx }) => {
            const rawRoles = await ctx.prisma.role.findMany({
                select: {
                    id: true,
                    name: true,
                    color: true,
                    users: {
                        select: {
                            id: true,
                        },
                    }
                },
                orderBy: {
                    priority: "asc",
                }
            });
            const roles = rawRoles.map((role) => {return {
                id: role.id,
                name: role.name,
                color: role.color,
                userCount: role.users.length,
            }});
            return roles;
        }
    ),
    getRolesWithPermissions: permissionProcedure("allowEditUser").query(
        async ({ ctx }) => {
            const selectPermissions: { [key: string]: boolean } = {};
            Object.keys(permissions).forEach((key) => { selectPermissions["" + key] = true; })
            const rawRoles = await ctx.prisma.role.findMany({
                select: {
                    id: true,
                    name: true,
                    color: true,
                    priority: true,
                    users: {
                        select: {
                            id: true,
                        },
                    },
                    ...selectPermissions
                },
                orderBy: {
                    priority: "asc",
                }
            });
            const roles = rawRoles.map((role) => {return {
                userCount: role.users.length,
                ...role
            }});
            return roles;
        }
    ),
    getPermissions: permissionProcedure("allowViewAllInfo").query(
        async () => {
            return permissions;
        }
    ),
    getAccountTypes: permissionProcedure("allowViewAllInfo").query(
        async ({ ctx }) => {
            const rawAccountTypes = await ctx.prisma.accountType.findMany({
                select: {
                    id: true,
                    name: true,
                    color: true,
                    users: {
                        select: {
                            id: true,
                        }
                    }
                },
            });
            const accountTypes = rawAccountTypes.map((accountType) => {return {
                id: accountType.id,
                name: accountType.name,
                color: accountType.color,
                userCount: accountType.users.length,
            }});
            return accountTypes;
        }
    ),
    create: permissionProcedure("allowCreateUser").input(ZCreateUser).mutation(
        async ({ ctx, input }) => {
            const hashedPassword = await new Promise<string>((resolve, reject) => {
                hash(input.password, 10, (err, hash) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(hash);
                });
            });
            await ctx.prisma.user.create({
                data: {
                    studentId: input.studentId,
                    grade: input.grade,
                    class: input.class,
                    number: input.number,
                    chineseName: input.chineseName,
                    englishName: input.englishName,
                    email: input.email,
                    roles: {
                        connect: input.roles.map((role) => ({ name: role })),
                    },
                    accountType: {
                        connect: {
                            name: input.accountType,
                        },
                    },
                    password: hashedPassword,
                },
            });
            if (input.sendEmail) {
                resend.emails.send({
                    from: "SavageManage<savagemanage@rsnd.aaronlee.live>",
                    to: `${input.englishName}<${input.email}>`,
                    subject: "Welcome to SavageManage",
                    react: EmailBase({
                        name: `${input.englishName} [${input.chineseName}]`,
                        htmlContent: `Your account has been created. Here are your credentials. Please change your password after logging in.<br />
                                    <br />Username: ${input.email}<br />Password: ${input.password}<br /><br />You can log in at 
                                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "localhost"}">${process.env.NEXT_PUBLIC_SITE_URL || "localhost"}</a>`,
                    })
                })
            }
            return true;
        }
    ),
    edit: permissionProcedure("allowEditUser").input(ZEditUser).mutation(
        async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findFirst({
                where: {
                    id: input.id,
                },
            });
            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }
            await ctx.prisma.user.update({
                where: {
                    id: input.id,
                },
                data: {
                    studentId: input.studentId,
                    grade: input.grade,
                    class: input.class,
                    number: input.number,
                    chineseName: input.chineseName,
                    englishName: input.englishName,
                    email: input.email,
                    roles: {
                        set: input.roles.map((role) => ({ name: role })),
                    },
                    accountType: {
                        connect: {
                            name: input.accountType,
                        },
                    },
                },
            });
            if (input.sendEmail) {
                resend.emails.send({
                    from: "SavageManage<savagemanage@rsnd.aaronlee.live>",
                    to: `${input.englishName}<${input.email}>`,
                    subject: "Your account has been edited",
                    react: EmailBase({
                        name: `${input.englishName} [${input.chineseName}]`,
                        htmlContent: `Your account has been edited by an administrator. Please check your account to see if everything is correct. Your password has not been changed.`,
                    })
                })
            }
            return true;
        }
    ),
    editAccountType: permissionProcedure("allowEditUser").input(
        z.object({
            id: z.number(),
            name: z.string(),
            color: z.string(),
        })).mutation(async ({ ctx, input }) => {
            await ctx.prisma.accountType.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    color: input.color,
                },
            });
            return true;
        }
    ),
    editRole: permissionProcedure("allowEditUser").input(
        z.object({
            id: z.number(),
            name: z.string(),
            color: z.string(),
            priority: z.number(),
            ...(fillPermissions(z.boolean()))
        })).mutation(async ({ ctx, input }) => {
            const permissionData: {[key:string]: boolean} = {};
            for (const permission in permissions) {
                // @ts-ignore
                permissionData[permission] = input[permission];
            }
            await ctx.prisma.role.update({
                where: {
                    id: input.id,
                },
                data: {
                    name: input.name,
                    color: input.color,
                    priority: input.priority,
                    ...permissionData
                },
            });
            return true;
        }
    ),
    createAccountType: permissionProcedure("allowEditUser").input(ZCreateAccType).mutation(
        async ({ ctx, input }) => {
            await ctx.prisma.accountType.create({
                data: {
                    name: input.name,
                    color: input.color,
                },
            });
            return true;
        }
    ),
    createRole: permissionProcedure("allowEditUser").input(ZCreateRole).mutation(
        async ({ ctx, input }) => {
            await ctx.prisma.role.create({
                data: {
                    name: input.name,
                    color: input.color,
                    priority: input.priority,
                },
            });
            return true;
        }
    ),
    deleteAccountType: permissionProcedure("allowEditUser").input(
        z.object({
            id: z.number(),
        })).mutation(async ({ ctx, input }) => {
            await ctx.prisma.accountType.delete({
                where: {
                    id: input.id,
                },
            });
            return true;
        }
    ),
    deleteRole: permissionProcedure("allowEditUser").input(
        z.object({
            id: z.number(),
        })).mutation(async ({ ctx, input }) => {
            await ctx.prisma.role.delete({
                where: {
                    id: input.id,
                },
            });
            return true;
        }
    ),
    delete: permissionProcedure("allowEditUser").input(
        z.object({
            id: z.number(),
        })).mutation(async ({ ctx, input }) => {
            await ctx.prisma.rSVP.deleteMany({
                where: {
                    userId: input.id,
                },
            });
            await ctx.prisma.attendance.deleteMany({
                where: {
                    userId: input.id,
                },
            });
            await ctx.prisma.user.delete({
                where: {
                    id: input.id,
                },
            });
            return true;
        }
    ),
});
