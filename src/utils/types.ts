import { z } from "zod";

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
