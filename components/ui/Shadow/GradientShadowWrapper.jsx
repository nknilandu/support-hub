import { cn } from "../../../src/lib/cn";

const GradientShadow = ({
  children,
  className,
  glowClassName,
  radius = "rounded-[1rem]",
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* outer glow */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute -inset-2 bg-gradient-to-br from-primary/30 to-secondary/30 opacity-80 blur-xl",
          radius,
          glowClassName,
        )}
      />

      {/* gradient border */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-primary to-secondary", // for border give here p-[2px]
          radius,
        )}
      >
        {/* content */}
        <div className={cn("overflow-hidden bg-base-100", radius)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default GradientShadow;

/*
  Uses:
  <GradientShadow>Content</GradientShadow>
  <GradientShadow className="max-w-3xl" radius="rounded-xl">Content</GradientShadow>

  Props:
  className = wrapper size/position, e.g. "max-w-3xl"
  radius = glow, border, and content roundness, e.g. "rounded-xl"
  glowClassName = control glow, e.g. "opacity-50 blur-lg from-accent/20"

  Border:
  Add p-[1px] or p-[2px] to the gradient border div if you want visible gradient border.
*/
