export default function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden bg-navy py-3">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white/90"
          >
            {item}
            <span className="text-gold-light">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
