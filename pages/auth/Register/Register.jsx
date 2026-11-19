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
  Upload,
  ChevronDown,
  ShieldCheck,
  X,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";

import { cn } from "../../../src/lib/cn";
import GradientButton from "../../../components/ui/Button/GradientButton";
import GradientText from "../../../components/ui/Text/GradientText";
import TextBadge from "../../../components/ui/Badge/TextBadge";
import GradientCard from "../../../components/ui/Card/GradientCard";
import CardWithBlurBlob from "../../../components/ui/Card/CardWithBlurBlob";
import GradientShadow from "../../../components/ui/Shadow/GradientShadowWrapper";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { AuthContext } from "../../../app/providers/AuthProvider";

const roles = [
  {
    value: "customer",
    label: "Customer",
    icon: UserRound,
    variant: "green",
    description: "Create and track your support tickets.",
  },
  {
    value: "agent",
    label: "Agent",
    icon: Headphones,
    variant: "cyan",
    description: "Handle assigned tickets and reply faster with AI.",
  },
  {
    value: "manager",
    label: "Manager",
    icon: ShieldCheck,
    variant: "pink",
    description: "Oversee team agents, assignments, and workflows.",
  },
  {
    value: "owner",
    label: "Owner",
    icon: Crown,
    variant: "orange",
    description: "Create company, manage team, billing, and workspace.",
  },
];

const infoCards = [
  {
    title: "Create your workspace",
    description:
      "Start with a secure account and choose the role that matches your workflow.",
    icon: Building2,
  },
  {
    title: "Role-based onboarding",
    description:
      "Owners, managers, agents, and customers get separate dashboards from day one.",
    icon: UserRound,
  },
  {
    title: "AI-ready support system",
    description:
      "Use AI summaries, drafts, first replies, and smarter ticket routing.",
    icon: MessageSquareText,
  },
];

const COMPANY_NAME_REGEX = /^[a-zA-Z0-9 _-]+$/;

const normalizeCompanyKey = (name) =>
  typeof name === "string" ? name.trim().toLowerCase().replace(/\s+/g, "") : "";

export default function Register() {
  const { googleSignIn, createUser, updateUserProfile, logOut } =
    useContext(AuthContext);

  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    setError,
    clearErrors,
  } = useForm();

  // ================= Load active companies from database ===================
  useEffect(() => {
    fetch("http://localhost:3021/companies")
      .then((res) => res.json())
      .then((data) => {
        setCompanyData(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        toast.error("Unable to load companies information");
        console.error(e);
      })
      .finally(() => {
        setCompanyLoading(false);
      });
  }, []);

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Helper: Validate company name format & uniqueness before creating account
  const validateOwnerCompanyName = (rawName) => {
    const cleaned =
      typeof rawName === "string" ? rawName.trim().replace(/\s+/g, " ") : "";

    if (!cleaned) {
      return { valid: false, message: "Company name is required" };
    }

    if (!COMPANY_NAME_REGEX.test(cleaned)) {
      return {
        valid: false,
        message:
          "Only letters, numbers, spaces, underscore (_), and hyphen (-) are allowed",
      };
    }

    const normalizedInput = normalizeCompanyKey(cleaned);
    if (!normalizedInput) {
      return { valid: false, message: "Company name cannot be empty" };
    }

    const isDuplicate = companyData.some(
      (c) => normalizeCompanyKey(c.companyName) === normalizedInput,
    );

    if (isDuplicate) {
      return {
        valid: false,
        message: "This company name is already registered",
      };
    }

    return { valid: true, companyName: cleaned };
  };

  // Helper: Optional ImgBB upload
  const uploadOptionalPhoto = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("image", file);

    const imgRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const imgData = await imgRes.json();
    if (!imgData.success) {
      throw new Error("Image upload failed");
    }

    return imgData.data.display_url;
  };

  // Helper: Save data to backend
  const saveToDB = async (url, payload, token) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  };

  // =========== Handle Google Sign-Up ==============
  const googleSubmit = async () => {
    clearErrors();

    const usernameInput = (getValues("username") || "").trim();
    if (!usernameInput) {
      setError("username", {
        type: "manual",
        message: "User name is required for Google sign up",
      });
      toast.error("Please enter your user name first");
      return;
    }

    let validatedCompanyName = "";
    if (selectedRole === "owner") {
      const check = validateOwnerCompanyName(getValues("companyname"));
      if (!check.valid) {
        setError("companyname", {
          type: "manual",
          message: check.message,
        });
        toast.error(check.message);
        return;
      }
      validatedCompanyName = check.companyName;
    } else if (!selectedCompany) {
      setError("companyselection", {
        type: "manual",
        message: "Company selection is required",
      });
      toast.error("Please select a company first");
      return;
    }

    try {
      setGoogleLoading(true);
      sessionStorage.setItem("isRegistering", "true");

      // 1. Optional photo upload first
      const uploadedPhoto = await uploadOptionalPhoto(profileImage);

      // 2. Google Sign In
      const res = await googleSignIn();
      const userData = res.user;
      const finalPhoto = uploadedPhoto || userData.photoURL || null;

      // 3. Update Firebase profile & refresh AuthContext user state immediately
      await updateUserProfile({
        displayName: usernameInput,
        photoURL: finalPhoto,
      });

      // 4. Get fresh Firebase token
      const token = await userData.getIdToken(true);

      // 5. Save user in MongoDB
      const userInfo = {
        uid: userData.uid,
        displayName: usernameInput,
        photoURL: finalPhoto,
        email: userData.email,
        role: selectedRole,
      };

      if (selectedRole !== "owner" && selectedCompany) {
        userInfo.companyName = selectedCompany.companyName;
        userInfo.companyId = selectedCompany._id;
      }

      const dbResult = await saveToDB(
        "http://localhost:3021/users",
        userInfo,
        token,
      );

      // 6. Create company if role is owner
      if (selectedRole === "owner") {
        try {
          await saveToDB(
            "http://localhost:3021/companies",
            {
              companyName: validatedCompanyName,
              companyLogo: finalPhoto,
              ownerId: dbResult.insertedId,
              ownerUid: userData.uid,
            },
            token,
          );
        } catch (companyErr) {
          await logOut();
          throw companyErr;
        }
      }

      toast.success("Account created successfully");
      navigate(location.state || "/dashboard", { replace: true });
    } catch (error) {
      console.error("Google registration error:", error);
      toast.error(error.message || "Google registration failed");
    } finally {
      sessionStorage.removeItem("isRegistering");
      setGoogleLoading(false);
    }
  };
  // +++++++++++++++++ Email & Password Submit +++++++++++++++++
  const onSubmit = async (data) => {
    clearErrors();

    let validatedCompanyName = "";
    if (selectedRole === "owner") {
      const check = validateOwnerCompanyName(data.companyname);
      if (!check.valid) {
        setError("companyname", {
          type: "manual",
          message: check.message,
        });
        return;
      }
      validatedCompanyName = check.companyName;
    }

    try {
      setBtnLoading(true);

      // 1. Optional photo upload
      const uploadedPhoto = await uploadOptionalPhoto(profileImage);
      const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.username.trim(),
      )}&background=random`;
      const finalPhoto = uploadedPhoto || fallbackAvatar;

      // 2. Create Firebase user
      const userCredential = await createUser(data.email.trim(), data.password);
      const userData = userCredential.user;

      // 3. Update Firebase profile & refresh AuthContext user state immediately
      await updateUserProfile({
        displayName: data.username.trim(),
        photoURL: finalPhoto,
      });

      // 4. Get fresh Firebase JWT token
      const token = await userData.getIdToken(true);

      // 5. Save user in MongoDB
      const userInfo = {
        uid: userData.uid,
        displayName: data.username.trim(),
        photoURL: finalPhoto,
        email: userData.email,
        role: selectedRole,
      };

      if (selectedRole !== "owner" && selectedCompany) {
        userInfo.companyName = selectedCompany.companyName;
        userInfo.companyId = selectedCompany._id;
      }

      const dbResult = await saveToDB(
        "http://localhost:3021/users",
        userInfo,
        token,
      );

      // 6. Save company in MongoDB (only owner)
      if (selectedRole === "owner") {
        await saveToDB(
          "http://localhost:3021/companies",
          {
            companyName: validatedCompanyName,
            companyLogo: finalPhoto,
            ownerId: dbResult.insertedId,
            ownerUid: userData.uid,
          },
          token,
        );
      }

      toast.success("Account created successfully");
      navigate(location.state || "/dashboard", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setBtnLoading(false);
    }
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
                Create Workspace
              </TextBadge>
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-tight tracking-tight text-base-content">
              Start your <GradientText>SupportHub</GradientText> account
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-base-content/65">
              Create an account, choose your role, and launch a support
              workspace built for modern SaaS teams.
            </p>
          </div>

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
                className="rounded-sm border-none p-5 md:p-6"
                blobColor="bg-primary/10"
                blobHoverColor="group-hover:bg-secondary/20"
              >
                <div className="mb-5 text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-base-content">
                    Create account
                  </h2>
                  <p className="mt-1 text-sm text-base-content/60">
                    Join SupportHub and choose your workspace role.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Optional Profile Photo + Required Username */}
                  <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                    <div className="relative flex justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("profileImage")?.click()
                        }
                        className="group relative flex h-18 w-18 items-center justify-center rounded-full border-2 border-dashed border-base-content/20 bg-base-100/70 text-base-content/40 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/20">
                            <Upload size={19} strokeWidth={2} />
                          </div>
                        )}

                        <span className="absolute -bottom-3 rounded-full border border-base-content/10 bg-base-100 px-2 py-0.5 text-[10px] font-medium text-base-content/50">
                          Optional
                        </span>
                      </button>

                      {profileImage && (
                        <button
                          type="button"
                          title="Remove photo"
                          onClick={() => {
                            setProfileImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white shadow-xs transition hover:scale-105"
                        >
                          <X size={11} />
                        </button>
                      )}

                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setProfileImage(file);
                          setImagePreview(URL.createObjectURL(file));
                          e.target.value = "";
                        }}
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-base-content/75">
                        User name <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <UserRound
                          size={15}
                          strokeWidth={2}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                        />
                        <input
                          {...register("username", {
                            required: "User name is required",
                            validate: (val) =>
                              val.trim().length > 0 || "User name is required",
                          })}
                          id="username"
                          type="text"
                          placeholder="Your full name"
                          className="h-10 w-full rounded-xl border border-base-content/10 bg-base-100 px-9 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Name (Owner only) */}
                  {selectedRole === "owner" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-base-content/75">
                        Company name <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Building2
                          size={15}
                          strokeWidth={2}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                        />
                        <input
                          {...register("companyname", {
                            validate: (value) => {
                              if (selectedRole !== "owner") return true;
                              const check = validateOwnerCompanyName(value);
                              return check.valid ? true : check.message;
                            },
                          })}
                          id="companyname"
                          type="text"
                          placeholder="e.g. Soft Tech"
                          className="h-10 w-full rounded-xl border border-base-content/10 bg-base-100 px-9 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-base-content/45">
                        Unique name. Letters, numbers, spaces, _ and - allowed.
                      </p>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-base-content/75">
                      Email <span className="text-red-500">*</span>
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
                        type="email"
                        autoComplete="email"
                        placeholder="example@email.com"
                        className="h-10 w-full rounded-xl border border-base-content/10 bg-base-100 px-9 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-base-content/75"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Lock
                        size={15}
                        strokeWidth={2}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                      />
                      <input
                        {...register("password", {
                          required: "Password is required",
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
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        type={showPassword ? "text" : "password"}
                        className="h-10 w-full rounded-xl border border-base-content/10 bg-base-100 px-9 pr-11 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 transition hover:text-primary"
                      >
                        {showPassword ? (
                          <EyeOff size={15} strokeWidth={2} />
                        ) : (
                          <Eye size={15} strokeWidth={2} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 4-Role Selection */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-base-content/75">
                      I am joining as
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.value;

                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => {
                              setSelectedRole(role.value);
                              clearErrors(["companyname", "companyselection"]);
                            }}
                            className={cn(
                              "relative flex h-16 flex-col items-center justify-center rounded-xl border bg-base-100/70 text-center transition",
                              "hover:border-primary/30 hover:bg-primary/5",
                              isSelected
                                ? "border-primary/40 bg-gradient-to-br from-primary/10 to-secondary/10"
                                : "border-base-content/10",
                            )}
                          >
                            <Icon
                              size={16}
                              strokeWidth={2}
                              className={cn(
                                "mb-1",
                                role.variant === "green" && "text-green-500",
                                role.variant === "cyan" && "text-cyan-500",
                                role.variant === "pink" && "text-pink-500",
                                role.variant === "orange" && "text-orange-500",
                              )}
                            />

                            <span className="text-[11px] font-semibold text-base-content">
                              {role.label}
                            </span>

                            {isSelected && (
                              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Select Company (Customer, Agent, Manager) */}
                  {selectedRole !== "owner" && (
                    <div>
                      <label
                        htmlFor="companyselection"
                        className="mb-2 block text-sm font-medium text-base-content/75"
                      >
                        Select Company <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Building2
                          size={15}
                          strokeWidth={2}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                        />

                        <select
                          {...register("companyselection", {
                            validate: (val) => {
                              if (selectedRole === "owner") return true;
                              return val
                                ? true
                                : "Company selection is required";
                            },
                            onChange: (e) => {
                              const selectedId = e.target.value;
                              const company = companyData.find(
                                (item) => item._id === selectedId,
                              );
                              setSelectedCompany(company || null);
                            },
                          })}
                          id="companyselection"
                          defaultValue=""
                          className="h-10 w-full appearance-none rounded-xl border border-base-content/10 bg-base-100 px-9 pr-10 text-sm text-base-content outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        >
                          <option value="" disabled>
                            {companyLoading
                              ? "Loading companies..."
                              : "Choose company"}
                          </option>

                          {!companyLoading &&
                            companyData.map((company) => (
                              <option key={company._id} value={company._id}>
                                {company.companyName}
                              </option>
                            ))}
                        </select>

                        <ChevronDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40"
                        />
                      </div>

                      {!companyLoading &&
                        (companyData.length === 0 ? (
                          <p className="mt-2 text-xs text-base-content/50">
                            No active company found.
                          </p>
                        ) : (
                          <p className="mt-2 text-xs text-base-content/50">
                            {companyData.length} active company found.
                          </p>
                        ))}

                      {selectedRole === "agent" && (
                        <p className="mt-2 text-xs leading-5 text-amber-500">
                          Agent account will stay pending until the company
                          owner or manager approves your request.
                        </p>
                      )}

                      {selectedRole === "manager" && (
                        <p className="mt-2 text-xs leading-5 text-amber-500">
                          Manager account will stay pending until the company
                          owner approves your request.
                        </p>
                      )}
                    </div>
                  )}

                  <GradientButton
                    type="submit"
                    disabled={btnLoading || googleLoading}
                    shadow
                    className="w-full"
                    buttonClassName={`min-h-0 h-11 w-full text-sm font-semibold ${
                      btnLoading && "from-primary/10 to-secondary/20"
                    }`}
                    glowClassName="opacity-30"
                  >
                    {btnLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Create Account"
                    )}
                  </GradientButton>

                  {/* Validation Errors */}
                  {errors.username ? (
                    <p className="-m-2 px-3 text-xs text-red-500">
                      {errors.username.message}
                    </p>
                  ) : selectedRole === "owner" && errors.companyname ? (
                    <p className="-m-2 px-3 text-xs text-red-500">
                      {errors.companyname.message}
                    </p>
                  ) : errors.email ? (
                    <p className="-m-2 px-3 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  ) : errors.password ? (
                    <p className="-m-2 px-3 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  ) : selectedRole !== "owner" && errors.companyselection ? (
                    <p className="-m-2 px-3 text-xs text-red-500">
                      {errors.companyselection.message}
                    </p>
                  ) : null}
                </form>

                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-base-content/10" />
                  <span className="text-xs font-medium text-base-content/40">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-base-content/10" />
                </div>

                {/* Google Sign Up */}
                <button
                  type="button"
                  onClick={googleSubmit}
                  disabled={btnLoading || googleLoading}
                  className="h-11 w-full items-center rounded-xl border border-base-content/10 bg-base-100 text-sm font-semibold text-base-content transition hover:border-primary/30 hover:bg-primary/5 disabled:opacity-60"
                >
                  {googleLoading ? (
                    <span className="loading loading-spinner loading-sm text-base-content" />
                  ) : (
                    <div className="flex justify-center gap-3">
                      <FcGoogle size={18} />
                      <span>Continue with Google</span>
                    </div>
                  )}
                </button>

                <p className="mt-5 text-center text-sm text-base-content/60">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </CardWithBlurBlob>
            </GradientShadow>

            <p className="mt-5 text-center text-xs leading-5 text-base-content/45">
              By continuing, you agree to our{" "}
              <Link to="/legal#terms" className="underline hover:text-primary">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/legal#privacy"
                className="underline hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
