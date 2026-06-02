import CardWithBlurBlob from "../ui/Card/CardWithBlurBlob";

const StepAIResponse = ({
  aiResult,
  onBack,
  onNeedHuman,
  onSolved,
}) => {
  return (
    <CardWithBlurBlob
      className="max-w-5xl border-primary/20 p-6"
      interactive={false}
    >
      {/* STEP 2 JSX */}

      <button onClick={onSolved}>
        This solved my issue
      </button>

      <button onClick={onNeedHuman}>
        Need human support
      </button>

      <button onClick={onBack}>
        Edit issue
      </button>
    </CardWithBlurBlob>
  );
};

export default StepAIResponse;