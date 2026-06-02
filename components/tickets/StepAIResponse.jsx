import CardWithBlurBlob from "../ui/Card/CardWithBlurBlob";

const StepAIResponse = ({
ticketData, setStep
}) => {
    console.log(ticketData)
  return (
    <CardWithBlurBlob
      className="max-w-5xl border-primary/20 p-6"
      interactive={false}
    >
      {/* STEP 2 JSX */}

      <button onClick={()=>{setStep(4)}}>
        This solved my issue
      </button>

      <button onClick={()=>{setStep(3)}}>
        Need human support
      </button>

      <button onClick={()=>{setStep(1)}}>
        Edit issue
      </button>
    </CardWithBlurBlob>
  );
};

export default StepAIResponse;



// <button onClick={()=>{setStep(4)}}>
//         This solved my issue
//       </button>

//       <button onClick={()=>{setStep(3)}}>
//         Need human support
//       </button>

//       <button onClick={()=>{setStep(1)}}>
//         Edit issue
//       </button>