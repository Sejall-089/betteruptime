"use client";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/config";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignUpSchema, SignupInput } from "@repo/common";

export default function SignUpPage() {
  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignUpSchema),
  });
  const router = useRouter();

  async function onSubmit(data: SignupInput) {
    try {
      await axios.post(`${BACKEND_URL}/signup`, data);
      router.push("/signin");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
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
            Create your account
          </h1>
          <p className="text-ink2 text-[14px] mb-6">
            10 monitors free, forever.
          </p>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-1.5">
              <label className="field-label">Name</label>
              <input
                {...register("name")}
                placeholder="yourhandle"
                className="w-full rounded-md border border-[#1e1e1e] bg-[#0d0d0d] px-3 py-2 font-mono text-[12px] text-[#d0d0d0] outline-none"
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

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
              <label className="field-label">Password</label>
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
              disabled={isSubmitting}
              type="submit"
              className="btn btn-primary mt-2"
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-[14px] text-ink2 mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-brand font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
