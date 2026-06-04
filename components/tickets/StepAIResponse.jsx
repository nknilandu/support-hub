import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock4,
  Lightbulb,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import CardWithBlurBlob from "../ui/Card/CardWithBlurBlob";
import GradientButton from "../ui/Button/GradientButton";
import SoftIconCard from "../ui/Card/SoftIconCard";
import TextBadge from "../ui/Badge/TextBadge";
import { useState } from "react";
import HandleSubmitTicket from "./HandleSubmitTicket";
import { toast } from "react-toastify";

const StepAIResponse = ({
  setTicket,
  ticketData,
  setTicketData,
  aiResult,
  setAiResult,
  setStep,
}) => {
  const [dataLoading, setDataLoading] = useState(false);

  const resultData = {
    ticketTitle: "Unable to connect Slack integration",
    summary:
      "The issue appears to be related to workspace integration configuration.",
    category: "Technical",
    rootCause: "detailed description between 5-10 sentences",

    metrics: [
      {
        label: "Estimated resolution",
        value: "5-10 minutes",
      },
      {
        label: "Self-serve success rate",
        value: "92%",
      },
      {
        label: "Similar tickets",
        value: "10",
      },
    ],

    states: [
      {
        title: "Confidence Score",
        value: "87%",
        description: "Above average",
        variant: "success",
      },
      {
        title: "Priority",
        value: "High",
        description: "Affects core workflow",
        variant: "orange",
      },
      {
        title: "Risk Level",
        value: "Low",
        description: "Minimal data exposure",
        variant: "green",
      },
    ],

    recommendations: [
      {
        title: "Reconnect Integration",
        impact: "High",
        variant: "red",
        description: "Disconnect and reconnect the affected integration.",
      },
      {
        title: "Verify Permissions",
        impact: "Medium",
        variant: "orange",
        description: "Ensure all required workspace permissions are granted.",
      },
      {
        title: "Verify Permissions",
        impact: "Medium",
        variant: "orange",
        description: "Ensure all required workspace permissions are granted.",
      },
    ],

    steps: [
      {
        id: 1,
        title: "Clear browser cache",
        description:
          "Remove cached files and sign out from your current session.",
        impact: "High",
        estimatedTime: "1 min",
      },
      {
        id: 2,
        title: "Sign back in",
        description: "Authenticate again to refresh your account session.",
        impact: "Medium",
        estimatedTime: "30 sec",
      },
      {
        id: 3,
        title: "Reconnect integration",
        description: "Disconnect and reconnect the affected integration.",
        impact: "High",
        estimatedTime: "2 min",
      },
      {
        id: 4,
        title: "Verify permissions",
        description: "Confirm all required workspace permissions are enabled.",
        impact: "Medium",
        estimatedTime: "1 min",
      },
    ],

    escalation: {
      recommended: false,
      reason: "85 similar tickets were resolved without agent involvement.",
      confidence: 92,
    },
  };

  useState(() => {
    setAiResult(resultData);
  }, []);

  console.log(ticketData);
  console.log(aiResult);

  return (
    <CardWithBlurBlob className="p-6" interactive={false}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SoftIconCard icon={Sparkles} variant="primary" />
            <div>
              <h2 className="text-lg font-semibold">AI First Response</h2>
              <p className="text-xs text-base-content/70">
                AI analyzed your issue and found a likely solution.
              </p>
            </div>
          </div>
          {dataLoading ? (
            <div className="skeleton h-6 w-1/12 rounded-full"></div>
          ) : (
            <TextBadge variant="cyan" size="xl">
              <Brain size={15} className="mr-1" />
              {aiResult?.category}
            </TextBadge>
          )}
        </div>

        {dataLoading ? (
          <div className="my-6 flex flex-col gap-3 justify-start items-start">
            <div className="skeleton h-5 w-full rounded-full"></div>
            <div className="skeleton h-5 w-full rounded-full"></div>
            <div className="skeleton h-5 w-3/4 rounded-full"></div>
            <div className="skeleton h-5 w-1/3 rounded-full mt-4"></div>
            <div className="skeleton h-5 w-2/5 rounded-full"></div>
            <div className="skeleton h-5 w-2/5 rounded-full"></div>
            <div className="skeleton h-5 w-1/12 rounded-full"></div>
          </div>
        ) : (
          <div>
            <div>
              <h2 className="mt-6 font-semibold text-xl text-base-content/80">
                {aiResult?.ticketTitle}
              </h2>
              <p className="mt-2 text-base-content/80">{aiResult?.summary}</p>

              <div className="mt-5 w-full h-1 border-t border-base-content/10" />
            </div>
            {/* ============================== */}
            <div className="flex flex-wrap gap-3 mt-3">
              {aiResult?.metrics.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-start items-center w-fit mr-6"
                >
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <p className="ml-1 text-base-content/60 text-xs">
                    {item.label}
                    {":"}
                  </p>
                  <p className="ml-1 font-semibold text-base-content/80 text-xs">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            {/* +++++++++++++++++++++ */}

            <div className="grid gap-4 sm:grid-cols-3 mt-5">
              {aiResult?.states.map((state, index) => (
                <CardWithBlurBlob
                  key={index}
                  interactive={false}
                  className="p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-base-content/50">
                        {state.title}
                      </p>
                      <p className=" text-[11px] text-base-content/60">
                        {state.description}
                      </p>
                    </div>

                    {state.value.includes("%") ? (
                      <div
                        className="radial-progress text-primary text-[11px] font-semibold"
                        style={{
                          "--value": parseInt(state.value, 10),
                          "--size": "2.5rem",
                        }}
                        aria-valuenow={parseInt(state.value, 10)}
                        role="progressbar"
                      >
                        {state.value}
                      </div>
                    ) : (
                      <TextBadge variant={state.variant} size="xl">
                        {state.value}
                      </TextBadge>
                    )}
                  </div>
                </CardWithBlurBlob>
              ))}
            </div>

            {/* +++++++++++++++++++++ */}

            <div>
              <div className="flex justify-start items-center gap-2 mt-6">
                <SoftIconCard
                  icon={TriangleAlert}
                  className="h-6 w-6 rounded-lg"
                  size={14}
                  variant="warning"
                ></SoftIconCard>
                <h2 className=" font-semibold text-xl text-base-content/80">
                  Likely Root Cause
                </h2>
              </div>
              <p className="mt-2 text-base-content/80">{aiResult?.rootCause}</p>

              <div className="mt-5 w-full h-1 border-t border-base-content/10" />
            </div>

            {/* +++++++++++++++++++++ */}

            <div>
              <div className="flex justify-start items-center gap-2 mt-6">
                <SoftIconCard
                  icon={Lightbulb}
                  className="h-6 w-6 rounded-lg"
                  size={14}
                  variant="cyan"
                ></SoftIconCard>
                <h2 className=" font-semibold text-xl text-base-content/80">
                  Recommended Actions
                </h2>
              </div>
              {/* ======== */}

              <div className="mt-5 grid sm:grid-cols-2 gap-2">
                {aiResult?.recommendations?.map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between gap-4 rounded-2xl border-2 p-3 transition-all border-base-content/10 border-dashed hover:border-primary/20"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 size={16} className="text-success" />
                      </div>

                      {/* Content */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{item.title}</h3>

                          <TextBadge variant={item.variant}>
                            {item.impact}
                          </TextBadge>
                        </div>

                        <p className=" text-sm text-base-content/60">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 w-full h-1 border-t border-base-content/10" />
            </div>

            {/* +++++++++++++++++++++ */}

            <div>
              <div className="flex justify-start items-center gap-2 mt-6">
                <SoftIconCard
                  icon={Clock4}
                  className="h-6 w-6 rounded-lg"
                  size={14}
                  variant="pink"
                ></SoftIconCard>
                <h2 className=" font-semibold text-xl text-base-content/80">
                  Suggested Resolution Steps
                </h2>
              </div>
              {/* ======================== */}

              <div className="space-y-6 mt-8">
                {aiResult?.steps?.map((step, index) => (
                  <div key={index} className="relative flex gap-5">
                    {/* Timeline */}
                    <div className="relative flex flex-col justify-start items-center">
                      <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-base-300 text-sm font-semibold">
                        {step.id}
                      </div>

                      {index !== aiResult?.steps.length - 1 && (
                        <div className="absolute top-10 h-8 w-px bg-base-content/20" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{step.title}</h3>

                        <span className="badge bg-base-content/10 badge-sm">
                          {step.estimatedTime}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-base-content/60">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* +++++++++++++++++++++ */}

            <div
              className={`mt-6 p-4 border rounded-2xl shrink-0 ${
                aiResult?.escalation.recommended
                  ? "border-warning/20 bg-warning/5"
                  : "border-success/20 bg-success/5"
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`
      h-9 w-9 shrink-0
      flex items-center justify-center
      rounded-xl text-base-100
      ${aiResult?.escalation.recommended ? "bg-warning" : "bg-success"}
    `}
                >
                  {aiResult?.escalation.recommended ? (
                    <AlertTriangle size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">
                    {aiResult?.escalation.recommended
                      ? "Human Review Recommended"
                      : "Self-Service Recommended"}
                  </h3>

                  <p className="mt-1 text-sm text-base-content/60">
                    {aiResult?.escalation.recommended
                      ? "This issue may require agent assistance due to complexity, risk, or account-specific factors."
                      : "AI believes this issue can likely be resolved without agent involvement by following the suggested steps."}
                  </p>
                </div>
              </div>
            </div>

            {/* +++++++++++++++++++++ */}

            <p className="mt-5 text-base-content/80">{aiResult?.reason}</p>

            <div className="mt-5 flex gap-3 justify-end">
              <HandleSubmitTicket
                resolutionType="ai"
                aiResult={aiResult}
                onSuccess={(data) => {
                  console.log("ticket Created", data);
                  toast("ticket created");
                  setTicketData(null);
                  setAiResult(null);
                  setTicket(data);
                  setStep(4);
                }}
              >
                This solved my issue
              </HandleSubmitTicket>

              <GradientButton
                buttonClassName="px-8 from-primary/70 to-secondary/70 "
                onClick={() => setStep(3)}
              >
                Need human support
              </GradientButton>
            </div>

            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-sm text-base-content/50 hover:text-primary transition-all"
            >
              <ArrowLeft size={14} />
              Edit issue
            </button>
          </div>
        )}
      </div>
    </CardWithBlurBlob>
  );
};

export default StepAIResponse;
