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
  ShieldCheck,
} from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/cn";
import GradientButton from "@/components/ui/Button/GradientButton";
import GradientText from "@/components/ui/Text/GradientText";
import TextBadge from "@/components/ui/Badge/TextBadge";
import GradientCard from "@/components/ui/Card/GradientCard";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import { FcGoogle } from "react-icons/fc";
import GradientShadow from "@/components/ui/Shadow/GradientShadowWrapper";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router";
import { AuthContext } from "@/providers/AuthProvider";

const API_URL = "https://support-hub-server.vercel.app";

// Demo login information
const DEMO_ACCOUNTS = {
  owner: {
    email: "owner@supporthub.com",
    password: "Demo1234",
  },
  manager: {
    email: "manager@supporthub.com",
    password: "Demo1234",
  },
  agent: {
    email: "agent@supporthub.com",
    password: "Demo1234",
  },
  customer: {
    email: "customer@supporthub.com",
    password: "Demo1234",
  },
};

const demoRoles = [
  {
    key: "owner",
    label: "Owner",
    icon: Crown,
    variant: "orange",
  },
  {
    key: "manager",
    label: "Manager",
    icon: ShieldCheck,
    variant: "pink",
  },
  {
    key: "agent",
    label: "Agent",
    icon: Headphones,
    variant: "cyan",
  },
  {
    key: "customer",
    label: "Customer",
    icon: UserRound,
    variant: "green",
  },
];

const infoCards = [
  {
    title: "Built for SaaS support teams",
    description:
      "Separate dashboards for owners, managers, agents, customers, and platform admins.",
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

function getFriendlyAuthError(error) {
  const code = error?.code || "";
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    return "Invalid email or password. Please check and try again.";
  }
  if (code === "auth/too-many-requests") {
    return "Too many failed attempts. Please wait a moment and try again.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in popup was closed before completing.";
  }
  return error?.message || "Authentication failed";
}

export default function Login() {
  const { googleSignIn, loginUser, logOut, syncAuthUser } =
    useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isAnyLoading = btnLoading || googleLoading || Boolean(activeDemoRole);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    clearErrors,
  } = useForm();

  // Verify user exists in MongoDB after Firebase login
  const verifyDatabaseProfile = async (firebaseUser) => {
    const token = await firebaseUser.getIdToken(true);
    const res = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (res.status === 404 || !data?.user) {
      await logOut();
      return { registered: false };
    }

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || "Failed to load user workspace");
    }

    return { registered: true, user: data.user };
  };

  // =========== Handle Demo Login ==============
  const handleDemoLogin = async (role) => {
    if (isAnyLoading) return;

    const creds = DEMO_ACCOUNTS[role.key];
    if (!creds?.email || !creds?.password) {
      toast.error(`Demo credentials for ${role.label} are not configured.`);
      return;
    }

    clearErrors();
    setValue("email", creds.email);
    setValue("password", creds.password);
    setActiveDemoRole(role.key);

    try {
      const res = await loginUser(creds.email, creds.password);
      const check = await verifyDatabaseProfile(res.user);

      if (!check.registered) {
        toast.info(
          "Demo account not found in database. Please create it first.",
        );
        return;
      }

      syncAuthUser();
      toast.success(`Logged in as Demo ${role.label}`);
      navigate(location.state || "/dashboard", { replace: true });
    } catch (e) {
      toast.error(getFriendlyAuthError(e));
    } finally {
      setActiveDemoRole(null);
    }
  };

  // =========== Handle Google Submit ==============
  const googleSubmit = async () => {
    if (isAnyLoading) return;
    setGoogleLoading(true);

    try {
      const res = await googleSignIn();
      const check = await verifyDatabaseProfile(res.user);

      if (!check.registered) {
        toast.info(
          "No SupportHub workspace found for this Google account. Please complete registration.",
        );
        navigate("/register", { replace: true });
        return;
      }

      syncAuthUser();
      toast.success("Successfully logged in with Google.");
      navigate(location.state || "/dashboard", { replace: true });
    } catch (e) {
      toast.error(getFriendlyAuthError(e));
    } finally {
      setGoogleLoading(false);
    }
  };

  // ================= Handle Email/Password Submit ==============
  const onSubmit = async (data) => {
    if (isAnyLoading) return;
    setBtnLoading(true);

    try {
      const res = await loginUser(data.email.trim(), data.password);
      const check = await verifyDatabaseProfile(res.user);

      if (!check.registered) {
        toast.info("Account profile not found. Please complete registration.");
        navigate("/register", { replace: true });
        return;
      }

      syncAuthUser();
      toast.success("Successfully logged in.");
      navigate(location.state || "/dashboard", { replace: true });
    } catch (e) {
      toast.error(getFriendlyAuthError(e));
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-base-200/40">
      <title>Login | SupportHub</title>

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
          <Link
            to="/"
            className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-base-content/60 transition hover:text-primary"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to home
          </Link>

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
                className="bg-base-100/10 p-4 backdrop-blur-xs"
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
              <Link to="/" className="flex items-center gap-2">
                <GradientCard className="h-9 w-9 rounded-xl">
                  <Bot size={18} strokeWidth={2} />
                </GradientCard>

                <span className="text-lg font-semibold tracking-tight text-base-content">
                  Support<GradientText>Hub</GradientText>
                </span>
              </Link>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-base-content/60 hover:text-primary"
              >
                <ArrowLeft size={14} strokeWidth={2} />
                Home
              </Link>
            </div>

            <GradientShadow
              glowClassName="opacity-30 blur-md"
              radius="rounded-3xl"
            >
              <CardWithBlurBlob
                interactive={false}
                className="rounded-sm border-none p-6 md:p-7"
                blobColor="bg-primary/10"
                blobHoverColor="group-hover:bg-secondary/20"
              >
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-base-content">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-sm text-base-content/60">
                    Login to continue to SupportHub.
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
                        id="email"
                        type="email"
                        autoComplete="email"
                        disabled={isAnyLoading}
                        placeholder="example@email.com"
                        className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
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

                      <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <div className="relative">
                      <Lock
                        size={16}
                        strokeWidth={2}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                      />
                      <input
                        {...register("password", {
                          required: "Password field is empty",
                          minLength: {
                            value: 8,
                            message:
                              "Password must contain at least 8 characters",
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z]).+$/,
                            message:
                              "Password must contain at least one lowercase and one uppercase letter",
                          },
                        })}
                        id="password"
                        disabled={isAnyLoading}
                        placeholder="At least 8 characters"
                        autoComplete="current-password"
                        type={showPassword ? "text" : "password"}
                        className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 pr-11 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                      />

                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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
                    disabled={isAnyLoading}
                    shadow
                    className="w-full"
                    buttonClassName={`min-h-0 h-11 w-full text-sm font-semibold ${btnLoading ? "from-primary/10 to-secondary/20" : ""}`}
                    glowClassName="opacity-30"
                  >
                    {btnLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Login"
                    )}
                  </GradientButton>

                  {/* Validation Errors */}
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

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-base-content/10" />
                  <span className="text-xs font-medium text-base-content/40">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-base-content/10" />
                </div>

                <button
                  type="button"
                  onClick={googleSubmit}
                  disabled={isAnyLoading}
                  className="h-11 w-full items-center rounded-xl border border-base-content/10 bg-base-100 text-sm font-semibold text-base-content transition hover:border-primary/30 hover:bg-primary/5 disabled:opacity-60"
                >
                  {googleLoading ? (
                    <span className="loading loading-spinner loading-sm text-base-content" />
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <FcGoogle size={18} />
                      <span>Continue with Google</span>
                    </div>
                  )}
                </button>

                {/* Demo roles (4 roles) */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-base-content">
                      Instant Demo Login
                    </p>

                    <TextBadge variant="green" size="sm" uppercase={false}>
                      1-Click Access
                    </TextBadge>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {demoRoles.map((role) => {
                      const Icon = role.icon;
                      const isThisLoading = activeDemoRole === role.key;

                      return (
                        <button
                          key={role.key}
                          type="button"
                          disabled={isAnyLoading}
                          onClick={() => handleDemoLogin(role)}
                          className="group flex h-11 items-center justify-center gap-1.5 rounded-xl border border-base-content/10 bg-base-100/70 px-2.5 text-xs font-semibold text-base-content transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-60"
                        >
                          {isThisLoading ? (
                            <span className="loading loading-spinner loading-xs text-primary" />
                          ) : (
                            <>
                              <Icon
                                size={14}
                                strokeWidth={2}
                                className={cn(
                                  role.variant === "orange" &&
                                    "text-orange-500",
                                  role.variant === "pink" && "text-pink-500",
                                  role.variant === "cyan" && "text-cyan-500",
                                  role.variant === "green" && "text-green-500",
                                )}
                              />
                              <span>{role.label}</span>
                            </>
                          )}
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
