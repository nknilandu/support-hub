import {
  ArrowLeft,
  Bot,
  Crown,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
  UserRound,
  Building2,
  MessageSquareText,
} from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

import { cn } from "../../../src/lib/cn";
import GradientButton from "../../../components/ui/Button/GradientButton";
import GradientText from "../../../components/ui/Text/GradientText";
import TextBadge from "../../../components/ui/Badge/TextBadge";
import GradientCard from "../../../components/ui/Card/GradientCard";
import CardWithBlurBlob from "../../../components/ui/Card/CardWithBlurBlob";
import { FcGoogle } from "react-icons/fc";
import GradientShadow from "../../../components/ui/Shadow/GradientShadowWrapper";
import { AuthContext } from "../../../providers/AuthProvider";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router";

const demoRoles = [
  {
    label: "Owner",
    icon: Crown,
    variant: "blue",
  },
  {
    label: "Agent",
    icon: Headphones,
    variant: "cyan",
  },
  {
    label: "Customer",
    icon: UserRound,
    variant: "green",
  },
];

const infoCards = [
  {
    title: "Built for SaaS support teams",
    description:
      "Separate dashboards for owners, agents, customers, and platform admins.",
    icon: Building2,
  },
  {
    title: "Human-controlled automation",
    description:
      "AI helps the team move faster without sending risky replies automatically.",
    icon: MessageSquareText,
  },
  {
    title: "AI-assisted workflows",
    description:
      "Speed up first replies, ticket classification, summaries, and drafts.",
    icon: Bot,
  },
];

export default function Login() {
  const { googleSignIn, loginUser, setUser } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const handleDemoLogin = (role) => {
    console.log("Demo login:", role.label);
  };

  const googleSubmit = () => {
    setGoogleLoading(true);
    googleSignIn()
      .then((res) => {
        // success
        const user = res.user;
        setUser(user);
        toast.success("Successfully Loged in.");
        navigate(`${location.state ? location.state : "/"}`);
        setGoogleLoading(false);
      })
      .catch((e) => {
        // error
        console.log(e.message);
        toast.error(e.message);
        setGoogleLoading(false);
      });
  };

  const onSubmit = (data) => {
    setBtnLoading(true);

    loginUser(data.email, data.password)
      .then((res) => {
        // success
        const user = res.user;
        setUser(user);
        toast.success("Successfully Loged in.");
        navigate(`${location.state ? location.state : "/"}`);
        setBtnLoading(false);
      })
      .catch((e) => {
        // error
        console.log(e.message);
        toast.error(e.message);
        setBtnLoading(false);
      });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-base-200/40">
      {/* Background grid */}
      <title>Login | SupportHub</title>
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
                AI Support Workspace
              </TextBadge>
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-base-content">
              Sign in to your <GradientText>SupportHub</GradientText> workspace
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-base-content/65">
              Manage tickets, review AI drafts, monitor support workflows, and
              keep every customer conversation organized.
            </p>
          </div>

          {/* 3 info cards */}
          <div className="mt-5 grid max-w-xl gap-4">
            {infoCards.map(({ title, description, icon: Icon }) => (
              <CardWithBlurBlob
                key={title}
                interactive={false}
                className="p-4 bg-base-100/10 backdrop-blur-xs"
                contentClassName="flex items-start gap-4"
                blobColor="bg-primary/10"
                blobHoverColor="group-hover:bg-secondary/15"
              >
                <GradientCard className="h-11 w-11 shrink-0 rounded-2xl from-primary/10 to-secondary/20 text-primary">
                  <Icon size={19} strokeWidth={2} />
                </GradientCard>

                <div>
                  <p className="text-sm font-semibold text-base-content">
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-base-content/60">
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
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 hover:text-primary"
              >
                <ArrowLeft size={14} strokeWidth={2} />
                Home
              </a>
            </div>

            <GradientShadow
              glowClassName="opacity-30 blur-md"
              radius="rounded-3xl"
            >
              <CardWithBlurBlob
                interactive={false}
                className="p-6 md:p-7 border-none rounded-sm"
                blobColor="bg-primary/10"
                blobHoverColor="group-hover:bg-secondary/20"
              >
                <div className="mb-7">
                  <div className="mb-4 flex justify-center items-center gap-2 text-center">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-base-content">
                        Welcome back
                      </h2>
                      <p className="mt-1 text-sm text-base-content/60">
                        Login to continue to SupportHub.
                      </p>
                    </div>
                  </div>
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
                        size={16}
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
                        autoComplete="email"
                        placeholder="example@email.com"
                        className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-base-content/75"
                      >
                        Password
                      </label>

                      <a
                        href="/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot Password?
                      </a>
                    </div>

                    <div className="relative">
                      <Lock
                        size={16}
                        strokeWidth={2}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                      />
                      <input
                        {...register("password", {
                          required: "password field is empty",
                          minLength: {
                            value: 8,
                            message:
                              "password must contains minimum 8 characters",
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z]).+$/,
                            message:
                              "password must contain at least one lowercase and one uppercase letter",
                          },
                        })}
                        name="password"
                        placeholder="At least 8 characters"
                        autoComplete="current-password"
                        type={showPassword ? "text" : "password"}
                        className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 pr-11 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 transition hover:text-primary"
                      >
                        {showPassword ? (
                          <EyeOff size={16} strokeWidth={2} />
                        ) : (
                          <Eye size={16} strokeWidth={2} />
                        )}
                      </button>
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
                      "Login"
                    )}
                  </GradientButton>

                  {/* error */}
                  {errors.email ? (
                    <p className="-m-2 px-3 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  ) : (
                    errors.password && (
                      <p className="-m-2 px-3 text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )
                  )}
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-base-content/10" />
                  <span className="text-xs font-medium text-base-content/40">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-base-content/10" />
                </div>

                <button
                  type="button"
                  onClick={googleSubmit}
                  disabled={btnLoading || googleLoading}
                  className="h-11 w-full items-center rounded-xl border border-base-content/10 bg-base-100 text-sm font-semibold text-base-content transition hover:border-primary/30 hover:bg-primary/5"
                >
                  {googleLoading ? (
                    <span className="loading loading-spinner loading-sm text-base-content"></span>
                  ) : (
                    <div className="flex justify-center gap-3 ">
                      <FcGoogle size={18}></FcGoogle>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </button>

                {/* Demo roles */}

                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-base-content">
                      Demo login
                    </p>

                    <TextBadge variant="green" size="sm" uppercase={false}>
                      No setup needed
                    </TextBadge>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {demoRoles.map((role) => {
                      const Icon = role.icon;

                      return (
                        <button
                          key={role.label}
                          type="button"
                          onClick={() => handleDemoLogin(role)}
                          className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-base-content/10 bg-base-100/70 px-3 text-sm font-semibold text-base-content transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                          <Icon
                            size={15}
                            strokeWidth={2}
                            className={cn(
                              role.variant === "blue" && "text-blue-500",
                              role.variant === "cyan" && "text-cyan-500",
                              role.variant === "green" && "text-green-500",
                            )}
                          />

                          <span>{role.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-6 text-center text-sm text-base-content/60">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-primary hover:underline"
                  >
                    Create workspace
                  </Link>
                </p>
              </CardWithBlurBlob>
            </GradientShadow>

            <p className="mt-5 text-center text-xs leading-5 text-base-content/45">
              By continuing, you agree to SupportHub&apos;s Terms and Privacy
              Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
