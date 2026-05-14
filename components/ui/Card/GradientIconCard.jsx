import { cn } from "../../../src/lib/cn";

const GradientIconCard = ({
  icon: Icon,
  text = null,
  size = 17,
  strokeWidth = 2,
  className = "",
  iconClassName = "",
  textClassName = "",
}) => {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-sm",
        className
      )}
    >
      {Icon ? (
        <Icon
          size={size}
          strokeWidth={strokeWidth}
          style={{ strokeWidth }}
          className={cn("text-inherit", iconClassName)}
        />
      ) : (
        text && (
          <span
            className={cn(
              "text-sm font-bold leading-none text-inherit",
              textClassName
            )}
          >
            {text}
          </span>
        )
      )}
    </div>
  );
};

export default GradientIconCard;