import { useContext, useEffect, useState } from "react";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import { AuthContext } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import TextBadge from "@/components/ui/Badge/TextBadge";
import {
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Crown,
  Globe,
  Headphones,
  Languages,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import GradientButton from "@/components/ui/Button/GradientButton";
import { toast } from "react-toastify";

const Profile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imgSaving, setImgSaving] = useState(false);

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    location: "",
    language: "English (US)",
    timezone: "GMT +06:00 Bangladesh",
  });

  // ========== Load profile data from database ==============
  const {
    data: userData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["myProfile", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch("https://support-hub-server.vercel.app/users/me", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch profile");
      }
      return result.user;
    },
  });

  // ================= Role Color & Icon Configuration ===================
  const roleConfig = {
    customer: { icon: User, variant: "green", label: "Customer" },
    agent: { icon: Headphones, variant: "cyan", label: "Support Agent" },
    manager: { icon: ShieldCheck, variant: "pink", label: "Manager" },
    owner: { icon: Crown, variant: "orange", label: "Company Owner" },
  };

  const normalizedRole = userData?.role?.toLowerCase() || "";
  const config = roleConfig[normalizedRole] || {
    icon: User,
    variant: "slate",
    label: userData?.role || "User",
  };
  const RoleIcon = config.icon;

  // ============================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ============================
  const handleSaveChanges = async () => {
    if (!formData.displayName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const token = await user.getIdToken();

      const res = await fetch("https://support-hub-server.vercel.app/users/me", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          displayName: formData.displayName.trim(),
          phone: formData.phone.trim(),
          location: formData.location.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update profile");
      }

      if (
        formData?.displayName &&
        formData.displayName.trim() !== user?.displayName
      ) {
        await updateUserProfile({
          displayName: formData.displayName.trim(),
        });
      }

      toast.success("Profile updated successfully");
      refetch();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ======================
  const handlePhotoSave = async () => {
    if (!photo) return;

    try {
      setImgSaving(true);

      // Upload To IMGBB
      const uploadData = new FormData();
      uploadData.append("image", photo);

      const imgRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      const imgData = await imgRes.json();

      if (!imgData.success) {
        throw new Error("Image upload failed");
      }

      const photoURL = imgData.data.display_url;
      const token = await user.getIdToken();

      // MongoDB Update
      const res = await fetch("https://support-hub-server.vercel.app/users/me", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          photoURL,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save profile photo");
      }

      // Firebase Update
      await updateUserProfile({
        photoURL,
      });

      toast.success("Profile photo updated");
      setPhoto(null);
      setPreview(null);

      await refetch();
    } catch (error) {
      toast.error(error.message || "Photo update failed");
    } finally {
      setImgSaving(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData?.displayName || "",
        phone: userData?.phone || "",
        location: userData?.location || "",
        language: userData?.language || "English (US)",
        timezone: userData?.timezone || "GMT +06:00 Bangladesh",
      });
    }
  }, [userData]);

  // Prevent memory leakage from object URL
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const avatarSrc =
    preview ||
    userData?.photoURL ||
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData?.displayName || user?.displayName || "User",
    )}&background=random`;

  const hasCompanyBadge = ["customer", "agent", "manager", "owner"].includes(
    normalizedRole,
  );

  // ==========================
  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 lg:p-6">
      {/* ================================================= */}
      {/* TOP PROFILE HEADER CARD                           */}
      {/* ================================================= */}
      <CardWithBlurBlob interactive={false} className="p-6">
        {loading ? (
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="h-22 w-22 shrink-0 rounded-2xl skeleton" />

            <div className="flex-1 space-y-2.5">
              <div className="h-5 w-44 rounded-lg skeleton" />
              <div className="h-4 w-60 rounded-lg skeleton" />

              <div className="flex flex-wrap gap-2 pt-1">
                <div className="h-6 w-24 rounded-full skeleton" />
                <div className="h-6 w-28 rounded-full skeleton" />
                <div className="h-6 w-28 rounded-full skeleton" />
              </div>
            </div>

            <div className="h-10 w-28 rounded-xl skeleton" />
          </div>
        ) : (
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {/* Avatar with subtle gradient ring & quick camera trigger */}
              <div className="relative shrink-0">
                <div className="rounded-2xl bg-gradient-to-tr from-primary/40 via-secondary/30 to-primary/10 p-[2px] shadow-sm">
                  <div className="h-22 w-22 overflow-hidden rounded-[14px] bg-base-300">
                    <img
                      src={avatarSrc}
                      alt="profile"
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  title="Change photo"
                  disabled={imgSaving}
                  onClick={() =>
                    document.getElementById("profilePhoto")?.click()
                  }
                  className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-xl border border-base-content/15 bg-base-100 text-base-content/75 shadow-sm transition hover:border-primary/40 hover:text-primary"
                >
                  <Camera size={13} />
                </button>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profilePhoto"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setPhoto(file);
                    setPreview(URL.createObjectURL(file));
                    e.target.value = "";
                  }}
                />
              </div>

              {/* User Identity & Role Badges */}
              <div className="min-w-0 flex-1 break-all">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-base-content">
                    {userData?.displayName || user?.displayName || "User"}
                  </h2>

                  {userData?.status && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${
                        userData.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      <CheckCircle2 size={11} />
                      {userData.status}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 break-all text-sm text-base-content/60">
                  {user?.email}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TextBadge variant={config.variant}>
                    <RoleIcon size={13} className="mr-1" />
                    {config.label}
                  </TextBadge>

                  {hasCompanyBadge && (
                    <TextBadge variant="purple">
                      <Building2 size={13} className="mr-1" />
                      {userData?.companyName || "No company"}
                    </TextBadge>
                  )}

                  <TextBadge variant="slate">
                    <Calendar size={13} className="mr-1" />
                    {userData?.createdAt
                      ? `Joined ${new Date(
                          userData.createdAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}`
                      : "Joining date unavailable"}
                  </TextBadge>
                </div>
              </div>
            </div>

            {/* Photo Actions */}
            <div className="flex w-full items-center justify-start gap-2 sm:w-auto sm:justify-end">
              {photo && !imgSaving && (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setPreview(null);
                  }}
                  className="flex h-10 items-center gap-1.5 rounded-xl border border-base-content/10 bg-base-100 px-3.5 text-xs font-medium text-base-content/70 transition hover:bg-base-200"
                >
                  <X size={14} />
                  Discard
                </button>
              )}

              <GradientButton
                buttonClassName={`${
                  imgSaving ? "from-primary/10 to-secondary/10" : "px-4"
                }`}
                onClick={() => {
                  if (photo) {
                    handlePhotoSave();
                  } else {
                    document.getElementById("profilePhoto")?.click();
                  }
                }}
                disabled={imgSaving}
              >
                {imgSaving ? (
                  <span className="loading loading-spinner loading-sm mx-8" />
                ) : photo ? (
                  <>
                    <Save size={16} />
                    Save Photo
                  </>
                ) : (
                  <>
                    <Camera size={16} />
                    Edit Photo
                  </>
                )}
              </GradientButton>
            </div>
          </div>
        )}
      </CardWithBlurBlob>

      {/* ================================================= */}
      {/* PERSONAL INFORMATION FORM CARD                    */}
      {/* ================================================= */}
      <CardWithBlurBlob interactive={false} className="p-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-5 w-44 rounded-lg skeleton" />
            <div className="h-4 w-72 rounded-lg skeleton" />
            <div className="grid grid-cols-1 gap-5 pt-4 md:grid-cols-2">
              <div className="h-12 w-full rounded-xl skeleton" />
              <div className="h-12 w-full rounded-xl skeleton" />
              <div className="h-12 w-full rounded-xl skeleton" />
              <div className="h-12 w-full rounded-xl skeleton" />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 border-b border-base-content/10 pb-4">
              <h3 className="text-lg font-semibold text-base-content/85">
                Personal Information
              </h3>

              <p className="mt-0.5 text-sm text-base-content/55">
                Update your display name, contact details, and regional
                preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    name="displayName"
                    value={formData?.displayName}
                    onChange={handleChange}
                    placeholder="Your name here"
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/35"
                  />

                  <input
                    value={user?.email || ""}
                    disabled
                    className="h-12 w-full cursor-not-allowed rounded-xl border border-base-content/10 bg-base-200/50 pl-10 pr-4 text-sm text-base-content/55 outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+880 1XXX-XXXXXX"
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  Location
                </label>

                <div className="relative">
                  <MapPin
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Dhaka, Bangladesh"
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  Language
                </label>

                <div className="relative">
                  <Languages
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  >
                    <option>English (US)</option>
                    <option>English (UK)</option>
                  </select>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-base-content/55">
                  Timezone
                </label>

                <div className="relative">
                  <Globe
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  >
                    <option>GMT +06:00 Bangladesh</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-base-content/10 pt-5 sm:flex-row">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setFormData({
                    displayName: userData?.displayName || "",
                    phone: userData?.phone || "",
                    location: userData?.location || "",
                    language: userData?.language || "English (US)",
                    timezone: userData?.timezone || "GMT +06:00 Bangladesh",
                  });

                  setPhoto(null);
                  setPreview(null);
                }}
                className="h-11 rounded-xl border border-base-content/10 bg-base-100 px-5 text-sm font-medium transition hover:bg-base-200 disabled:opacity-50"
              >
                Reset
              </button>

              <GradientButton
                buttonClassName={`px-6 ${
                  saving ? "from-primary/10 to-secondary/10" : ""
                }`}
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm mx-9" />
                ) : (
                  "Save Changes"
                )}
              </GradientButton>
            </div>
          </div>
        )}
      </CardWithBlurBlob>
    </div>
  );
};

export default Profile;