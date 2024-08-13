import {z} from "zod";

const requiredString = z.string().trim().min(1, "Required")

export const signupSchema = z.object({
    email: requiredString.email("Invalid email"),
    username: requiredString.regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens"
    ),
    password: requiredString.min(8, "Password must be at least 8 characters long")
});

export type signupValues = z.infer<typeof signupSchema>

export const loginSchema = z.object({
    username: requiredString,
    password: requiredString
})

export type LoginValues = z.infer<typeof loginSchema>;