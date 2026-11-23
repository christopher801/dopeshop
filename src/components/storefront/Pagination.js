import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildQuery } from '@/lib/utils/query';

export default function Pagination({ page, pages, basePath, params }) {
  if (pages <= 1) return null;
  const href = (p) => `${basePath}${buildQuery(params, { page: p })}`;
  const window = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) window.push(p);
  return (
    <nav aria-label="Paginación" className="mt-8 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-outline btn-sm" rel="prev"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Anterior</Link>
      ) : null}
      {window.map((p) => (
        <Link key={p} href={href(p)} aria-current={p === page ? 'page' : undefined} className={`btn btn-sm min-w-[40px] ${p === page ? 'btn-primary' : 'btn-outline'}`}>
          {p}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className="btn btn-outline btn-sm" rel="next">Siguiente <ChevronRight className="h-4 w-4" aria-hidden="true" /></Link>
      ) : null}
    </nav>
  );
}
