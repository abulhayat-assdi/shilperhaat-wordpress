interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({ title, subtitle, className = "" }: SectionHeaderProps) {
  return (
    <div className={`text-center mb-6 ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-[#1a1208] mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#7a6045] text-sm md:text-base">{subtitle}</p>
      )}
      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="h-0.5 w-12 bg-[#800000] rounded" />
        <div className="w-2 h-2 rounded-full bg-[#800000]" />
        <div className="h-0.5 w-12 bg-[#800000] rounded" />
      </div>
    </div>
  );
}
