import Link from 'next/link';

export default function EmptyState({ icon: Icon, title, description, actionHref, actionLabel, children }) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-ink">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h2 className="text-lg font-bold">{title}</h2>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      {actionHref && (
        <Link href={actionHref} className="btn btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
      {children}
    </div>
  );
}
