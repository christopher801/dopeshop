'use client';

import { useEffect, useState } from 'react';

export default function AnnouncementBar({ messages = [] }) {
  const [index, setIndex] = useState(0);
  const list = messages.filter(Boolean);

  useEffect(() => {
    if (list.length < 2) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % list.length), 5000);
    return () => clearInterval(t);
  }, [list.length]);

  if (!list.length) return null;
  return (
    <div className="bg-ink text-text-light">
      <p className="container-page py-2 text-center text-xs font-medium sm:text-sm">
        <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-lime align-middle" aria-hidden="true" />
        {list[index % list.length]}
      </p>
    </div>
  );
}
