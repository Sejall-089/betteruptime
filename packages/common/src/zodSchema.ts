import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name too short"),
});

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const WebsiteSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const WebsiteTickSchema = z.object({
  status: z.enum(["UP", "DOWN"]),
  latency: z.number().optional(),
  checkedAt: z.date(),
});

export type SignupInput = z.infer<typeof SignUpSchema>;

export type SigninInput = z.infer<typeof SignInSchema>;
