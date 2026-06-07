export default function TextBadge({
  children,
  variant = "primary",
  size = "md",
  className = "",
}) {
  // Static classes only. Don't generate dynamic Tailwind classes like bg-${color}.
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    info: "bg-info/10 text-info border-info/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-error/10 text-error border-error/20",
    success: "bg-success/10 text-success border-success/20",

    cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    sky: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    pink: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    green: "bg-green-500/10 text-green-600 border-green-500/20",
    red: "bg-red-500/10 text-red-600 border-red-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    yellow: "bg-warning/10 text-warning border-warning/20",
    slate: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-[7px]",
    sm: "px-2 py-0.5 text-[9px]",
    md: "px-2 py-0.5 text-[10px]",
    lg: "px-2 py-0.5 text-xs",
    xl: "px-3 py-1 text-xs font-semibold",
  };

  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border uppercase tracking-wide ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}

// <TextBadge variant="cyan" size="lg" >PLATFORM</TextBadge>
// <TextBadge variant="green" size="md" >PLATFORM</TextBadge>
// <TextBadge variant="red" size="sm" className='border-none'>PLATFORM</TextBadge>