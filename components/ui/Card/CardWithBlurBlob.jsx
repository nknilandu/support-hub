import { cn } from "../../../src/lib/cn";

const CardWithBlurBlob = ({
  children,
  className = "",
  contentClassName = "",
  blobClassName = "",
  blobColor = "bg-primary/20",
  blobHoverColor = "group-hover:bg-primary/30",
  interactive = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 p-6 transition duration-200",
        interactive && "hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition",
          blobColor,
          blobHoverColor,
          blobClassName,
        )}
      />

      <div
        className={cn("relative z-10 h-full flex flex-col", contentClassName)}
      >
        {children}
      </div>
    </div>
  );
};

export default CardWithBlurBlob;
