import { Sparkles, Upload } from "lucide-react";
import GradientButton from "../ui/Button/GradientButton";
import SoftIconCard from "../ui/Card/SoftIconCard";
import CardWithBlurBlob from "../ui/Card/CardWithBlurBlob";
import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

const StepDescribe = ({ onNext }) => {
  const categories = [
    "Billing",
    "Technical",
    "Account",
    "Refund",
    "Bug",
    "Feature",
    "Other",
  ];

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const [files, setFiles] = useState([]);
  const [imageError, setImageError] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const updatedFiles = [...files, ...selectedFiles];
    setImageError(null);

    if (updatedFiles.length > 3) {
      setImageError("You can upload maximum 3 files");
      return;
    }
    setFiles(updatedFiles);
  };

  const handleRemoveFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };
  //   ========== upload image to imagebb ===============
  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await res.json();

    if (!data.success) {
      throw new Error("Image upload failed");
    }
    return data.data.display_url;
  };

  // +++++++++++++++++++ handle create click ++++++++++++++++++++
  const handleCreateTicket = async (data) => {
    try {
      setBtnLoading(true);
      let attachmentUrls = [];

      if (files.length) {
        attachmentUrls = await Promise.all(
          files.map((file) => uploadToImgBB(file)),
        );
      }

      const ticketData = {
        title: data.title,
        description: data.description,
        category: selectedCategory,
        attachments: attachmentUrls,
      };

      console.log(ticketData);
      setBtnLoading(false);

      // save ticket
    } catch (error) {
      console.error(error);
      setBtnLoading(false);
    }
  };

  return (
    <div>
      <CardWithBlurBlob className="p-6" interactive={false}>
        <form onSubmit={handleSubmit(handleCreateTicket)} className="space-y-6">
          {/* title */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Ticket title
            </label>

            <input
              {...register("title", {
                required: "Ticket title is required",
              })}
              type="text"
              disabled={btnLoading}
              placeholder="Short summary of the issue"
              className=" h-10 w-full rounded-xl border border-base-content/10 bg-base-100   px-4 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />

            {errors.title && (
              <p className="mt-2 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* category */}
          <div>
            <label className="mb-3 block text-sm font-medium">Category</label>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  disabled={btnLoading}
                  onClick={() => setSelectedCategory(category)}
                  className={`
          rounded-xl border px-4 py-2 text-xs font-medium transition

          ${
            selectedCategory === category
              ? "border-primary bg-primary/10 text-primary"
              : "border-base-content/10 bg-base-100 text-base-content/70 hover:border-primary/30"
          }
        `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 20,
                  message: "Description must be at least 20 characters",
                },
              })}
              rows={7}
              disabled={btnLoading}
              placeholder="What's happening? Steps to reproduce, expected vs actual..."
              className=" w-full rounded-xl border border-base-content/10 bg-base-100 p-4 text-sm text-base-content outline-none transition placeholder:text-base-content/35 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />

            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* attachments */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              Attachments
            </label>

            <label className="text-center flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-base-content/15 p-10 transition hover:border-primary/40">
              <SoftIconCard icon={Upload} variant="primary" />

              <h3 className="mt-4 text-sm font-medium">
                Drop files or click to upload (Maximun 3 files)
              </h3>

              <p className="mt-1 text-xs text-base-content/50 t">
                JPG, PNG, WEBP, PDF
              </p>

              <input
                type="file"
                disabled={btnLoading}
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {imageError && (
              <p className="mt-2 text-xs text-red-500">{imageError}</p>
            )}

            {files.length > 0 && !imageError && (
              <div className="flex mt-4 flex-wrap justify-start items-center gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-base-content/10 px-3 py-2 text-xs flex justify-between items-center"
                  >
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.name)}
                      className="ml-2 text-red-500 bg-red-500/10 hover:bg-red-500/30 p-1 rounded-full transition-all"
                    >
                      <RxCross2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* footer */}
          <div className="flex flex-col gap-4 border-t border-base-content/10 pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-base-content/50">
              AI suggestions are not final decisions.
            </p>

            <GradientButton
              type="submit"
              disabled={btnLoading}
              className="w-full md:w-fit"
              buttonClassName={`px-6 ${btnLoading && "from-primary/40 to-secondary/40"}`}
            >
              {btnLoading ? (
                <div className="px-18">
                  <span className="loading loading-spinner loading-sm"></span>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2">
                  <Sparkles size={15} />
                  <span>Get AI first response</span>
                </div>
              )}
            </GradientButton>
          </div>
        </form>
      </CardWithBlurBlob>
    </div>
  );
};

export default StepDescribe;
