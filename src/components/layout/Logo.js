import Link from 'next/link';

export default function Logo({ className = '', inverted = false }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="DOPE SHOP — Inicio">
      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-ink text-lg font-extrabold leading-none text-lime" aria-hidden="true">
        D
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-ink'}`}>DOPE SHOP</span>
    </Link>
  );
}
