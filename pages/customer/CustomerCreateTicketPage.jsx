import { useState } from "react";
import { Check, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";
import { IoIosArrowForward } from "react-icons/io";
import StepSuccess from "../../components/tickets/StepSuccess";
import StepAIResponse from "../../components/tickets/StepAIResponse";
import StepDescribe from "../../components/tickets/StepDescribe";
import StepEscalation from "../../components/tickets/StepEscalation";

const CustomerCreateTicketPage = () => {
  const [step, setStep] = useState(1);
  const [ticketData, setTicketData] = useState(null);
  const [aiResult, setAiResult] = useState({});

  const steps = [
    {
      id: 1,
      label: "Describe",
    },
    {
      id: 2,
      label: "AI Response",
    },
    {
      id: 3,
      label: "Decide",
    },
    {
      id: 4,
      label: "Confirm",
    },
  ];

  return (
    <section className="p-4 lg:p-5">
      {/* header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create New Ticket
          </h1>

          <TextBadge variant="green">AI Enabled</TextBadge>

          <TextBadge variant="blue">Avg response 12m</TextBadge>
        </div>

        <p className="mt-1 text-sm text-base-content/60">
          Describe your issue and receive AI assistance before escalating to
          support.
        </p>
      </div>

      {/* ================================= */}
      {/* STEPPER */}
      {/* ================================= */}

      <div className="mt-4 mb-6 flex flex-wrap items-center gap-2">
        {steps.map((item, index) => {
          const active = step === item.id;
          const completed = step > item.id;

          return (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className={`
                  flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition

                  ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : completed
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-base-content/10 bg-base-100 text-base-content/60"
                  }
                `}
              >
                <span
                  className={`
                    flex h-5 w-5 items-center justify-center rounded-full text-[10px]

                    ${
                      active
                        ? "bg-primary text-white"
                        : completed
                          ? "bg-success text-white"
                          : "bg-base-200"
                    }
                  `}
                >
                  {completed ? <Check size={12} /> : item.id}
                </span>

                {item.label}
              </div>

              {index !== steps.length - 1 && (
                <span className="mx-1 text-base-content/30">
                  <IoIosArrowForward />
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-2/3">
          {/* +++++++++++++++ */}
          <div>
            {step === 1 && (
              <StepDescribe
                ticketData={ticketData}
                setTicketData={setTicketData}
                setStep={setStep}
              />
            )}

            {step === 2 && (
              <StepAIResponse ticketData={ticketData} setStep={setStep} />
            )}

            {step === 3 && (
              <StepEscalation
                aiResult={aiResult}
                setAiResult={setAiResult}
                setStep={setStep}
                aiResult={aiResult}
              />
            )}

            {step === 4 && <StepSuccess setStep={setStep} />}
          </div>
          {/* +++++++++++++++ */}
        </div>

        {/* =============================== */}
        <div className="w-full lg:w-1/3">
          <div className="space-y-3">
            {/* HOW IT WORKS */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              <div className="flex items-center gap-3">
                <SoftIconCard icon={Sparkles} variant="primary" size={15} />

                <h3 className="text-sm font-semibold">How it works</h3>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-xs font-medium">1. Describe your issue</p>

                  <p className="mt-1 text-[11px] leading-5 text-base-content/60">
                    Explain the problem and attach screenshots if needed.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium">2. AI analyzes it</p>

                  <p className="mt-1 text-[11px] leading-5 text-base-content/60">
                    SupportAI automatically identifies category, priority and
                    likely causes.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium">3. Get instant help</p>

                  <p className="mt-1 text-[11px] leading-5 text-base-content/60">
                    Many issues can be solved immediately without opening a
                    ticket.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium">4. Escalate if needed</p>

                  <p className="mt-1 text-[11px] leading-5 text-base-content/60">
                    Human agents receive the AI analysis automatically.
                  </p>
                </div>
              </div>
            </CardWithBlurBlob>

            {/* TIPS */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              <div className="flex items-center gap-3">
                <SoftIconCard icon={CheckCircle2} variant="success" size={15} />

                <h3 className="text-sm font-semibold">
                  Better tickets get faster replies
                </h3>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex gap-3">
                  <span className="text-success">✓</span>

                  <p className="text-xs text-base-content/70">
                    Include exact error messages.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-success">✓</span>

                  <p className="text-xs text-base-content/70">
                    Attach screenshots whenever possible.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-success">✓</span>

                  <p className="text-xs text-base-content/70">
                    Explain what you expected to happen.
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-success">✓</span>

                  <p className="text-xs text-base-content/70">
                    Describe the steps required to reproduce the issue.
                  </p>
                </div>
              </div>
            </CardWithBlurBlob>

            {/* AI BENEFIT */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              <div className="flex items-center gap-3">
                <SoftIconCard icon={ShieldCheck} variant="primary" size={15} />

                <h3 className="text-sm font-semibold">
                  AI can resolve issues instantly
                </h3>
              </div>

              <p className="mt-4 text-xs leading-6 text-base-content/70">
                Around 38% of support requests are resolved by AI before
                reaching a human agent.
              </p>

              <div className="mt-4 flex gap-2">
                <TextBadge variant="green">87% accuracy</TextBadge>

                <TextBadge variant="blue">Fast response</TextBadge>
              </div>
            </CardWithBlurBlob>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerCreateTicketPage;
