// src/components/forms/RegisterForm.jsx

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  MessageSquarePlus,
  Hash,
} from "lucide-react";

// ✅ Validation schema
const schema = yup.object({
  username: yup.string().trim().required("Please enter a username"),
  uid: yup.string().trim().required("Please choose a unique U.id"),
  email: yup
    .string()
    .trim()
    .email("Invalid email address")
    .required("Please enter your email"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Please enter a password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function RegisterForm({ onSubmit, loginHref = "/login" }) {
  const form = useForm({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      uid: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (values) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        console.log("Register values:", values);
      }
    } catch (err) {
      form.setError("root", { message: err?.message || "Registration failed" });
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Subtle silver gradient border */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-zinc-500/30 via-zinc-500/10 to-transparent blur-[2px]" />

      <div className="relative rounded-3xl border border-zinc-800/80 bg-neutral-950/80 shadow-[0_0_0_1px_rgba(39,39,42,0.4),0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl border border-zinc-800 bg-neutral-900 shadow-inner">
              <MessageSquarePlus className="h-5 w-5 text-zinc-300" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                Create your account
              </h1>
              <p className="text-sm text-zinc-400">Register to get started</p>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Username + UID in a row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <User className="h-4 w-4" />
                          </span>
                          <Input
                            placeholder="username"
                            autoComplete="name"
                            className="pl-9 bg-neutral-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">U.id</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Hash className="h-4 w-4" />
                          </span>
                          <Input
                            placeholder="@uniqueid"
                            autoComplete="off"
                            className="pl-9 bg-neutral-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                          <Mail className="h-4 w-4" />
                        </span>
                        <Input
                          placeholder="u@mail.com"
                          autoComplete="email"
                          className="pl-9 bg-neutral-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-400"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-rose-400" />
                  </FormItem>
                )}
              />

              {/* Password + Confirm Password in a row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Lock className="h-4 w-4" />
                          </span>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="pl-9 pr-10 bg-neutral-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-400"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-200"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-zinc-300">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Lock className="h-4 w-4" />
                          </span>
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="pl-9 pr-10 bg-neutral-900/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-400"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-200"
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-rose-400" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Root error */}
              {form.formState.errors.root?.message && (
                <p className="text-sm text-rose-400">
                  {form.formState.errors.root.message}
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full justify-center rounded-xl border border-zinc-700 bg-gradient-to-b from-zinc-300 via-zinc-200 to-zinc-300 text-neutral-900 hover:from-zinc-200 hover:via-zinc-100 hover:to-zinc-200 disabled:opacity-75"
              >
                {form.formState.isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  "Sign up"
                )}
              </Button>

              {/* Footer */}
              <div className="pt-2 text-center text-sm text-zinc-400">
                Already have an account?{" "}
                <a
                  href={loginHref}
                  className="font-medium text-zinc-200 underline decoration-zinc-500/50 underline-offset-4 hover:text-white"
                >
                  Log in
                </a>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
