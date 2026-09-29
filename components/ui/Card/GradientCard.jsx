import { cn } from "../../../src/lib/cn";

const GradientCard = ({
  children,
  className = "",
  contentClassName = "",
}) => {
  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-sm",
        className
      )}
    >
      <div
        className={cn(
          "relative z-10 min-w-0 max-w-full",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default GradientCard;