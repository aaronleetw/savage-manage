import { z, ZodError } from "zod";

export const PublicUserType = z.object({
    user: z.object({
        id: z.number(),
        grade: z.number(),
        class: z.enum(["HO", "PING"]),
        number: z.number(),
        chineseName: z.string(),
        englishName: z.string(),
        email: z.string(),
        roles: z.array(z.object({
            name: z.string(),
            color: z.string(),
        })),
        accountType: z.object({
            name: z.string(),
            color: z.string(),
        }).nullable(),
    }),
}).or(z.undefined());

export const ZCreateUser = z.object({
    grade: z.number(),
    class: z.enum(["HO", "PING"]),
    studentId: z.string(),
    password: z.string().min(6),
    number: z.number(),
    chineseName: z.string(),
    englishName: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
    accountType: z.string(),
    sendEmail: z.boolean(),
})

export const ZEditUser = z.object({
    id: z.number(),
    grade: z.number(),
    class: z.enum(["HO", "PING"]),
    studentId: z.string(),
    number: z.number(),
    chineseName: z.string(),
    englishName: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
    accountType: z.string(),
    sendEmail: z.boolean(),
})

export const ZCreateAccType = z.object({
    name: z.string(),
    color: z.string(),
})

export const ZCreateRole = z.object({
    name: z.string(),
    color: z.string(),
    priority: z.number().int(),
})