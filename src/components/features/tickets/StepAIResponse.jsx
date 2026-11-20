import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock4,
  Lightbulb,
  Sparkles,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import GradientButton from "@/components/ui/Button/GradientButton";
import SoftIconCard from "@/components/ui/Card/SoftIconCard";
import TextBadge from "@/components/ui/Badge/TextBadge";
import { useContext, useEffect, useState } from "react";
import HandleSubmitTicket from "./HandleSubmitTicket";
import { toast } from "react-toastify";
import { AuthContext } from "@/providers/AuthProvider";

const StepAIResponse = ({
  setTicket,
  ticketData,
  setTicketData,
  aiResult,
  setAiResult,
  setStep,
}) => {
  const { user } = useContext(AuthContext);
  const [dataLoading, setDataLoading] = useState(false);
  const [limitError, setLimitError] = useState(null);

  // ========= fetch ai data ================

  useEffect(() => {
    const isValidObject =
      ticketData &&
      typeof ticketData === "object" &&
      !Array.isArray(ticketData);

    const hasDescription = ticketData?.description?.trim()?.length > 0;

    if (!isValidObject || !hasDescription || aiResult) return;

    let cancelled = false;

    const runAnalysis = async () => {
      setDataLoading(true);
      setLimitError(null);

      try {
        const token = await user.getIdToken();
        const res = await fetch("https://support-hub-server.vercel.app/ai/analyze-ticket", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(ticketData),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data.success) {
          const isLimit =
            res.status === 403 && /limit/i.test(data.message || "");

          if (isLimit) {
            setLimitError(data.message);
            toast.warning(data.message);
            return;
          }

          throw new Error(data.message || "Ticket analysis failed");
        }

        setAiResult(data.data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err.message || "Something went wrong");
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    };

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [ticketData, user, setAiResult, aiResult]);

  // ======================================================

  return (
    <CardWithBlurBlob className="p-6" interactive={false}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SoftIconCard icon={Sparkles} variant="primary" />
            <div>
              <h2 className="text-lg font-semibold">AI First Response</h2>
              <p className="text-xs text-base-content/70">
                {dataLoading ? (
                  <span className="skeleton skeleton-text">
                    AI is reviewing your information and generating insights…
                  </span>
                ) : aiResult ? (
                  <span>
                    AI analyzed your issue and found a likely solution.
                  </span>
                ) : (
                  <span>
                    AI analysis failed. Please try again or check your input.
                  </span>
                )}
              </p>
            </div>
          </div>
          {dataLoading ? (
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-primary">
              <span className="loading loading-dots loading-xs" />
              <span>Analyzing</span>
            </div>
          ) : (
            aiResult?.category && (
              <TextBadge variant="cyan" size="xl">
                <Activity size={15} className="mr-1" />
                {aiResult?.category}
              </TextBadge>
            )
          )}
        </div>

        {dataLoading ? (
          <div className="mt-6 space-y-6">
            {/* Animated AI Processing Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 p-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Sparkles size={18} className="animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-base-content">
                    Diagnosing your issue &amp; building resolution steps...
                  </p>
                  <p className="mt-0.5 text-xs text-base-content/60">
                    Detecting category, priority level, root cause, and
                    recommended actions
                  </p>
                </div>
                <span className="loading loading-spinner loading-sm hidden text-primary sm:inline-block" />
              </div>
            </div>

            {/* Title & Summary Skeleton */}
            <div className="space-y-3 border-b border-base-content/10 pb-5">
              <div className="skeleton h-6 w-2/3 rounded-lg" />
              <div className="space-y-2 pt-1">
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-5/6 rounded-md" />
              </div>
              {/* Metrics dots row */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="skeleton h-3.5 w-24 rounded-full" />
                <div className="skeleton h-3.5 w-28 rounded-full" />
                <div className="skeleton h-3.5 w-20 rounded-full" />
              </div>
            </div>

            {/* 3 State Cards Skeleton (Matches actual grid) */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-base-content/10 bg-base-100/40 p-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-20 rounded" />
                    <div className="skeleton h-3 w-28 rounded" />
                  </div>
                  <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
                </div>
              ))}
            </div>

            {/* Root Cause & Steps Skeleton */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="skeleton h-6 w-6 rounded-lg" />
                <div className="skeleton h-5 w-40 rounded-md" />
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded-md" />
                <div className="skeleton h-4 w-4/5 rounded-md" />
              </div>
            </div>
          </div>
        ) : limitError ? (
          <div className="my-6 rounded-2xl border border-warning/30 bg-warning/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-warning"
              />
              <div>
                <h3 className="font-semibold text-base-content">
                  Monthly AI Limit Reached
                </h3>
                <p className="mt-1 text-sm text-base-content/75">
                  {limitError}
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft size={14} />
                  Back to edit issue
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div>
              <h2 className="mt-6 font-semibold text-xl text-base-content/80">
                {aiResult?.ticketTitle || "No data found"}
              </h2>
              <p className="mt-2 text-base-content/80">
                {aiResult?.summary || "No data found"}
              </p>

              <div className="mt-5 w-full h-1 border-t border-base-content/10" />
            </div>
            {/* ============================== */}
            {aiResult?.metrics && (
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
            )}
            {/* +++++++++++++++++++++ */}

            {aiResult?.states && (
              <div
                className={`grid gap-4 ${aiResult?.states?.length >= 3 ? "sm:grid-cols-2 md:grid-cols-3" : aiResult?.states?.length === 2 ? "sm:grid-cols-2" : "grid-cols-1"} mt-5`}
              >
                {aiResult?.states.map((state, index) => (
                  <CardWithBlurBlob
                    key={index}
                    interactive={false}
                    className="p-4"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-base-content/50">
                          {state.title}
                        </p>
                        <p className=" text-[11px] text-base-content/60">
                          {state.description}
                        </p>
                      </div>

                      {String(state.value).includes("%") ? (
                        <div
                          className={`shrink-0 radial-progress text-${state.variant}-500 text-[10px] font-semibold`}
                          style={{
                            "--value": parseInt(state.value, 10),
                            "--size": "2.7rem",
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
            )}

            {/* +++++++++++++++++++++ */}

            {aiResult?.rootCause && (
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
                <p className="mt-2 text-base-content/80">
                  {aiResult?.rootCause}
                </p>

                <div className="mt-5 w-full h-1 border-t border-base-content/10" />
              </div>
            )}

            {/* ++++++++++ recommendations +++++++++++ */}

            {aiResult?.recommendations?.length > 0 && (
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

                <div
                  className={`mt-5 grid ${aiResult?.recommendations?.length >= 2 ? "sm:grid-cols-2 " : "grid-cols-1"} gap-2`}
                >
                  {aiResult?.recommendations?.map((item, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between gap-4 rounded-2xl border-2 p-3 transition-all border-base-content/10 border-dashed hover:border-primary/20"
                    >
                      <div className=" flex items-center gap-4">
                        {/* Icon */}
                        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
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
            )}

            {/* ++++++++ steps +++++++++++++ */}

            {aiResult?.steps?.length > 0 && (
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
                          <div className="absolute top-10 -bottom-4 w-px bg-base-content/20" />
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
                <div className="mt-5 w-full h-1 border-t border-base-content/10" />
              </div>
            )}

            {/* ++++++++++ reason +++++++++++ */}
            {aiResult?.escalation?.reason && (
              <div>
                <div className="flex justify-start items-center gap-2 mt-6">
                  <SoftIconCard
                    icon={WandSparkles}
                    className="h-6 w-6 rounded-lg"
                    size={14}
                    variant="purple"
                  ></SoftIconCard>
                  <h2 className=" font-semibold text-xl text-base-content/80">
                    Why AI Recommends This
                  </h2>
                </div>
                <p className="mt-2 text-base-content/80">
                  {aiResult?.escalation?.reason}
                </p>
              </div>
            )}

            {/* ++++++++++ escalation info +++++++++++ */}

            {aiResult?.escalation && (
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
            )}

            {/* +++++++++++++++++++++ */}

            {aiResult && (
              <div className="mt-5 flex gap-3 justify-end">
                {aiResult?.escalation?.recommended || (
                  <HandleSubmitTicket
                    resolutionType="ai"
                    aiResult={aiResult}
                    ticketData={ticketData}
                    onSuccess={(data) => {
                      console.log("ticket Created", data);
                      toast.success("Ticket created successfully");
                      setTicketData(null);
                      setAiResult(null);
                      setTicket(data);
                      setStep(4);
                    }}
                  >
                    This solved my issue
                  </HandleSubmitTicket>
                )}

                <GradientButton
                  buttonClassName={`px-8 ${aiResult?.escalation?.recommended || "from-primary/70 to-secondary/70"}`}
                  onClick={() => setStep(3)}
                >
                  Need human support
                </GradientButton>
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              className="mt-5 flex items-center gap-2 text-sm text-base-content/50 hover:text-primary transition-all"
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
