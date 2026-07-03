"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import useAuthContext from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthContext();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/deals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
      <FieldGroup className="items-center">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Войдите в свою учетную запись</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Введите свой адрес электронной почты ниже, чтобы войти в свою
            учетную запись
          </p>
        </div>
        <Field className="max-w-sm">
          <FieldLabel htmlFor="email">Электронная почта</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            status={!!error ? "error" : "default"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field className="max-w-sm">
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Забыли пароль?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            status={!!error ? "error" : "default"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!!error && <p className="text-xs text-red-500">{error}</p>}
        </Field>
        <Field className="max-w-sm">
          <Button type="submit" disabled={isLoading}>
            Войти
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            У вас нет учетной записи?{" "}
            <a href="#" className="underline underline-offset-4">
              Зарегистрируйтесь
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
