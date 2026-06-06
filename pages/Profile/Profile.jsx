import { useContext, useEffect, useState } from "react";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import { AuthContext } from "../../app/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import TextBadge from "../../components/ui/Badge/TextBadge";
import {
  Award,
  Building2,
  Calendar,
  Camera,
  Crown,
  Globe,
  Headphones,
  Languages,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";
import GradientButton from "../../components/ui/Button/GradientButton";
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

  //   ========== load data from database ==============
  const {
    data: userData,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["myProfile"],
    enabled: !!user?.accessToken,
    queryFn: async () => {
      const res = await fetch("http://localhost:3021/users/me", {
        headers: {
          authorization: `Bearer ${user.accessToken}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch tickets");
      }
      return result.user;
    },
  });

  //   ================= configure icon ===================

  const roleConfig = {
    customer: { icon: User, variant: "cyan" },
    agent: { icon: Headphones, variant: "green" },
    owner: { icon: Crown, variant: "pink" },
    platform: { icon: Award, variant: "purple" },
  };

  const config = roleConfig[userData?.role] || { icon: User, variant: "slate" };
  const Icon = config.icon;

  //   ++++++++++++++++++++++++++++
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  // ============================
  const handleSaveChanges = async () => {
    try {
      setSaving(true);

      const res = await fetch("http://localhost:3021/users/me", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // if Backend success then => Firebase update
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
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };
  // ======================
  const handlePhotoSave = async () => {
    try {
      setImgSaving(true);

      // ======================
      // Upload To IMGBB
      // ======================

      const formData = new FormData();
      formData.append("image", photo);

      const imgRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${
          import.meta.env.VITE_IMGBB_API_KEY
        }`,
        {
          method: "POST",
          body: formData,
        },
      );

      const imgData = await imgRes.json();

      if (!imgData.success) {
        throw new Error("Image upload failed");
      }

      const photoURL = imgData.data.display_url;

      // ======================
      // MongoDB Update
      // ======================

      const res = await fetch("http://localhost:3021/users/me", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          photoURL,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // ======================
      // Firebase Update
      // ======================

      await updateUserProfile({
        photoURL,
      });

      toast.success("Profile photo updated");
      setPhoto(null);
      setPreview(null);

      await refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setImgSaving(false);
    }
  };
  // ======================

  //   console.log(userData);

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

  //   ============= (optional) to prevent memory leakage
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ==========================

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <CardWithBlurBlob interactive={false}>
        {loading ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="shrink-0 sm:mx-0">
              <div className="h-20 w-20 rounded-xl skeleton" />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded-xl skeleton " />
              <div className="h-4 w-60 rounded-xl skeleton " />

              <div className="mt-3 flex flex-wrap justify-start gap-2">
                <div className="h-5 w-18 rounded-xl skeleton " />
                <div className="h-5 w-18 rounded-xl skeleton " />
                <div className="h-5 w-18 rounded-xl skeleton " />
                <div className="h-5 w-18 rounded-xl skeleton " />
              </div>
            </div>
            <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              <div className="h-8 w-18 rounded-xl skeleton " />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            {/* Avatar */}
            <div className="shrink-0 sm:mx-0">
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-base-300">
                  <img
                    src={preview || userData?.photoURL || user?.photoURL}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profilePhoto"
                  onChange={(e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    setPhoto(file);
                    setPreview(URL.createObjectURL(file));
                  }}
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 sm:text-left break-all">
              <h2 className="text-xl font-semibold text-base-content/80">
                {userData?.displayName || user?.displayName}
              </h2>

              <p className="text-sm text-base-content/60 break-all">
                {user?.email}
              </p>

              <div className="mt-3 flex flex-wrap justify-start gap-2">
                <TextBadge variant={config.variant}>
                  <Icon size={13} className="mr-1" />
                  {userData?.role}
                </TextBadge>

                {(userData?.role?.toLowerCase() === "customer" ||
                  userData?.role?.toLowerCase() === "agent") && (
                  <TextBadge variant="orange">
                    <Building2 size={13} className="mr-1" />
                    {userData?.companyName || "No company"}
                  </TextBadge>
                )}

                <TextBadge variant="slate">
                  <Calendar size={13} className="mr-1" />
                  {userData?.createdAt
                    ? `Joined ${new Date(userData.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        },
                      )}`
                    : "Joining date unavailable"}
                </TextBadge>
              </div>
            </div>

            {/* ===================== Button ================ */}
            <div className="w-full sm:w-auto flex justify-start sm:justify-end">
              {
                <GradientButton
                  buttonClassName={`${imgSaving && "from-primary/10 to-secondary/10"}`}
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
                    <span className="loading loading-spinner loading-sm mx-9"></span>
                  ) : photo ? (
                    <>
                      <Save size={17} />
                      Save Photo
                    </>
                  ) : (
                    <>
                      <Camera size={17} />
                      Edit Photo
                    </>
                  )}
                </GradientButton>
              }
            </div>
          </div>
        )}
      </CardWithBlurBlob>

      {/* ++++++++++++++++++++++++++++++++++ */}
      {/* ++++++++++++++++++++++++++++++++++ */}
      <CardWithBlurBlob interactive={false} className="mt-4 p-6">
        {loading ? (
          <div className="space-y-2">
            <div className="h-5 w-full rounded-xl skeleton " />
            <div className="h-5 w-full rounded-xl skeleton " />
            <div className="h-5 w-1/2 rounded-xl skeleton " />
            <div className="h-5 w-full rounded-xl skeleton mt-10" />
            <div className="h-5 w-full rounded-xl skeleton " />
            <div className="h-5 w-1/2 rounded-xl skeleton " />
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-base-content/70">
                Personal Information
              </h3>

              <p className="text-sm text-base-content/60">
                Update your name, contact and local settings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-base-content/50">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    name="displayName"
                    value={formData?.displayName}
                    onChange={handleChange}
                    placeholder="Your name here"
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-base-content/50">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    value={user?.email}
                    disabled
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-base-content/50">
                  Phone
                </label>

                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    name="phone"
                    type="number"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+8801XXXXXXXXX"
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-base-content/50">
                  Location
                </label>

                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Dhaka, Bangladesh"
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-base-content/50">
                  Language
                </label>

                <div className="relative">
                  <Languages
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  >
                    <option>English (US)</option>
                    <option>English (UK)</option>
                  </select>
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-base-content/50">
                  Timezone
                </label>

                <div className="relative">
                  <Globe
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                  />

                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="h-12 w-full rounded-xl border border-base-content/10 bg-base-100 px-10 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  >
                    <option>GMT +06:00 Bangladesh</option>
                    {/* <option>GMT +00:00 UTC</option>
          <option>GMT -08:00 Pacific</option> */}
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
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
                className="h-11 px-5 rounded-xl border border-base-content/10 bg-base-100 text-sm font-medium hover:bg-base-200 transition"
              >
                Cancel
              </button>

              <GradientButton
                buttonClassName={`${saving && "from-primary/10 to-secondary/10"}`}
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm mx-9"></span>
                ) : (
                  "Save Changes"
                )}
              </GradientButton>
            </div>
          </div>
        )}
      </CardWithBlurBlob>
      {/* ++++++++++++++++++++++++++++++++++ */}
    </div>
  );
};

export default Profile;
