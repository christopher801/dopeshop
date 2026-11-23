'use client';

import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import { ORDER_STATUSES } from '@/constants';

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = ORDER_STATUSES[status] || { label: status, tone: 'gray' };
  return <span className={`badge badge-${s.tone}`}>{s.label}</span>;
}

export function DataState({ loading, error, children, reload }) {
  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="card p-6 text-center" role="alert">
        <p className="text-sm text-red-700">{error}</p>
        {reload && <button type="button" className="btn btn-outline btn-sm mt-3" onClick={reload}>Reintentar</button>}
      </div>
    );
  return children;
}

/** Tabla en pantallas medianas+; tarjetas compactas en móvil. */
export function AdminTable({ columns, rows, rowKey = (r) => r.id, empty = 'Sin resultados.', onRowClick }) {
  if (!rows.length) return <div className="card p-8 text-center text-sm text-muted">{empty}</div>;
  return (
    <>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-gray-50 text-xs uppercase text-muted">
            <tr>{columns.map((c) => <th key={c.key} scope="col" className={`px-4 py-3 font-semibold ${c.className || ''}`}>{c.label}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={rowKey(r)} className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                {columns.map((c) => <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ''}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)} className="card space-y-1.5 p-4 text-sm" onClick={onRowClick ? () => onRowClick(r) : undefined}>
            {columns.map((c) => (
              <div key={c.key} className="flex justify-between gap-3">
                <span className="text-muted">{c.label}</span>
                <span className="text-right font-medium">{c.render ? c.render(r) : r[c.key]}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}

export function StatCard({ label, value, hint, href }) {
  const body = (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block hover:shadow-lift">{body}</Link> : body;
}
