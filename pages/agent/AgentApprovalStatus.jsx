import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import GradientButton from "../../components/ui/Button/GradientButton";
import TextBadge from "../../components/ui/Badge/TextBadge";

const statusConfig = {
  pending: {
    icon: Clock3,
    variant: "warning",
    badge: "Pending Review",
    title: "Agent Approval Pending",
    description:
      "Your agent account is currently under review. You will be able to access agent tickets and dashboard features after administrator approval.",
  },
  approved: {
    icon: CheckCircle2,
    variant: "green",
    badge: "Approved",
    title: "Agent Account Approved",
    description:
      "Your agent account has been approved. You can now access your agent dashboard and support tickets.",
  },
  rejected: {
    icon: XCircle,
    variant: "red",
    badge: "Application Rejected",
    title: "Agent Verification Rejected",
    description:
      "Your agent verification request was not approved by the administrator. Please contact support or your company admin for further details.",
  },
  suspended: {
    icon: ShieldAlert,
    variant: "red",
    badge: "Account Suspended",
    title: "Agent Access Suspended",
    description:
      "Your agent access has been temporarily suspended. Please reach out to your administrator to restore access.",
  },
};

const AgentApprovalStatus = ({ agent, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const approvalStatus = (agent?.verifyIdAgent || "pending").toLowerCase();

  const currentStatus =
    agent?.status === "suspended" ? "suspended" : approvalStatus;
  const config = statusConfig[currentStatus] || statusConfig.pending;
  const StatusIcon = config.icon;

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;

    setRefreshing(true);

    try {
      const result = await onRefresh();

      const updatedAgent = result?.data?.user || result?.user || result?.data;

      const updatedStatus =
        updatedAgent?.status === "suspended"
          ? "suspended"
          : updatedAgent?.verifyIdAgent?.toLowerCase();

      if (updatedStatus === "approved") {
        toast.success("Your agent account has been approved!");
      } else if (updatedStatus) {
        toast.info(
          `Current status: ${
            statusConfig[updatedStatus]?.badge || updatedStatus
          }`,
        );
      } else {
        toast.info("Status checked. Please review your account status.");
      }
    } catch (error) {
      console.error("Agent approval check failed:", error);

      toast.error("Failed to check status. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <SoftIconCard
          icon={StatusIcon}
          size={24}
          variant={config.variant}
          className="h-14 w-14"
        />

        <div className="mt-4">
          <TextBadge variant={config.variant}>{config.badge}</TextBadge>
        </div>

        <h1 className="mt-3 text-2xl font-semibold">{config.title}</h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-base-content/60">
          {config.description}
        </p>

        {agent?.email && (
          <p className="mt-2 text-xs text-base-content/45">
            Signed in as <span className="font-medium">{agent.email}</span>
          </p>
        )}
      </div>

      {/* Refresh */}
      <div className="mt-6 flex justify-center">
        <GradientButton
          onClick={handleRefresh}
          disabled={refreshing}
          buttonClassName="px-7"
        >
          {refreshing ? (
            <>
              <span className="loading loading-spinner loading-xs" />
              Checking
            </>
          ) : (
            <>
              <RefreshCw size={15} />
              Check Status
            </>
          )}
        </GradientButton>
      </div>
    </section>
  );
};

export default AgentApprovalStatus;
