import { stockState } from '@/lib/utils/product';

const STYLES = { in: 'badge-green', low: 'badge-amber', out: 'badge-red' };

export default function StockBadge({ product }) {
  const s = stockState(product);
  return <span className={`badge ${STYLES[s.key]}`}>{s.label}</span>;
}
