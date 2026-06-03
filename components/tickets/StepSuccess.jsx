import { CheckCircle2 } from "lucide-react";
import CardWithBlurBlob from "../ui/Card/CardWithBlurBlob";
import SoftIconCard from "../ui/Card/SoftIconCard";
import GradientButton from "../ui/Button/GradientButton";

const StepSuccess = ({ setStep }) => {
  return (
    <CardWithBlurBlob className="px-6 py-24" interactive={false}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-5">
          <SoftIconCard
            icon={CheckCircle2}
            variant="success"
            className="h-14 w-14 rounded-2xl"
            size={24}
          />
        </div>

        <h2 className="text-3xl font-semibold">Ticket created</h2>

        <p className="mt-3 text-base-content/60">
          Your ticket TCK-4321 is now open. An agent will reply soon.
        </p>

        {/* ======================== */}

        <div className="mt-5 flex gap-3 justify-end">
          <GradientButton
            buttonClassName="px-8 from-primary/20 to-secondary/20 text-base-content/70"
            onClick={() => setStep(4)}
          >
            View this ticket
          </GradientButton>

          <GradientButton buttonClassName="px-8" onClick={() => setStep(1)}>
            Create another one
          </GradientButton>
        </div>

        {/* ========== */}
      </div>
    </CardWithBlurBlob>
  );
};

export default StepSuccess;
