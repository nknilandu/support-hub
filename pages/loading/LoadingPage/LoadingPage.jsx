import { cn } from "../../../src/lib/cn";

export default function LoadingPage({
  message = "Preparing your workspace...",
  fullScreen = true,
  className = "",
}) {
  return (
    <main
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-base-200 px-6",
        fullScreen ? "min-h-screen" : "min-h-[420px]",
        className,
      )}
    >
      <section className="relative z-10 mx-auto max-w-md text-center">
        {/* Spinner rings */}
        <div className="mx-auto relative top-0 left-0 h-12 w-12 rounded-full bg-primary/10">
          <div className="absolute h-fit w-fit rounded-full bg-conic from-primary from-0% via-secondary to-transparent to-70% overflow-hidden p-1 animate-spin">
            <div className="relative h-10 w-10 rounded-full bg-base-200" />
            <div className="absolute inset-3 animate-ping rounded-full bg-primary/20" />
          </div>
        </div>

        <p className="mt-3 mx-auto max-w-sm text-sm leading-6 text-base-content/60">
          {message}
        </p>
      </section>
    </main>
  );
}
