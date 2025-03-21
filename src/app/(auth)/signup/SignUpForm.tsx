"use client";

import { signupSchema, signupValues } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { signUp } from "./actions";
import { PasswordInput } from "@/components/PasswordInput";
import LoadingButton from "@/components/LoadingButton";

/**
 * Komponenta registracniho formulare
 * Pouziva react-hook-form s validaci pomoci Zod schematu
 */
export default function SignUpForm() {
  // State pro chybove hlasky ze serveru
  const [error, setError] = useState<string>();

  // useTransition pro indikaci stavu odesilani formulare
  const [isPending, startTransition] = useTransition();

  // Inicializace formulare s validacnim schematem
  const form = useForm<signupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  /**
   * Zpracovani odeslani formulare
   * Vola server action signUp a zpracovava pripadnou chybu
   */
  async function onSubmit(values: signupValues) {
    setError(undefined);
    startTransition(async () => {
      const { error } = await signUp(values);
      if (error) setError(error);
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {error && <p className="text-center text-destructive">{error}</p>}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Sign up
        </LoadingButton>
      </form>
    </Form>
  );
}
