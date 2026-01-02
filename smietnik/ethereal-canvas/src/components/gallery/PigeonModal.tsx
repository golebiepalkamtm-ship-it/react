import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, MapPin, Calendar, Zap, Award, Star } from "lucide-react";
import type { Pigeon } from "@/data/pigeons";
import { pigeons } from "@/data/pigeons";

interface PigeonModalProps {
  pigeon: Pigeon | null;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
}

export const PigeonModal = ({ pigeon, onClose, onNavigate }: PigeonModalProps) => {
  if (!pigeon) return null;

  const currentIndex = pigeons.findIndex((p) => p.id === pigeon.id);

  return (
    <AnimatePresence>
      {pigeon && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Light effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: "radial-gradient(circle at 50% 30%, hsla(45, 80%, 55%, 0.1) 0%, transparent 50%)",
            }}
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl gold-border"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 p-3 glass-card rounded-full border border-primary/30 text-foreground hover:text-primary hover:border-primary/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation arrows */}
            <button
              onClick={() => onNavigate("prev")}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 glass-card rounded-full border border-primary/30 text-foreground hover:text-primary hover:border-primary/60 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => onNavigate("next")}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 glass-card rounded-full border border-primary/30 text-foreground hover:text-primary hover:border-primary/60 transition-colors"
            >
              →
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              {/* Image section */}
              <div className="relative h-[400px] md:h-full overflow-hidden">
                <motion.img
                  key={pigeon.id}
                  src={pigeon.image}
                  alt={pigeon.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 md:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:hidden" />

                {/* Champion badge */}
                <motion.div
                  className="absolute top-6 left-6"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-primary/50 shadow-glow">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold text-primary">Champion #{currentIndex + 1}</span>
                  </div>
                </motion.div>
              </div>

              {/* Content section */}
              <div className="p-8 md:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="font-display text-4xl md:text-5xl font-bold gold-text mb-2">
                    {pigeon.name}
                  </h2>
                  <p className="text-xl text-primary font-medium mb-6">{pigeon.title}</p>
                </motion.div>

                {/* Stats */}
                <motion.div
                  className="grid grid-cols-2 gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="p-4 glass-card rounded-xl border border-border/30">
                    <MapPin className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Rasa</p>
                    <p className="text-foreground font-medium">{pigeon.breed}</p>
                  </div>
                  <div className="p-4 glass-card rounded-xl border border-border/30">
                    <Calendar className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Rocznik</p>
                    <p className="text-foreground font-medium">{pigeon.year}</p>
                  </div>
                  <div className="p-4 glass-card rounded-xl border border-border/30">
                    <Zap className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Prędkość</p>
                    <p className="text-foreground font-medium">{pigeon.records[0]}</p>
                  </div>
                  <div className="p-4 glass-card rounded-xl border border-border/30">
                    <Award className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Dystans</p>
                    <p className="text-foreground font-medium">{pigeon.records[1]}</p>
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  className="mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                    Historia
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pigeon.description}
                  </p>
                </motion.div>

                {/* Achievements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Osiągnięcia
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {pigeon.achievements.map((achievement, i) => (
                      <motion.span
                        key={i}
                        className="px-4 py-2 text-sm rounded-full bg-primary/10 text-primary border border-primary/30"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        {achievement}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Page indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {pigeons.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-6 bg-primary shadow-glow"
                    : "bg-primary/30"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
