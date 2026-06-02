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

  const aiResult = {
    category: "Technical",
    priority: "High",
    confidence: "87%",
    risk: "Low",
    response:
      "Based on your description, this looks like a configuration issue. Most customers resolve this issue within a few minutes by following the steps below.",
    steps: [
      "Sign out and clear your browser cache.",
      "Sign back in and reconnect the integration.",
      "Verify workspace permissions.",
    ],
  };

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

  const [selectedCategory, setSelectedCategory] = useState("Technical");

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
              <StepDescribe ticketData={ticketData} setTicketData={setTicketData} setStep={setStep} />
            )}

            {step === 2 && (
              <StepAIResponse ticketData={ticketData} setStep={setStep} />
            )}

            {step === 3 && (
              <StepEscalation
                aiResult={aiResult}
                onBack={() => setStep(2)}
                onSubmit={() => setStep(4)}
              />
            )}

            {step === 4 && (
              <StepSuccess
                resetForm={() => {
                  setStep(1);
                }}
              />
            )}
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

// =================== gurbage ===================

//   {step === 2 && (
//     <CardWithBlurBlob
//       className="max-w-5xl border-primary/20 p-6"
//       interactive={false}
//     >
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div className="flex items-center gap-3">
//           <SoftIconCard icon={Sparkles} variant="primary" />

//           <h2 className="text-lg font-semibold">AI First Response</h2>
//         </div>

//         <div className="flex gap-2">
//           <TextBadge variant="green">
//             {aiResult.confidence} confidence
//           </TextBadge>

//           <TextBadge variant="orange">{aiResult.risk} risk</TextBadge>
//         </div>
//       </div>

//       <p className="mt-6 leading-8 text-base-content/80">
//         {aiResult.response}
//       </p>

//       <div className="mt-6 space-y-3">
//         {aiResult.steps.map((item, index) => (
//           <p key={index} className="text-base-content/70">
//             {index + 1}. {item}
//           </p>
//         ))}
//       </div>

//       <p className="mt-6 text-xs text-base-content/50">
//         Reason: Similar past resolutions in this workspace.
//       </p>

//       <div className="mt-8 grid gap-3 md:grid-cols-2">
//         <button onClick={() => setStep(4)} className="btn rounded-xl">
//           <CheckCircle2 size={16} />
//           This solved my issue
//         </button>

//         <GradientButton
//           className="w-full"
//           buttonClassName="w-full"
//           onClick={() => setStep(3)}
//         >
//           Need human support
//         </GradientButton>
//       </div>

//       <button
//         onClick={() => setStep(1)}
//         className="mt-6 flex items-center gap-2 text-sm text-base-content/50"
//       >
//         <ArrowLeft size={14} />
//         Edit issue
//       </button>
//     </CardWithBlurBlob>
//   )}

//   {/* ================================= */}
//   {/* STEP 3 */}
//   {/* ================================= */}

//   {step === 3 && (
//     <CardWithBlurBlob className="max-w-6xl p-6" interactive={false}>
//       <h2 className="text-2xl font-semibold">Escalate to a human agent</h2>

//       <p className="mt-2 text-base-content/60">
//         We'll attach the AI conversation so the agent has full context.
//       </p>

//       <div className="mt-8 rounded-2xl border border-base-content/10 p-5">
//         <p className="text-xs uppercase tracking-wider text-base-content/50">
//           Ticket Preview
//         </p>

//         <h3 className="mt-4 text-lg font-medium">
//           {formData.title || "Untitled Issue"}
//         </h3>

//         <div className="mt-4 flex flex-wrap gap-2">
//           <TextBadge variant="slate">{aiResult.category}</TextBadge>

//           <TextBadge variant="orange">{aiResult.priority}</TextBadge>

//           <TextBadge variant="blue">Open</TextBadge>
//         </div>
//       </div>

//       <div className="mt-5 rounded-2xl border border-base-content/10 p-5">
//         <div className="flex items-center gap-3">
//           <SoftIconCard icon={ShieldCheck} variant="primary" />

//           <div>
//             <h3 className="font-medium">AI context will be attached</h3>

//             <p className="text-sm text-base-content/60">
//               The agent sees the AI suggestion, category, priority and
//               attachments.
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="mt-8 flex justify-end gap-3">
//         <button onClick={() => setStep(2)} className="btn rounded-xl">
//           Back
//         </button>

//         <GradientButton buttonClassName="px-6" onClick={() => setStep(4)}>
//           <Ticket size={15} />
//           Create support ticket
//         </GradientButton>
//       </div>
//     </CardWithBlurBlob>
//   )}

//   {/* ================================= */}
//   {/* STEP 4 */}
//   {/* ================================= */}

//   {step === 4 && (
//     <CardWithBlurBlob className="max-w-5xl p-10" interactive={false}>
//       <div className="flex flex-col items-center text-center">
//         <div className="mb-5">
//           <SoftIconCard
//             icon={CheckCircle2}
//             variant="success"
//             className="h-14 w-14 rounded-full"
//             size={24}
//           />
//         </div>

//         <h2 className="text-3xl font-semibold">Ticket created</h2>

//         <p className="mt-3 text-base-content/60">
//           Your ticket TCK-4321 is now open. An agent will reply soon.
//         </p>

//         <div className="mt-6 flex flex-wrap justify-center gap-3">
//           <GradientButton>View ticket</GradientButton>

//           <button
//             onClick={() => {
//               setStep(1);
//               setFormData({
//                 title: "",
//                 description: "",
//               });
//               setFiles([]);
//             }}
//             className="btn rounded-xl"
//           >
//             Create another ticket
//           </button>
//         </div>
//       </div>
//     </CardWithBlurBlob>
//   )}
