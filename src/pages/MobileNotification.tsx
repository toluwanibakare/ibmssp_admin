import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

function toneStyles(tone: string) {
  switch (tone) {
    case "success":
      return "border-green-500/30 bg-green-500/10 text-green-700";
    case "error":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "warning":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-700";
    case "info":
      return "border-blue-500/30 bg-blue-500/10 text-blue-700";
    default:
      return "border-border bg-card text-foreground";
  }
}

function ToneIcon({ tone }: { tone: string }) {
  if (tone === "success") return <CheckCircle2 size={18} />;
  if (tone === "error") return <AlertCircle size={18} />;
  if (tone === "warning") return <TriangleAlert size={18} />;
  return <Info size={18} />;
}

export default function MobileNotification() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const title = params.get("title") || "Notification";
  const description = params.get("description") || "";
  const tone = params.get("tone") || "default";
  const from = params.get("from") || "/";

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(from);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:hidden">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className={`rounded-2xl border p-4 shadow-card ${toneStyles(tone)}`}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <ToneIcon tone={tone} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold break-words">{title}</h1>
              {description && (
                <p className="mt-1 text-sm opacity-90 break-words">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
