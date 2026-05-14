import { cn } from "../../../src/lib/cn";

const GradientCard = ({
  children,
  className = "",
  contentClassName = "",
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-sm",
        className
      )}
    >
      <div className={cn("relative z-10", contentClassName)}>
        {children}
      </div>
    </div>
  );
};

export default GradientCard;