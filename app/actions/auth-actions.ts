"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

import { loginSchema } from "@/lib/validations/auth";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    const rawData = Object.fromEntries(formData.entries());
    const validation = loginSchema.safeParse(rawData);

    if (!validation.success) {
        return "Invalid email or password format.";
    }

    try {
        // Use validated data instead of raw formData
        await signIn("credentials", {
            ...validation.data,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}
