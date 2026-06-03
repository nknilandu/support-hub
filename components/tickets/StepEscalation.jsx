import { ShieldCheck } from "lucide-react";
import GradientButton from "../ui/Button/GradientButton";
import CardWithBlurBlob from "../ui/Card/CardWithBlurBlob";
import TextBadge from "../ui/Badge/TextBadge";
import HandleSubmitTicket from "./HandleSubmitTicket";
import { toast } from "react-toastify";

const StepSuccess = ({
  setTicketData,
  aiResult,
  setAiResult,
  setStep,
  setTicket,
}) => {
  return (
    <CardWithBlurBlob className="p-6 " interactive={false}>
      <h2 className="text-2xl font-semibold text-base-content/90">
        Escalate to a human agent
      </h2>

      <p className=" text-base-content/60">
        We'll attach the AI conversation so the agent has full context.
      </p>

      <div className="mt-5 rounded-2xl border-3 border-dashed border-base-content/10 p-5">
        <p className="text-xs uppercase tracking-wider text-base-content/50">
          Ticket Preview
        </p>

        <h3 className="mt-4 text-lg font-medium">{aiResult?.ticketTitle}</h3>
        <p className="text-base-content/70 text-sm mt-1 mb-5">
          {aiResult?.summary}
        </p>

        <div className="flex flex-wrap gap-2">
          <TextBadge variant="cyan">{aiResult?.category}</TextBadge>
          {aiResult?.states.map((item, i) => (
            <TextBadge key={i} variant={item.variant}>
              {item.value} {item.title}
            </TextBadge>
          ))}
          <TextBadge variant="blue">Open</TextBadge>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded-2xl shrink-0 border-info/20 bg-info/5">
        <div className="flex gap-3">
          <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl text-base-100 bg-info">
            <ShieldCheck size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">AI context will be attached</h3>

            <p className="mt-1 text-sm text-base-content/60">
              The agent sees the AI suggestion, category, priority and
              attachments.
            </p>
          </div>
        </div>
      </div>

      {/* +++++++++++++++++++++++++++++++++++ */}

      <div className="mt-5 flex gap-3 justify-end">
        <GradientButton
          buttonClassName="px-8 from-primary/20 to-secondary/20 text-base-content/70"
          onClick={() => setStep(2)}
        >
          Back
        </GradientButton>

        <HandleSubmitTicket
          resolutionType="human"
          aiResult={aiResult}
          onSuccess={(data) => {
            // console.log("ticket Created", data);
            setTicket(data);
            toast.success("Successfully support ticket created");
            setTicketData(null);
            setAiResult(null);
            setStep(4);
          }}
        >
          Create support ticket
        </HandleSubmitTicket>
      </div>

      {/* =============== */}
    </CardWithBlurBlob>
  );
};

export default StepSuccess;
