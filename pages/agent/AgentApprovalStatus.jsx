import { Clock3, RefreshCw } from "lucide-react";

import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import GradientButton from "../../components/ui/Button/GradientButton";
import { useState } from "react";

const AgentApprovalStatus = ({ onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="flex flex-col min-h-[75vh] items-center justify-center p-4 lg:p-5 ">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <SoftIconCard
          icon={Clock3}
          size={24}
          variant="warning"
          className="h-14 w-14"
        />

        <h1 className="mt-5 text-2xl font-semibold">Agent Approval Pending</h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-base-content/60">
          Your agent account is currently under review. You will be able to
          access agent tickets and dashboard features after administrator
          approval.
        </p>
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
