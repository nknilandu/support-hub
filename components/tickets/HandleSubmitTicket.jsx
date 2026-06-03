import { useContext, useState } from "react";
import GradientButton from "../ui/Button/GradientButton";
import { AuthContext } from "../../app/providers/AuthProvider";
import { toast } from "react-toastify";

const HandleSubmitTicket = ({
  aiResult,
  resolutionType,
  onSuccess,
  children,
}) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const { loading, user } = useContext(AuthContext);

  const handleSubmit = () => {
    setUploadLoading(true);

    const payload = {
      uid: user.uid,
      email: user.email,
      supportMode: resolutionType === "human" ? "human" : "ai",
      resolutionSource: resolutionType === "ai" ? "ai" : null,
      aiResolved: resolutionType === "ai",
      escalatedToHuman: resolutionType === "human",
      status: resolutionType === "ai" ? "resolved" : "open",
      assignedAgents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      aiResult,
    };

    fetch("http://localhost:3021/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Ticket creation failed");
        }
        onSuccess?.(data);
      })
      .catch((err) => {
        toast.error(err.message || "Something went wrong");
        console.error(err);
      })
      .finally(() => {
        setUploadLoading(false);
      });
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
