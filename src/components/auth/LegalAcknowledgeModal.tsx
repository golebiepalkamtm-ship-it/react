import React, { useState, useEffect } from "react";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import { Check } from "lucide-react";

interface LegalAcknowledgeModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const LegalAcknowledgeModal: React.FC<LegalAcknowledgeModalProps> = ({
  isOpen,
  onAccept,
}) => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  const handleAcceptAndStore = () => {
    if (checked1 && checked2) {
      localStorage.setItem("palkamtm_legal_accepted", "true");
      onAccept();
    }
  };

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={() => {}} // Block closing without acceptance
      type="info"
      title="Wymagane akceptacje"
      message="Prosimy o zapoznanie się i akceptację poniższych punktów przed kontynuowaniem."
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
      size="lg"
      confirmButton={{
        text: "Akceptuję i kontynuuję",
        onClick: handleAcceptAndStore,
        variant: "default",
        disabled: !checked1 || !checked2,
      }}
    >
      <div className="space-y-6 py-4">
        <div
          className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
          onClick={() => setChecked1(!checked1)}
          data-testid="legal-checkbox-1"
        >
          <div
            className={`mt-1 h-6 w-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${checked1 ? "bg-gold border-gold" : "border-white/30 group-hover:border-gold/50"}`}
          >
            {checked1 && (
              <Check className="w-4 h-4 text-zinc-950 stroke-[3px]" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm md:text-base text-zinc-200 leading-relaxed select-none">
              Akceptuję{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-gold hover:underline font-bold"
                onClick={(e) => e.stopPropagation()}
              >
                Regulamin serwisu
              </a>{" "}
              i{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-gold hover:underline font-bold"
                onClick={(e) => e.stopPropagation()}
              >
                Politykę Prywatności
              </a>
              . Rozumiem, że serwis palkamtm.pl jest platformą
              informacyjno-reklamową.
            </p>
          </div>
        </div>

        <div
          className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
          onClick={() => setChecked2(!checked2)}
          data-testid="legal-checkbox-2"
        >
          <div
            className={`mt-1 h-6 w-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${checked2 ? "bg-gold border-gold" : "border-white/30 group-hover:border-gold/50"}`}
          >
            {checked2 && (
              <Check className="w-4 h-4 text-zinc-950 stroke-[3px]" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm md:text-base text-zinc-200 leading-relaxed select-none">
              Oświadczam, że dokonuję zakupu w związku z prowadzoną zawodowo
              działalnością hodowlaną, rolniczą lub gospodarczą i nie
              przysługują mi prawa konsumenta, w tym prawo do odstąpienia od
              umowy w ciągu 14 dni. Wyrażam zgodę na całkowite wyłączenie
              rękojmi.
            </p>
          </div>
        </div>

        {!checked1 || !checked2 ? (
          <p className="text-xs text-red-400/80 text-center animate-pulse">
            Musisz zaznaczyć oba punkty, aby przejść dalej.
          </p>
        ) : (
          <p className="text-xs text-green-400/80 text-center">
            Dziękujemy. Możesz teraz zaakceptować warunki.
          </p>
        )}
      </div>
    </UnifiedModal>
  );
};

export default LegalAcknowledgeModal;
