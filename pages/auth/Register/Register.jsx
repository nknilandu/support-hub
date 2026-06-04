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
    value: "owner",
    label: "Owner",
    icon: Crown,
    variant: "blue",
    description: "Manage workspace, team, billing, and tickets.",
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
      "Owners, agents, and customers get separate dashboards from day one.",
    icon: UserRound,
  },
  {
    title: "AI-ready support system",
    description:
      "Use AI summaries, drafts, first replies, and smarter ticket routing.",
    icon: MessageSquareText,
  },
];

export default function Register() {
  const { googleSignIn, createUser, setUser, updateUserProfile } =
    useContext(AuthContext);

  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  // ================= load company data from database ===================
  useEffect(() => {
    fetch("http://localhost:3021/companies")
      .then((res) => res.json())
      .then((data) => {
        setCompanyData(data);
        // console.log(data);
      })
      .catch((e) => {
        toast.error("Unable to load company's information");
        console.log(e);
      })
      .finally(() => {
        setCompanyLoading(false);
      });
  }, []);

  // ++++++++++++ save data to db ============
  const saveUserToDB = (url, infoData, token) => {
    return fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(infoData),
    }).then((res) => res.json());
  };

  // ++++++++++++ google signup +++++++++++++++++
  const googleSubmit = () => {
    setGoogleLoading(true);

    const usernameInput = document.getElementById("username")?.value;
    const companyNameInput = document.getElementById("companyname")?.value;

    if (selectedRole === "owner" && !companyNameInput) {
      toast.error("Company name is required");
      setGoogleLoading(false);
      return;
    }

    if (
      (selectedRole === "customer" || selectedRole === "agent") &&
      !selectedCompany
    ) {
      toast.error("Company selection is required");
      setGoogleLoading(false);
      return;
    }

    googleSignIn()
      .then((res) => {
        const user = res.user;
        setUser(user);

        const finalName = usernameInput || user.displayName || "User";

        // if profile image then ImgBB upload
        if (profileImage) {
          const formData = new FormData();
          formData.append("image", profileImage);

          return fetch(
            `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
            {
              method: "POST",
              body: formData,
            },
          )
            .then((imgRes) => imgRes.json())
            .then((imgData) => {

              if (!imgData.success) {
                throw new Error("Image upload failed");
              }

              return {
                user,
                finalName,
                finalPhoto: imgData.data.display_url,
              };
            });
        }

        // else profile image then use Google photo
        return {
          user,
          finalName,
          finalPhoto: user.photoURL || null,
        };
      })

      // Firebase profile update
      .then(({ user, finalName, finalPhoto }) => {
        return updateUserProfile({
          displayName: finalName,
          photoURL: finalPhoto,
        }).then(() => {
          return { user, finalName, finalPhoto };
        });
      })

      // Save user to DB
      .then(({ user, finalName, finalPhoto }) => {
        const userInfo = {
          uid: user.uid,
          displayName: finalName,
          photoURL: finalPhoto,
          email: user.email,
          status: "active",
          role: selectedRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (selectedRole !== "owner" && selectedCompany) {
          userInfo.companyName = selectedCompany.companyName;
          userInfo.companyId = selectedCompany._id;
        }

        return saveUserToDB(
          "http://localhost:3021/users",
          userInfo,
          user.accessToken,
        ).then((dbResult) => {
          return {
            user,
            dbResult,
            finalPhoto,
            companyNameInput,
          };
        });
      })

      // Owner = company create
      .then(({ user, dbResult, finalPhoto, companyNameInput }) => {
        if (!dbResult.success) {
          throw new Error(dbResult.message || "User save failed");
        }

        // same email already exists
        if (dbResult.existing) {
          return {
            success: true,
            message: "User already exists",
          };
        }

        if (selectedRole === "owner") {
          const companyInfo = {
            companyName: companyNameInput,
            companyLogo: finalPhoto,
            ownerId: dbResult.insertedId,
            ownerUid: user.uid,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return saveUserToDB(
            "http://localhost:3021/companies",
            companyInfo,
            user.accessToken,
          );
        }

        return {
          success: true,
          message: "User created successfully",
        };
      })

      // Final response
      .then((finalResult) => {
        if (!finalResult.success) {
          throw new Error(finalResult.message || "Signup failed");
        }

        toast.success("Account created successfully");
        navigate(`${location.state ? location.state : "/"}`);
      })
      .catch((e) => {
        console.log(e);
        toast.error(e.message);
      })
      .finally(() => {
        setGoogleLoading(false);
        setBtnLoading(false);
      });
  };
  // +++++++++++++++++ button submit +++++++++++++++++

  const onSubmit = (data) => {
    setBtnLoading(true);

    const logo = profileImage;
    const formData = new FormData();
    formData.append("image", logo);

    // upload image to imgbb
    fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    )
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) {
          throw new Error("Image upload failed");
        }

        const photoLink = result.data.display_url;

        // create user on firebase
        return createUser(data.email, data.password).then((res) => {
          const user = res.user;
          setUser(user);

          // update user profile on firebase
          return updateUserProfile({
            displayName: data.username,
            photoURL: photoLink,
          }).then(() => {
            return { user, photoLink };
          });
        });
      })
      .then(({ user, photoLink }) => {
        const userInfo = {
          uid: user.uid,
          displayName: data.username,
          photoURL: photoLink,
          email: data.email,
          status: "active",
          role: selectedRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (selectedRole !== "owner" && selectedCompany) {
          userInfo.companyName = selectedCompany.companyName;
          userInfo.companyId = selectedCompany._id;
        }

        return saveUserToDB(
          "http://localhost:3021/users",
          userInfo,
          user.accessToken,
        ).then((dbResult) => {
          return { dbResult, user, photoLink };
        });
      })
      .then(({ dbResult, user, photoLink }) => {
        if (!dbResult.success) {
          throw new Error(dbResult.message || "User save failed");
        }

        if (selectedRole === "owner") {
          const companyInfo = {
            companyName: data.companyname,
            companyLogo: photoLink,
            ownerId: dbResult.insertedId,
            ownerUid: user.uid,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return saveUserToDB(
            "http://localhost:3021/companies",
            companyInfo,
            user.accessToken,
          );
        }

        return { success: true };
      })
      .then((finalResult) => {
        if (!finalResult.success) {
          throw new Error("Company save failed");
        }

        toast.success("Account created successfully");
        navigate(`${location.state ? location.state : "/"}`);
      })
      .catch((e) => {
        console.log(e);
        toast.error(e.message);
      })
      .finally(() => {
        setBtnLoading(false);
        setGoogleLoading(false);
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
                  {/* Profile + username */}
                  <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                    {/* Compact profile upload */}
                    <div className="flex justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("profileImage")?.click()
                        }
                        className="group relative flex h-18 w-18 items-center justify-center rounded-full border-2 border-dashed border-base-content/20 bg-base-100/70 text-base-content/40 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      >
                        {profileImage ? (
                          <img
                            src={URL.createObjectURL(profileImage)}
                            alt="Profile"
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-secondary/20">
                            <Upload size={19} strokeWidth={2} />
                          </div>
                        )}

                        <span className="absolute -bottom-3 rounded-full border bg-base-100 px-2 py-0.5 text-[10px] font-medium border-base-content/10 text-base-content/50">
                          Photo
                        </span>
                      </button>
                      {/* ====== */}
                      <input
                        {...register("profileImage", {
                          required: "Profile image is required",
                          onChange: (e) => {
                            const file = e.target.files?.[0];
                            setProfileImage(file || null);
                          },
                        })}
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* username */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-base-content/75">
                        User name
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
                          })}
                          id="username"
                          type="text"
                          placeholder="user name"
                          className="h-10 w-full rounded-xl border border-base-content/10 bg-base-100 px-9 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* company name */}

                  {selectedRole === "owner" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-base-content/75">
                        Company name
                      </label>

                      <div className="relative">
                        <Building2
                          size={15}
                          strokeWidth={2}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                        />
                        <input
                          {...register("companyname", {
                            required: "Company name is required",
                          })}
                          id="companyname"
                          type="text"
                          placeholder="company name"
                          className="h-10 w-full rounded-xl border border-base-content/10 bg-base-100 px-9 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-base-content/75">
                      Email
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
                      Password
                    </label>

                    <div className="relative">
                      <Lock
                        size={15}
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

                  {/* Compact role selection */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-base-content/75">
                      I am joining as
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.value;

                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => setSelectedRole(role.value)}
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
                                role.variant === "blue" && "text-blue-500",
                                role.variant === "cyan" && "text-cyan-500",
                                role.variant === "green" && "text-green-500",
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

                  {/* +++++++++++++++++++++++++++ */}

                  {(selectedRole === "agent" ||
                    selectedRole === "customer") && (
                    <div>
                      <label
                        htmlFor="organizationId"
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

                        {/* =========== */}
                        <select
                          {...register("companyselection", {
                            required:
                              selectedRole === "customer" ||
                              selectedRole === "agent"
                                ? "Company selection is required"
                                : false,

                            onChange: (e) => {
                              const selectedId = e.target.value;

                              const company = companyData.find(
                                (company) => company._id === selectedId,
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
                            {companyData.length} company found.
                          </p>
                        ))}

                      {selectedRole === "agent" && (
                        <p className="mt-2 text-xs leading-5 text-amber-500">
                          Agent account will stay pending until the company
                          owner approves your request.
                        </p>
                      )}
                    </div>
                  )}
                  {/* +++++++++++++++++++++++++++ */}

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
                      "Create Account"
                    )}
                  </GradientButton>

                  {/* error */}
                  {errors.profileImage ? (
                    <p className="-m-2 px-3 text-xs text-red-500">
                      {errors.profileImage.message}
                    </p>
                  ) : errors.username ? (
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

                {/* google  */}
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
              By continuing, you agree to SupportHub&apos;s Terms and Privacy
              Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
