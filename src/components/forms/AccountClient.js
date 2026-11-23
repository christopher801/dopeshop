"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Heart, LogOut, Package } from "lucide-react";
import Field from "@/components/ui/Field";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { getDb } from "@/lib/firebase/client";
import { friendlyError } from "@/lib/utils/errors";

/** Hook: redirige al login si no hay sesión. */
export function useRequireUser() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user)
      router.replace(
        `/account/login?next=${encodeURIComponent(window.location.pathname)}`,
      );
  }, [user, loading, router]);
  return { user, loading: loading || !user };
}

export default function AccountClient() {
  const { user, loading } = useRequireUser();
  const { logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.displayName || "");
    getDoc(doc(getDb(), "users", user.uid))
      .then((s) => s.exists() && setPhone(s.data().phone || ""))
      .catch(() => {});
  }, [user]);

  if (loading) return <Spinner />;

  async function save(e) {
    e.preventDefault();
    if (name.trim().length < 2) return toast("Ingresa tu nombre.", "error");
    setBusy(true);
    try {
      await updateProfile(user, { displayName: name.trim() });
      await setDoc(
        doc(getDb(), "users", user.uid),
        {
          name: name.trim(),
          phone: phone.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      toast("Perfil actualizado.");
    } catch (err) {
      toast(friendlyError(err), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <nav aria-label="Cuenta" className="card h-fit space-y-1 p-3">
        <Link
          href="/account/orders"
          className="flex min-h-[44px] items-center gap-2 rounded-control px-3 text-sm font-medium hover:bg-gray-100"
        >
          <Package className="h-4 w-4" aria-hidden="true" /> Mis pedidos
        </Link>
        <Link
          href="/wishlist"
          className="flex min-h-[44px] items-center gap-2 rounded-control px-3 text-sm font-medium hover:bg-gray-100"
        >
          <Heart className="h-4 w-4" aria-hidden="true" /> Lista de deseos
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex min-h-[44px] items-center gap-2 rounded-control px-3 text-sm font-medium hover:bg-gray-100"
          >
            Panel de administración
          </Link>
        )}
        <button
          type="button"
          onClick={async () => {
            await logout();
            router.replace("/");
          }}
          className="flex min-h-[44px] w-full items-center gap-2 rounded-control px-3 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
        </button>
      </nav>
      <form onSubmit={save} className="card max-w-xl space-y-4 p-5">
        <h2 className="text-lg">Mi perfil</h2>
        <Field id="email" label="Correo electrónico">
          <input
            id="email"
            className="input bg-gray-50"
            value={user.email || ""}
            disabled
            readOnly
          />
        </Field>
        <Field id="name" label="Nombre completo" required>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field id="phone" label="WhatsApp">
          <input
            id="phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </Field>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
