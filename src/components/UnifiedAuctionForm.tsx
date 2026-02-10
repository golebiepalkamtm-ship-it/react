import React, { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bird, Camera, Video, Sparkles, Check, X, AlertCircle, Loader2,
    Wrench, Pill, Package, Palette, Eye, Dumbbell, Heart, Feather, Ruler, Zap, Shield, ChevronLeft, ChevronRight, Gavel, Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UnifiedModal } from '@/components/ui/UnifiedModal';
import FileUpload from '@/components/FileUpload';

// Components & Hooks
import { InputField } from './ui/form/InputField';
import { TraitDropdown } from './ui/form/TraitDropdown';
import { useAuctionForm } from '@/hooks/useAuctionForm';

interface UnifiedAuctionFormProps {
    category: 'pigeons' | 'supplements' | 'accessories';
    onSuccess?: () => void;
    onCancel?: () => void;
}

const traitSelects = [
    { label: 'Ubarwienie', icon: Palette, field: 'colorTraits', options: ['Niebieska', 'Niebiesko-nakrapiana', 'Ciemno-nakrapiana', 'Ciemna', 'Czarna', 'Czerwona', 'Czerwono-nakrapiana', 'Płowa', 'Biała', 'Szpakowata', 'Pstra'] },
    { label: 'Oko', icon: Eye, field: 'eyeTraits', options: ['Perłowe', 'Pomarańczowe', 'Żółte', 'Bycze', 'Pierścień Vermeyena pełny', 'Pierścień Vermeyena niepełny'] },
    { label: 'Budowa', icon: Dumbbell, field: 'bodyStructureTraits', options: ['Budowa zwarta', 'Budowa średnia', 'Budowa długa', 'Mostek: Wysoki', 'Mostek: Płaski', 'Widełki: Zwarte', 'Widełki: Otwarte'] },
    { label: 'Muskulatura', icon: Heart, field: 'musculatureTraits', options: ['Elastyczna', 'Pełna', 'Sucha', 'Grzbiet: Bardzo mocny', 'Grzbiet: Mocny', 'Grzbiet: Standardowy'] },
    { label: 'Skrzydło i Upierzenie', icon: Feather, field: 'wingTraits', options: ['Pióro jedwabiste', 'Pióro suche', 'Lotka: Wąska', 'Lotka: Szeroka', 'Skrzydło: Aktywne', 'Skrzydło: Pasywne'] },
    { label: 'Wartość hodowlana', icon: Shield, field: 'breedingValueTraits', options: ['Sprawdzony rozpłodowiec', 'Sprawdzony lotnik', 'Potencjał rozpłodowy'] },
    { label: 'Przeznaczenie', icon: Ruler, field: 'distanceTraits', options: ['Krótki dystans', 'Średni dystans', 'Długi dystans', 'Maraton'] },
];

export const UnifiedAuctionForm: React.FC<UnifiedAuctionFormProps> = ({ category, onSuccess, onCancel }) => {
    const {
        formData, setFormData, isBidding, setIsBidding, isBuyNow, setIsBuyNow,
        imageFiles, setImageFiles, videoFiles, setVideoFiles, currentStep, setCurrentStep,
        loading, error, setError, feedback, setFeedback, submit
    } = useAuctionForm({ category, onSuccess });

    const totalSteps = category === 'pigeons' ? 3 : 2;

    const categoryConfig = useMemo(() => {
        switch (category) {
            case 'pigeons': return { icon: Bird, label: 'Gołąb', color: 'from-gold to-gold-dark', subLabel: 'Wystaw gołębia na aukcję' };
            case 'supplements': return { icon: Pill, label: 'Suplement', color: 'from-emerald-500 to-teal-600', subLabel: 'Witaminy i preparaty' };
            case 'accessories': return { icon: Wrench, label: 'Akcesorium', color: 'from-amber-500 to-orange-600', subLabel: 'Sprzęt i wyposażenie' };
        }
    }, [category]);

    const handlePigeonChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            pigeon: { ...prev.pigeon, [field]: value }
        }));
    };

    const renderCurrentStep = () => {
        // Step 1: Basic Info
        if (currentStep === 1) {
            return (
                <div className="space-y-4">
                    <motion.div
                        className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryConfig.color} shadow-lg shadow-gold/20`}>
                                <categoryConfig.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Dane podstawowe</h3>
                                <p className="text-sm text-white/60">{categoryConfig.subLabel}</p>
                            </div>
                        </div>

                        <InputField
                            label="Tytuł aukcji"
                            name="title"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="np. Wnuk Best Kittel"
                            required
                        />

                        <InputField
                            label="Opis"
                            name="description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Szczegółowy opis przedmiotu..."
                            multiline
                            required
                        />
                    </motion.div>

                    <motion.div
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                            <span className="text-lg">💰</span> Rodzaj sprzedaży
                        </h3>

                        {/* Siatka pól sprzedaży */}
                        <div className="grid grid-cols-3 gap-2">
                            {/* Licytacja */}
                            <InputField
                                label=""
                                name="bidding"
                                value={isBidding ? 'Licytacja' : ''}
                                placeholder="Licytacja"
                                icon={isBidding ? Check : null}
                                highlighted={isBidding}
                                onClick={() => setIsBidding(!isBidding)}
                                onChange={() => {}} 
                                className="mt-6"
                            />

                            {/* Kup Teraz */}
                            <InputField
                                label=""
                                name="buyNow"
                                value={isBuyNow ? 'Kup Teraz' : ''}
                                placeholder="Kup Teraz"
                                icon={isBuyNow ? Check : null}
                                highlighted={isBuyNow}
                                onClick={() => setIsBuyNow(!isBuyNow)}
                                onChange={() => {}} 
                                className="mt-6"
                            />

                            {/* Dni */}
                            <InputField
                                label="Dni"
                                name="durationDays"
                                type="number"
                                value={String(formData.durationDays ?? 7)}
                                onChange={(e) => {
                                    const val = Math.max(0, Math.min(14, Number(e.target.value)));
                                    setFormData({ ...formData, durationDays: val });
                                }}
                            />

                            {/* Cena wywoławcza */}
                            <InputField
                                label="Cena wywoławcza"
                                name="startingPrice"
                                type="number"
                                value={String(formData.startingPrice || '')}
                                onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                                placeholder="0"
                                required={isBidding}
                                className={!isBidding ? 'opacity-50' : ''}
                            />

                            {/* Cena Kup Teraz */}
                            <InputField
                                label="Cena Kup Teraz"
                                name="buyNowPrice"
                                type="number"
                                value={String(formData.buyNowPrice || '')}
                                onChange={(e) => setFormData({ ...formData, buyNowPrice: Number(e.target.value) })}
                                placeholder="0"
                                className={!isBuyNow ? 'opacity-50' : ''}
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

        // Step 2: Pigeon Traits (Pigeons only)
        if (currentStep === 2 && category === 'pigeons') {
            return (
                <motion.div
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="md:col-span-2">
                        <InputField
                            label="Numer obrączki"
                            name="ringNumber"
                            value={formData.pigeon?.ringNumber || ''}
                            onChange={(e) => handlePigeonChange('ringNumber', e.target.value)}
                            placeholder="np. PL-0123-23-1234"
                            required
                        />
                    </div>
                    {traitSelects.map((trait, index) => (
                        <TraitDropdown
                            key={trait.field}
                            label={trait.label}
                            icon={trait.icon}
                            field={trait.field}
                            options={trait.options}
                            value={(formData.pigeon as any)?.[trait.field] || []}
                            onChange={(f, v) => handlePigeonChange(f, v)}
                        />
                    ))}
                </motion.div>
            );
        }

        // Step 2 for Supplements/Accessories or Step 3 for Pigeons: Media
        if ((category !== 'pigeons' && currentStep === 2) || (category === 'pigeons' && currentStep === 3)) {
            return renderMediaSection();
        }

        return null;
    };

    const renderMediaSection = () => (
        <motion.div
            className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Media</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/80"><Camera className="w-4 h-4 text-blue-400" /> Zdjęcia</div>
                    <FileUpload files={imageFiles} onFilesChange={setImageFiles} maxFiles={10} accept="image/*" />
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/80"><Video className="w-4 h-4 text-green-400" /> Filmy</div>
                    <FileUpload files={videoFiles} onFilesChange={setVideoFiles} maxFiles={2} accept="video/*" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-2">
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {totalSteps > 1 && (
                <div className="flex items-center gap-4 px-2 -mt-10 mb-4">
                    {currentStep > 1 ? (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="text-white/60 hover:text-white hover:bg-white/5 gap-2 px-3 h-9"
                        >
                            <ChevronLeft className="w-4 h-4" /> Wstecz
                        </Button>
                    ) : (
                        <div className="w-[84px]" />
                    )}

                    <div className="flex-1 flex items-center justify-center gap-4">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                            <React.Fragment key={step}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                        currentStep >= step ? 'bg-gold border-gold text-navy font-bold shadow-lg shadow-gold/20' : 'border-white/10 text-white/40'
                                    }`}>
                                        {currentStep > step ? <Check className="w-4 h-4" /> : step}
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold tracking-widest hidden md:block ${currentStep >= step ? 'text-gold' : 'text-white/20'}`}>
                                        {category === 'pigeons' 
                                            ? (step === 1 ? 'Podstawowe' : step === 2 ? 'Cechy' : 'Media')
                                            : (step === 1 ? 'Podstawowe' : 'Media')}
                                    </span>
                                </div>
                                {step < totalSteps && <div className={`w-8 h-px ${currentStep > step ? 'bg-gold/40' : 'bg-white/10'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="w-[84px] hidden sm:block" />
                </div>
            )}

            <AnimatePresence mode="wait">
                {renderCurrentStep()}
            </AnimatePresence>

            <div className="flex gap-4 pt-2">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} className="flex-1 py-6 border-white/10 text-white hover:bg-white/5">
                        Anuluj
                    </Button>
                )}

                <Button
                    disabled={loading}
                    onClick={currentStep < totalSteps ? () => setCurrentStep(prev => prev + 1) : submit}
                    className={`flex-[2] py-6 bg-gradient-to-r ${categoryConfig.color} text-white font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : currentStep < totalSteps ? (
                        <span className="flex items-center">Dalej <ChevronRight className="w-5 h-5 ml-2" /></span>
                    ) : (
                        <span className="flex items-center"><Sparkles className="w-5 h-5 mr-2" /> Utwórz aukcję</span>
                    )}
                </Button>
            </div>

            <UnifiedModal
                isOpen={feedback.isOpen}
                onClose={() => {
                    setFeedback(prev => ({ ...prev, isOpen: false }));
                    if (feedback.type === 'success') onSuccess?.();
                }}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                confirmButton={{
                    text: 'Pojąłem', onClick: () => {
                        setFeedback(prev => ({ ...prev, isOpen: false }));
                        if (feedback.type === 'success') onSuccess?.();
                    }
                }}
            />
        </div>
    );
};

export default UnifiedAuctionForm;
