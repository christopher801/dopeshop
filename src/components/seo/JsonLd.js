export default function JsonLd({ data }) {
  const items = Array.isArray(data) ? data : [data];
  return items.map((d, i) => (
    <script
      key={i}
      type="application/ld+json"
      // Escapamos "<" para evitar inyección de etiquetas dentro del JSON.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, '\\u003c') }}
    />
  ));
}
