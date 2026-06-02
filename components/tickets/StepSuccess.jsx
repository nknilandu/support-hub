import CardWithBlurBlob from "../ui/Card/CardWithBlurBlob";

const StepSuccess = ({
  resetForm,
}) => {
  return (
    <CardWithBlurBlob
      className="max-w-5xl p-10"
      interactive={false}
    >
      {/* STEP 4 JSX */}

      <button onClick={resetForm}>
        Create another ticket
      </button>
    </CardWithBlurBlob>
  );
};

export default StepSuccess;