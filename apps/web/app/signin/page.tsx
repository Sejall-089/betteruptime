"use client";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, SigninInput } from "@repo/common";

export default function SignInPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<SigninInput>({
    resolver: zodResolver(SignInSchema),
  });

  async function onSubmit(data: SigninInput) {
    try {
      const response = await axios.post(`${BACKEND_URL}/signin`, data);

      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-6 py-12">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-10">
          <Brand />
        </div>

        <div className="card p-7">
          <h1 className="font-display font-semibold text-[22px] mb-1">
            Sign in
          </h1>
          <p className="text-ink2 text-[14px] mb-6">Welcome back.</p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="field-label">Email</label>
              <input
                type="email"
                {...register("email")}
                placeholder="you@domain.com"
                className="w-full rounded-md border border-[#1e1e1e] bg-[#0d0d0d] px-3 py-2 font-mono text-[12px] text-[#d0d0d0] outline-none"
              />

              {errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="field-label">Password</label>
                <Link href="#" className="text-[13px] text-brand">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="w-full rounded-md border border-[#1e1e1e] bg-[#0d0d0d] px-3 py-2 font-mono text-[12px] text-[#d0d0d0] outline-none"
              />

              {errors.password && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary mt-2"
            >
              {isSubmitting ? "Signing in..." : "Sign in →"}
            </button>
          </form>
        </div>

        <p className="text-center text-[14px] text-ink2 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
