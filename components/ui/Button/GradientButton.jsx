import { cn } from "../../../src/lib/cn";

const GradientButton = ({
  children,
  className,
  glowClassName,
  buttonClassName,

  shadow = false,

  rounded = "rounded-lg",
  blur = "blur-xl",

  from = "from-primary",
  to = "to-secondary",

  glowColor = "bg-primary/60",
  hoverOpacity = "hover:opacity-80",

  type = "button",
  ...props
}) => {
  return (
    <div className={cn("relative inline-flex w-fit", className)}>
      {/* optional soft glow */}
      {shadow && (
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0",
            rounded,
            glowColor,
            blur,
            glowClassName
          )}
        />
      )}

      <button
        type={type}
        className={cn(
          "btn relative z-10 inline-flex w-fit items-center justify-center gap-2 border-0 bg-gradient-to-r text-white shadow-none transition-all",
          from,
          to,
          rounded,
          hoverOpacity,
          buttonClassName
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  );
};

export default GradientButton;

/*
  Uses:
  <GradientButton>Text</GradientButton>
  <GradientButton className="flex-1" shadow>Text</GradientButton>

  Props:
  shadow = show soft glow
  glowClassName = control glow opacity, blur e.g. "opacity-30 blur-sm"
  rounded = button radius, e.g. "rounded-xl"
  blur = glow softness, e.g. "blur-lg"
  from/to = gradient colors, e.g. "from-primary" "to-secondary"
*/