import {
  ArrowLeft,
  ArrowRight,
  Bot,
  KeyRound,
  Mail,
  ShieldCheck,
  CircleCheck,
  AlertCircle,
  Inbox,
  TimerReset,
} from "lucide-react";
import { useState } from "react";

import { cn } from "../../../src/lib/cn";
import GradientButton from "../../../components/ui/Button/GradientButton";
import GradientText from "../../../components/ui/Text/GradientText";
import TextBadge from "../../../components/ui/Badge/TextBadge";
import GradientCard from "../../../components/ui/Card/GradientCard";
import CardWithBlurBlob from "../../../components/ui/Card/CardWithBlurBlob";
import GradientShadow from "../../../components/ui/Shadow/GradientShadowWrapper";

const infoCards = [
  {
    title: "Secure reset flow",
    description: "Password reset links are time-limited and email verified.",
    icon: ShieldCheck,
  },
  {
    title: "Check your inbox",
    description: "We will send reset instructions to your registered email.",
    icon: Inbox,
  }
];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setIsSent(false);
      setFormError("Please enter your email address.");
      return;
    }

    // Later: call forgot-password API here
    setFormError("");
    setIsSent(true);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-base-200/40">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          backgroundPosition: "center center",
          color: "rgba(120, 120, 120, 0.45)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, black 10%, transparent 80%)",
          maskImage:
            "radial-gradient(circle at center, black 0%, black 10%, transparent 50%)",
        }}
      />

      {/* Background blobs */}
      <div className="pointer-events-none absolute left-1/3 top-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/2 bottom-1/2 h-60 w-60 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 px-6 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* Left side */}
        <section className="hidden lg:flex lg:flex-col lg:justify-center">
          <a
            href="/"
            className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-base-content/60 transition hover:text-primary"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to home
          </a>

          <div>
            <div className="mb-3 inline-flex">
              <TextBadge variant="cyan" size="lg" uppercase={false}>
                Account Recovery
              </TextBadge>
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-base-content">
              Reset access to your{" "}
              <GradientText>SupportHub</GradientText> workspace
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-base-content/65">
              Enter your workspace email and we will send a secure password
              reset link if the account exists.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 max-w-xl gap-4">
            {infoCards.map(({ title, description, icon: Icon }) => (
              <CardWithBlurBlob
                key={title}
                interactive={false}
                className="bg-base-100/10 p-3.5 backdrop-blur-xs"
                contentClassName="flex items-center gap-3"
                blobColor="bg-primary/10"
                blobHoverColor="group-hover:bg-secondary/15"
              >
                

                <div>
                  <p className="text-sm font-semibold text-base-content">
                    {title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-base-content/60">
                    {description}
                  </p>
                </div>
              </CardWithBlurBlob>
            ))}
          </div>
        </section>

        {/* Right form */}
        <section className="flex items-center justify-center py-8 lg:py-0">
          <div className="w-full max-w-md">
            {/* Mobile top */}
            <div className="mb-7 flex items-center justify-between lg:hidden">
              <a href="/" className="flex items-center gap-2">
                <GradientCard className="h-9 w-9 rounded-xl">
                  <Bot size={18} strokeWidth={2} />
                </GradientCard>

                <span className="text-lg font-semibold tracking-tight text-base-content">
                  Support<GradientText>Hub</GradientText>
                </span>
              </a>

              <a
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 hover:text-primary"
              >
                <ArrowLeft size={14} strokeWidth={2} />
                Login
              </a>
            </div>

            <GradientShadow
              glowClassName="opacity-20 blur-md"
              radius="rounded-3xl"
            >
              <CardWithBlurBlob
                interactive={false}
                className="rounded-sm border-none p-5 md:p-6"
                blobColor="bg-primary/10"
                blobHoverColor="group-hover:bg-secondary/20"
              >
                <div className="mb-6 text-center">
                  

                  <h2 className="text-2xl mt-2 font-semibold tracking-tight text-base-content">
                    Forgot password?
                  </h2>

                  <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-base-content/60">
                    No panic. Enter your email and we will send reset
                    instructions.
                  </p>
                </div>

                {isSent ? (
                  <div className="rounded-2xl border border-success/20 bg-success/10 p-4 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success/15 text-success">
                      <CircleCheck size={18} strokeWidth={2} />
                    </div>

                    <p className="text-sm font-semibold text-base-content">
                      Reset link sent
                    </p>

                    <p className="mt-1 text-sm leading-6 text-base-content/60">
                      Check your inbox for password reset instructions.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsSent(false)}
                      className="mt-4 text-sm font-semibold text-primary hover:underline"
                    >
                      Use another email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-base-content/75"
                      >
                        Email address
                      </label>

                      <div className="relative">
                        <Mail
                          size={15}
                          strokeWidth={2}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                        />

                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setFormError("");
                          }}
                          placeholder="you@company.com"
                          className={cn(
                            "h-10 w-full rounded-xl border bg-base-100 px-9 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:ring-4",
                            formError
                              ? "border-red-500/40 focus:border-red-500/50 focus:ring-red-500/10"
                              : "border-base-content/10 focus:border-primary/40 focus:ring-primary/10"
                          )}
                        />
                      </div>
                    </div>

                    <GradientButton
                      type="submit"
                      shadow
                      className="w-full"
                      buttonClassName="min-h-0 h-10 w-full text-sm font-semibold"
                      glowClassName="opacity-30"
                    >
                      Send reset link
                      <ArrowRight size={15} strokeWidth={2} />
                    </GradientButton>

                    {formError && (
                      <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-500">
                        <AlertCircle size={13} strokeWidth={2} />
                        <span>{formError}</span>
                      </div>
                    )}
                  </form>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-base-content/60">
                  <span>Remembered your password?</span>
                  <a
                    href="/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Login
                  </a>
                </div>
              </CardWithBlurBlob>
            </GradientShadow>

            <p className="mt-5 text-center text-xs leading-5 text-base-content/45">
              For security, reset links expire after a short time.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}