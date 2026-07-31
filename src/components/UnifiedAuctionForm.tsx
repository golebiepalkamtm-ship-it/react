import React, { useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bird,
  Camera,
  Video,
  Sparkles,
  Check,
  X,
  AlertCircle,
  Loader2,
  Wrench,
  Pill,
  Package,
  Palette,
  Eye,
  Dumbbell,
  Heart,
  Feather,
  Ruler,
  Zap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Tag,
  Venus,
  Mars,
  CircleDot,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { UnifiedModal } from "@/components/ui/UnifiedModal";
import FileUpload from "@/components/FileUpload";

// Components & Hooks
import { InputField } from "./ui/form/InputField";
import { TraitDropdown } from "./ui/form/TraitDropdown";
import { useAuctionForm } from "@/hooks/useAuctionForm";

interface UnifiedAuctionFormProps {
  category: "pigeons" | "supplements" | "accessories";
  onSuccess?: () => void;
  onCancel?: () => void;
}

const traitSelects = [
  {
    label: "Ubarwienie",
    icon: Palette,
    field: "colorTraits",
    options: [
      "Niebieska",
      "Niebieska nakrapiana",
      "Ciemna nakrapiana",
      "Ciemna",
      "Czarna",
      "Czerwona nakrapiana",
      "Czerwona",
      "Płowa",
      "Biała",
      "Szpakowata",
      "Niebieska pstra",
      "Niebieska nakrapiana pstra",
      "Ciemna nakrapiana pstra",
      "Ciemna pstra",
      "Czarna pstra",
      "Czerwona nakrapiana pstra",
      "Czerwona pstra",
      "Płowa pstra",
      "Szpakowata pstra",
      "Czerwona szpakowata",
    ],
  },
  {
    label: "Oko",
    icon: Eye,
    field: "eyeTraits",
    options: [
      "Perłowe",
      "Pomarańczowe",
      "Żółte",
      "Bycze",
      "Pierścień Vermeyena pełny",
      "Pierścień Vermeyena niepełny",
    ],
  },
  {
    label: "Budowa",
    icon: Dumbbell,
    field: "bodyStructureTraits",
    options: [
      "Budowa zwarta",
      "Budowa średnia",
      "Budowa długa",
      "Mostek: Wysoki",
      "Mostek: Płaski",
      "Widełki: Zwarte",
      "Widełki: Otwarte",
    ],
  },
  {
    label: "Muskulatura",
    icon: Heart,
    field: "musculatureTraits",
    options: [
      "Elastyczna",
      "Pełna",
      "Sucha",
      "Grzbiet: Bardzo mocny",
      "Grzbiet: Mocny",
      "Grzbiet: Standardowy",
    ],
  },
  {
    label: "Skrzydło i Upierzenie",
    icon: Feather,
    field: "wingTraits",
    options: [
      "Pióro jedwabiste",
      "Pióro suche",
      "Lotka: Wąska",
      "Lotka: Szeroka",
      "Skrzydło: Aktywne",
      "Skrzydło: Pasywne",
    ],
  },
  {
    label: "Wartość hodowlana",
    icon: Shield,
    field: "breedingValueTraits",
    options: [
      "Sprawdzony rozpłodowiec",
      "Sprawdzony lotnik",
      "Potencjał rozpłodowy",
    ],
  },
  {
    label: "Przeznaczenie",
    icon: Ruler,
    field: "distanceTraits",
    options: ["Krótki dystans", "Średni dystans", "Długi dystans", "Maraton"],
  },
];

export const UnifiedAuctionForm: React.FC<UnifiedAuctionFormProps> = ({
  category,
  onSuccess,
  onCancel,
}) => {
  const {
    formData,
    setFormData,
    isBidding,
    setIsBidding,
    isBuyNow,
    setIsBuyNow,
    imageFiles,
    setImageFiles,
    videoFiles,
    setVideoFiles,
    documentFiles,
    setDocumentFiles,
    currentStep,
    setCurrentStep,
    loading,
    error,
    setError,
    feedback,
    setFeedback,
    submit,
  } = useAuctionForm({ category, onSuccess: onSuccess || undefined });

  const totalSteps = category === "pigeons" ? 3 : 2;

  const categoryConfig = useMemo(() => {
    switch (category) {
      case "pigeons":
        return {
          icon: Bird,
          label: "Gołąb",
          color: "from-gold to-gold-dark",
          subLabel: "Wystaw gołębia na aukcję",
        };
      case "supplements":
        return {
          icon: Pill,
          label: "Suplement",
          color: "from-emerald-500 to-teal-600",
          subLabel: "Witaminy i preparaty",
        };
      case "accessories":
        return {
          icon: Wrench,
          label: "Akcesorium",
          color: "from-amber-500 to-orange-600",
          subLabel: "Sprzęt i wyposażenie",
        };
    }
  }, [category]);

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.title || !formData.title.trim()) {
        setError("Uzupełnij tytuł aukcji przed przejściem do kolejnego kroku.");
        return false;
      }
      if (!formData.description || !formData.description.trim()) {
        setError("Uzupełnij opis przedmiotu przed przejściem do kolejnego kroku.");
        return false;
      }
      if (isBidding) {
        const startPrice = Number(formData.startingPrice);
        if (isNaN(startPrice) || startPrice <= 0) {
          setError("Podaj prawidłową cenę wywoławczą licytacji (większą od 0 PLN).");
          return false;
        }
      }
    }

    if (step === 2 && category === "pigeons") {
      if (!formData.pigeon?.ringNumber || !formData.pigeon.ringNumber.trim()) {
        setError("Uzupełnij numer obrączki gołębia przed przejściem do kolejnego kroku.");
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setError(null);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePigeonChange = (field: string, value: any) => {
    if (error) setError(null);
    setFormData((prev) => ({
      ...prev,
      pigeon: { ...prev.pigeon, [field]: value },
    }));
  };

  const renderCurrentStep = () => {
    // Step 1: Basic Info
    if (currentStep === 1) {
      return (
        <div className="space-y-3">
          <motion.div
            className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${categoryConfig.color} shadow-lg shadow-gold/20`}
              >
                <categoryConfig.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Dane podstawowe
                </h3>
                <p className="text-xs text-white/60">
                  {categoryConfig.subLabel}
                </p>
              </div>
            </div>

            <InputField
              label="Tytuł aukcji"
              name="title"
              value={formData.title || ""}
              onChange={(e) => {
                if (error) setError(null);
                setFormData({ ...formData, title: e.target.value });
              }}
              placeholder="np. Wnuk Best Kittel"
              required
            />

            <InputField
              label="Opis"
              name="description"
              value={formData.description || ""}
              onChange={(e) => {
                if (error) setError(null);
                setFormData({ ...formData, description: e.target.value });
              }}
              placeholder="Szczegółowy opis przedmiotu..."
              multiline
              rows={2}
              required
            />
          </motion.div>

          <motion.div
            className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <span>💰</span> Rodzaj sprzedaży
            </h3>

            {/* 4-kolumnowa siatka pól sprzedaży */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-end">
              {/* Licytacja */}
              <InputField
                label=""
                name="bidding"
                value={isBidding ? "Licytacja" : ""}
                placeholder="Licytacja"
                icon={isBidding ? Check : null}
                highlighted={isBidding}
                onClick={() => {
                  if (error) setError(null);
                  setIsBidding(!isBidding);
                }}
                onChange={() => {}}
                className="mt-4"
              />

              {/* Cena wywoławcza */}
              <InputField
                label="Cena wywoławcza (zł)"
                name="startingPrice"
                type="number"
                value={String(formData.startingPrice || "")}
                onChange={(e) => {
                  if (error) setError(null);
                  setFormData({
                    ...formData,
                    startingPrice: Number(e.target.value),
                  });
                }}
                placeholder="0"
                required={isBidding}
                className={!isBidding ? "opacity-50" : ""}
              />

              {/* Kup Teraz */}
              <InputField
                label=""
                name="buyNow"
                value={isBuyNow ? "Kup Teraz" : ""}
                placeholder="Kup Teraz"
                icon={isBuyNow ? Check : null}
                highlighted={isBuyNow}
                onClick={() => {
                  if (error) setError(null);
                  setIsBuyNow(!isBuyNow);
                }}
                onChange={() => {}}
                className="mt-4"
              />

              {/* Cena Kup Teraz */}
              <InputField
                label="Cena Kup Teraz (zł)"
                name="buyNowPrice"
                type="number"
                value={String(formData.buyNowPrice || "")}
                onChange={(e) => {
                  if (error) setError(null);
                  setFormData({
                    ...formData,
                    buyNowPrice: Number(e.target.value),
                  });
                }}
                placeholder="0"
                className={!isBuyNow ? "opacity-50" : ""}
              />

              {/* Dni trwania */}
              <InputField
                label="Czas trwania (Dni)"
                name="durationDays"
                type="number"
                value={String(formData.durationDays ?? 7)}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(14, Number(e.target.value)));
                  setFormData({ ...formData, durationDays: val });
                }}
              />

              {/* Godziny */}
              <InputField
                label="Godziny"
                name="durationHours"
                type="number"
                value={String(formData.durationHours ?? 0)}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setFormData({ ...formData, durationHours: val });
                }}
              />
            </div>
          </motion.div>
        </div>
      );
    }

    // Step 2: Pigeon Traits (Pigeons only) — 4 Column Grid Layout
    if (currentStep === 2 && category === "pigeons") {
      return (
        <motion.div
          className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-start"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="col-span-1">
            <InputField
              label="Numer obrączki"
              name="ringNumber"
              value={formData.pigeon?.ringNumber || ""}
              onChange={(e) => handlePigeonChange("ringNumber", e.target.value)}
              placeholder="np. PL-0123-23-1234"
              required
            />
          </div>

          <div className="col-span-1 space-y-1">
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Płeć
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sex: "MALE" })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all text-xs ${
                  formData.sex === "MALE"
                    ? "bg-blue-500/20 border-blue-500 text-blue-400 font-medium shadow-lg shadow-blue-500/10"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Mars className="w-4 h-4" />
                <span>Samczyk</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, sex: "FEMALE" })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border transition-all text-xs ${
                  formData.sex === "FEMALE"
                    ? "bg-pink-500/20 border-pink-500 text-pink-400 font-medium shadow-lg shadow-pink-500/10"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Venus className="w-4 h-4" />
                <span>Samiczka</span>
              </button>
            </div>
          </div>

          {traitSelects.map((trait) => (
            <div key={trait.field} className="col-span-1">
              <TraitDropdown
                label={trait.label}
                icon={trait.icon}
                field={trait.field}
                options={trait.options}
                value={(formData.pigeon as any)?.[trait.field] || []}
                onChange={(f, v) => handlePigeonChange(f, v)}
              />
            </div>
          ))}
        </motion.div>
      );
    }

    // Step 2 for Supplements/Accessories or Step 3 for Pigeons: Media
    if (
      (category !== "pigeons" && currentStep === 2) ||
      (category === "pigeons" && currentStep === 3)
    ) {
      return renderMediaSection();
    }

    return null;
  };

  const renderMediaSection = () => (
    <motion.div
      className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
          <Package className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white">Media</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Camera className="w-4 h-4 text-blue-400" /> Zdjęcia
          </div>
          <FileUpload
            files={imageFiles}
            onFilesChange={setImageFiles}
            maxFiles={2}
            accept="image/*"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Package className="w-4 h-4 text-purple-400" /> Rodowód
          </div>
          <FileUpload
            files={documentFiles}
            onFilesChange={setDocumentFiles}
            maxFiles={2}
            accept="image/*,.pdf,application/pdf"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <Video className="w-4 h-4 text-green-400" /> Wideo
          </div>
          <FileUpload
            files={videoFiles}
            onFilesChange={setVideoFiles}
            maxFiles={1}
            accept="video/*"
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-3">
      {/* Jednolity, kompaktowy pasek nawigacyjny w JEDNEJ LINII */}
      <div className="flex flex-nowrap items-center justify-between gap-2 pb-2.5 border-b border-white/10 overflow-x-auto whitespace-nowrap shrink-0">
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) {
              setError(null);
              setCurrentStep((prev) => prev - 1);
            } else if (onCancel) {
              onCancel();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121f3d] border border-[#A68E4E]/40 text-xs font-bold text-gold hover:bg-[#A68E4E]/20 transition-all cursor-pointer shadow-sm shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-gold shrink-0" />
          <span>
            {currentStep > 1
              ? `Wstecz`
              : "Zmień kategorię"}
          </span>
        </button>

        {/* 3 punkty / kroki w tej samej linii */}
        {totalSteps > 1 && (
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 shrink-0">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (step < currentStep) {
                    setError(null);
                    setCurrentStep(step);
                  } else if (step > currentStep) {
                    let canProceed = true;
                    for (let s = currentStep; s < step; s++) {
                      if (!validateStep(s)) {
                        canProceed = false;
                        break;
                      }
                    }
                    if (canProceed) {
                      setError(null);
                      setCurrentStep(step);
                    }
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer text-xs ${
                  currentStep === step
                    ? "bg-gold text-navy font-extrabold shadow-md shadow-gold/20"
                    : currentStep > step
                    ? "bg-gold/20 text-gold font-bold hover:bg-gold/30"
                    : "text-white/40 font-medium hover:text-white/70"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-bold">
                  {step}
                </span>
                <span>
                  {category === "pigeons"
                    ? step === 1
                      ? "Podstawowe"
                      : step === 2
                        ? "Cechy"
                        : "Media"
                    : step === 1
                      ? "Podstawowe"
                      : "Media"}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="text-xs font-semibold text-white/60 shrink-0">
          Krok <span className="text-gold font-bold">{currentStep}</span> z {totalSteps}
        </div>
      </div>

      <AnimatePresence mode="wait">{renderCurrentStep()}</AnimatePresence>

      <div className="flex gap-4 pt-2">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setError(null);
              setCurrentStep((prev) => prev - 1);
            }}
            className="flex-1 py-6 border-[#A68E4E]/40 text-white bg-[#121f3d] hover:bg-[#A68E4E]/20 font-bold transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 mr-1 text-gold" />
            Wstecz (Krok {currentStep - 1})
          </Button>
        ) : onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 py-6 border-white/10 text-white hover:bg-white/5 font-bold transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 mr-1 text-gold" />
            Zmień kategorię
          </Button>
        ) : null}

        <Button
          disabled={loading}
          onClick={
            currentStep < totalSteps
              ? handleNextStep
              : () => {
                  if (validateStep(currentStep)) {
                    submit();
                  }
                }
          }
          className={`flex-[2] py-6 bg-gradient-to-r ${categoryConfig.color} text-white font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : currentStep < totalSteps ? (
            <span className="flex items-center">
              Dalej <ChevronRight className="w-5 h-5 ml-2" />
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" /> Utwórz aukcję
            </span>
          )}
        </Button>
      </div>

      <UnifiedModal
        isOpen={feedback.isOpen}
        onClose={() => {
          setFeedback((prev) => ({ ...prev, isOpen: false }));
          if (feedback.type === "success") onSuccess?.();
        }}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        confirmButton={{
          text: "Pojąłem",
          onClick: () => {
            setFeedback((prev) => ({ ...prev, isOpen: false }));
            if (feedback.type === "success") onSuccess?.();
          },
        }}
      />
    </div>
  );
};

export default UnifiedAuctionForm;
