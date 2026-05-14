export default function SoftIconCard({
  icon: Icon,
  size = 18,
  strokeWidth = 2,
  variant = "primary",
  className = "",
  iconClassName = "",
}) {
  const variants = {
    // DaisyUI theme colors
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    info: "bg-info/10 text-info border-info/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-error/10 text-error border-error/20",

    // Tailwind fixed colors
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    sky: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    violet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    slate: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };

  const variantClass = variants[variant] || variants.primary;

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl border ${variantClass} ${className}`}
    >
      {Icon && (
        <Icon
          size={size}
          strokeWidth={strokeWidth}
          style={{ strokeWidth }}
          className={iconClassName}
        />
      )}
    </div>
  );
}

// SoftIconCard
// Reusable soft icon wrapper for cards, sections, feature blocks, etc.
//
// Props:
// - icon: Lucide icon component
// - size: Icon size
// - strokeWidth: Icon stroke thickness
// - variant: Predefined color style
//   Options:
//   "primary", "secondary", "accent", "info", "success", "warning", "error",
//   "red", "green", "blue", "sky", "cyan", "purple", "violet", "pink",
//   "orange", "yellow", "slate"
// - className: Extra wrapper classes
// - iconClassName: Extra icon classes
//
// Example:
// <SoftIconCard icon={Database} variant="blue" />
// <SoftIconCard icon={Crown} variant="purple" size={17} />
// <SoftIconCard icon={ShieldCheck} variant="success" className="h-9 w-9" />