"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Field from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { friendlyError } from "@/lib/utils/errors";

function safeNext(next) {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/account";
}

function Shell({ title, subtitle, children, footer }) {
  return (
    <div className="container-page flex justify-center py-8 md:py-14">
      <div className="card w-full max-w-md p-6 md:p-8">
        <h1 className="text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && (
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        )}
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <p className="rounded-control bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
      La autenticación aún no está configurada (faltan variables de Firebase).
    </p>
  );
}

export function LoginForm() {
  const { login, user, configured } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <Shell
      title="Iniciar sesión"
      subtitle="Accede a tus pedidos y tu lista de deseos."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link
            href="/account/register"
            className="font-semibold text-ink underline"
          >
            Regístrate
          </Link>
        </>
      }
    >
      {!configured ? (
        <NotConfigured />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field id="email" label="Correo electrónico" required>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field id="password" label="Contraseña" required>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy}
          >
            {busy ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>
      )}
    </Shell>
  );
}

export function RegisterForm() {
  const { register, user, configured } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  useEffect(() => {
    if (user && !busy) router.replace("/account");
  }, [user, busy, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (f.name.trim().length < 2) return setError("Ingresa tu nombre.");
    if (f.password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres.");
    setBusy(true);
    try {
      await register({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        phone: f.phone.trim(),
      });
      toast("Cuenta creada correctamente.");
      router.replace("/account");
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    }
  }

  return (
    <Shell
      title="Crear cuenta"
      subtitle="Es opcional: también puedes comprar como invitado."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/account/login"
            className="font-semibold text-ink underline"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      {!configured ? (
        <NotConfigured />
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field id="name" label="Nombre completo" required>
            <input
              id="name"
              required
              autoComplete="name"
              className="input"
              value={f.name}
              onChange={set("name")}
            />
          </Field>
          <Field id="email" label="Correo electrónico" required>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={f.email}
              onChange={set("email")}
            />
          </Field>
          <Field id="phone" label="WhatsApp (opcional)">
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="input"
              value={f.phone}
              onChange={set("phone")}
            />
          </Field>
          <Field
            id="password"
            label="Contraseña"
            hint="Mínimo 6 caracteres."
            required
          >
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="input"
              value={f.password}
              onChange={set("password")}
            />
          </Field>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy}
          >
            {busy ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>
      )}
    </Shell>
  );
}

export function ForgotPasswordForm() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      // No revelamos si el correo existe.
      if (err?.code === "auth/user-not-found") setSent(true);
      else setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecerla."
      footer={
        <Link
          href="/account/login"
          className="font-semibold text-ink underline"
        >
          Volver a iniciar sesión
        </Link>
      }
    >
      {!configured ? (
        <NotConfigured />
      ) : sent ? (
        <p
          className="rounded-control bg-green-50 p-3 text-sm text-green-900 ring-1 ring-green-200"
          role="status"
        >
          Si el correo está registrado, recibirás un enlace para restablecer tu
          contraseña.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field id="email" label="Correo electrónico" required>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy}
          >
            {busy ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
    </Shell>
  );
}
