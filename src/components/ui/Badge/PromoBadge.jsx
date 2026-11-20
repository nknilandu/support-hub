import { Sparkles } from "lucide-react";

export default function Badge({
  icon: Icon = Sparkles,
  label = null,
  text = null,
  className = "",
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-base-content/20 bg-base-100/30 px-3 py-1.5 text-base-content/70 backdrop-blur text-xs ${className}`}
    >
      {Icon && <Icon className="text-primary" size={16} />}

      {label && <span className="font-semibold">{label}</span>}

      {label && text && <span className="font-bold">·</span>}

      {text && <span>{text}</span>}
    </div>
  );
}



// Custom icon:

// import { CircleAlert } from "lucide-react";

// <Badge
//   icon={CircleAlert}
//   label="Problem"
//   text="Support teams lose time"
// />

// To keep Only text:

// <Badge icon={null} label="" text="AI-powered support is here" />