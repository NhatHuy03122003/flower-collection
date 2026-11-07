export function SectionTitle({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="mb-2.5 flex items-baseline gap-2">
      <h2 className="text-base font-bold tracking-tight text-rose-950 sm:text-lg">
        {title}
      </h2>
      <span className="text-xs font-medium text-rose-800/65">
        {count} hoa
      </span>
    </div>
  );
}
