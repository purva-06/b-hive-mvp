import { z } from "zod";

const passwordSchema = z
  .string({
    required_error: "Password is required.",
  })
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password cannot exceed 128 characters.")
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: "Name is required.",
        })
        .trim()
        .min(2, "Name must contain at least 2 characters.")
        .max(80, "Name cannot exceed 80 characters."),

      email: z
        .string({
          required_error: "Email is required.",
        })
        .trim()
        .email("Enter a valid email address.")
        .max(254, "Email is too long.")
        .transform((email) => email.toLowerCase()),

      password: passwordSchema,
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: "Email is required.",
        })
        .trim()
        .email("Enter a valid email address.")
        .transform((email) => email.toLowerCase()),

      password: z
        .string({
          required_error: "Password is required.",
        })
        .min(1, "Password is required."),
    })
    .strict(),
});