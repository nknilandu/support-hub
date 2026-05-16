import { ArrowLeft, Bot, Mail } from "lucide-react";
import { useContext, useState } from "react";
import GradientButton from "../../../components/ui/Button/GradientButton";
import GradientText from "../../../components/ui/Text/GradientText";
import TextBadge from "../../../components/ui/Badge/TextBadge";
import GradientCard from "../../../components/ui/Card/GradientCard";
import CardWithBlurBlob from "../../../components/ui/Card/CardWithBlurBlob";
import GradientShadow from "../../../components/ui/Shadow/GradientShadowWrapper";

import { useForm } from "react-hook-form";
import { AuthContext } from "../../../providers/AuthProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const infoCards = [
  {
    title: "Secure reset flow",
    description: "Password reset links are time-limited and email verified.",
  },
  {
    title: "Check your inbox",
    description: "We will send reset instructions to your registered email.",
  },
];

export default function ForgotPassword() {
  const [btnLoading, setBtnLoading] = useState(false);
  const navigate = useNavigate();

  const { forgotPassword } = useContext(AuthContext);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = (data) => {
    setBtnLoading(true);
    forgotPassword(data.email)
      .then(() => {
        toast.success(
          "Password Reset email successfully sent. Please reset your password and Login now",
        );
        navigate("/login");

        setBtnLoading(false);
      })
      .catch((e) => {
        console.log(e.message);
        toast.error(e.message);
        setBtnLoading(false);
      });
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
              Reset access to your <GradientText>SupportHub</GradientText>{" "}
              workspace
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-base-content/65">
              Enter your workspace email and we will send a secure password
              reset link if the account exists.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 max-w-xl gap-4">
            {infoCards.map(({ title, description }) => (
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
              glowClassName="opacity-30 blur-md"
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        {...register("email", {
                          required: "Email address is required",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                          },
                        })}
                        type="text"
                        name="email"
                        placeholder="example@email.com"
                        className="h-10 w-full rounded-xl border bg-base-100 px-9 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:ring-4 border-base-content/10 focus:border-primary/40 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  <GradientButton
                    type="submit"
                    disabled={btnLoading}
                    shadow
                    className="w-full"
                    buttonClassName={`min-h-0 h-11 w-full text-sm font-semibold ${btnLoading && "from-primary/10 to-secondary/20"}`}
                    glowClassName="opacity-30"
                  >
                    {btnLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Send reset link"
                    )}
                  </GradientButton>

                  {/* error message */}
                  {errors.email && (
                    <p className="px-3 -m-2 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </form>

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
