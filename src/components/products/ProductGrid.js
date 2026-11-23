import ProductCard from './ProductCard';

export default function ProductGrid({ products, priorityCount = 0 }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <div className="w-full">
            <ProductCard product={p} priority={i < priorityCount} />
          </div>
        </li>
      ))}
    </ul>
  );
}
