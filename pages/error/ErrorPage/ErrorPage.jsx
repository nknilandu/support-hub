import { ArrowLeft } from "lucide-react";
import GradientText from "../../../components/ui/Text/GradientText";

export default function ErrorPage({
  code = "404",
  title = "Page not found",
  message = "The page you are looking for does not exist, has been moved, or is temporarily unavailable.",
}) {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-100 px-6 py-20">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="text-6xl font-extrabold tracking-tight md:text-8xl">
          <GradientText gradientClassName="from-primary to-secondary">
            {code}
          </GradientText>
        </h1>

        <h2 className="mt-2 text-xl tracking-tight text-base-content md:text-3xl">
          {title}
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-base-content/70 md:text-base">
          {message}
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex min-h-0 items-center justify-center gap-2 rounded-xl border border-base-content/15 bg-base-100 px-6 py-3 text-sm font-semibold text-base-content transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
}
