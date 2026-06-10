import { useState } from "react";
import { MessagesSquare, Sparkles } from "lucide-react";
import GradientButton from "../../components/ui/Button/GradientButton";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";

const CustomerAiAssistant = () => {
  const [open, setOpen] = useState(false);

  return (
    <CardWithBlurBlob className="m-5 p-0 h-[88svh]" interactive={false}>
   
      {/* header */}
<div className="border-b border-base-content/15 px-5 py-3 flex justify-between">
  
  <div className="flex items-center gap-3 min-w-0 flex-1">
    
    <SoftIconCard icon={Sparkles} variant="primary" className="shrink-0" />

    <div className="flex flex-col min-w-0 flex-1">
      <h3 className="font-semibold truncate">
        AI Assistant
      </h3>

      <p className="text-base-content/60 text-xs truncate">
        Real-time AI Support & Insights
      </p>
    </div>

     <GradientButton
          className="md:hidden"
          buttonClassName="from-primary/10 to-secondary/15 text-base-content/80"
          onClick={() => setOpen((p) => !p)}
        >
          <MessagesSquare size={15} />
          chat
        </GradientButton>

  </div>

</div>

       


      {/* body */}
      <div className="flex h-full overflow-hidden">

        {/* ss1 */}
        <div
          className={`
            border-r border-base-content/15
            overflow-hidden
            transition-all duration-300 ease-in-out

            ${open ? "w-full md:w-5/12 lg:w-3/12 opacity-100" : "w-0 opacity-0 md:w-4/12 lg:w-3/12 md:opacity-100"}
          `}
        >
          <div className="px-5 py-3 whitespace-nowrap">
            ss1
          </div>
        </div>

        {/* ss2 */}
        <div
          className={`
            px-5 py-3 overflow-hidden
            transition-all duration-300 ease-in-out

            ${open ? "w-0 opacity-0 md:w-8/12 md:opacity-100" : "w-full opacity-100 md:w-8/12"}
          `}
        >
          ss2
        </div>

      </div>
    </CardWithBlurBlob>
  );
};

export default CustomerAiAssistant;