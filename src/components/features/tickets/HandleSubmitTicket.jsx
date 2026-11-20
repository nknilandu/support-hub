import { useContext, useState } from "react";
import GradientButton from "@/components/ui/Button/GradientButton";
import { AuthContext } from "@/providers/AuthProvider";
import { toast } from "react-toastify";

const HandleSubmitTicket = ({
  aiResult,
  ticketData,
  resolutionType,
  onSuccess,
  children,
}) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const { loading, user } = useContext(AuthContext);

  const handleSubmit = async () => {
    setUploadLoading(true);

    try {
      const token = await user.getIdToken();
      const payload = {
        ticketData,
        aiResult,
        resolutionType,
      };

      const res = await fetch("https://support-hub-server.vercel.app/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const isLimit = res.status === 403 && /limit/i.test(data.message || "");

        if (isLimit) {
          toast.warning(data.message);
          return;
        }

        throw new Error(data.message || "Ticket creation failed");
      }

      onSuccess?.(data);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      console.error(error);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <GradientButton
      disabled={uploadLoading || loading || !user}
      buttonClassName={`${uploadLoading && "px-8 from-primary/20 to-secondary/20 text-base-content/70"}`}
      onClick={handleSubmit}
    >
      {uploadLoading ? (
        <div className="flex justify-center items-center w-36">
          <span className="loading loading-spinner loading-sm"></span>
        </div>
      ) : (
        children
      )}
    </GradientButton>
  );
};

export default HandleSubmitTicket;
