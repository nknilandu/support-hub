import { cn } from "../../../src/lib/cn";

const GradientText = ({
  children,
  className,
  gradientClassName = "from-primary to-secondary",
}) => {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r bg-clip-text text-transparent",
        gradientClassName,
        className
      )}
    >
      {children}
    </span>
  );
};

export default GradientText;

/*
  Use:
  <GradientText>Support AI</GradientText>

  Props:
  className = text size/weight, e.g. "text-5xl font-bold"
  gradientClassName = gradient colors, e.g. "from-primary to-secondary"
*/