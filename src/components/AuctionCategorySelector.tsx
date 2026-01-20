import { Bird, Pill, Droplet, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AuctionCategorySelectorProps {
  onSelectCategory: (category: 'pigeons' | 'supplements' | 'accessories') => void;
  onCancel: () => void;
}

const AuctionCategorySelector = ({ onSelectCategory, onCancel }: AuctionCategorySelectorProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'pigeons' as const,
      title: 'Aukcja gołębi',
      description: 'Sprzedaj lub kup gołębie wyścigowe',
      icon: Bird,
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      hoverGradient: 'from-blue-600 via-blue-700 to-indigo-800',
      iconColor: 'text-blue-100',
      glowColor: 'shadow-blue-500/50',
      borderColor: 'border-blue-400/30',
      particleColor: 'bg-blue-400',
    },
    {
      id: 'supplements' as const,
      title: 'Suplementy',
      description: 'Witaminy i preparaty dla gołębi',
      icon: Pill,
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      hoverGradient: 'from-emerald-600 via-green-700 to-teal-800',
      iconColor: 'text-green-100',
      glowColor: 'shadow-green-500/50',
      borderColor: 'border-green-400/30',
      particleColor: 'bg-green-400',
    },
    {
      id: 'accessories' as const,
      title: 'Akcesoria hodowlane',
      description: 'Sprzęt i wyposażenie gołębnika',
      icon: Droplet,
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      hoverGradient: 'from-amber-600 via-orange-700 to-red-700',
      iconColor: 'text-amber-100',
      glowColor: 'shadow-amber-500/50',
      borderColor: 'border-amber-400/30',
      particleColor: 'bg-amber-400',
    },
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
      >
        <motion.div 
          className="inline-flex items-center gap-3 mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-gold via-gold-light to-gold-dark shadow-lg shadow-gold/30"
            animate={{ 
              boxShadow: ['0 10px 40px rgba(212,175,55,0.3)', '0 10px 60px rgba(212,175,55,0.5)', '0 10px 40px rgba(212,175,55,0.3)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-navy" />
          </motion.div>
        </motion.div>
        
        <motion.h2 
          className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gold-light to-gold bg-clip-text text-transparent mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Utwórz aukcję
        </motion.h2>
        <motion.p 
          className="text-white/70 text-lg max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Wybierz kategorię aukcji, którą chcesz utworzyć
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: 0.2 + index * 0.1, 
              type: "spring", 
              stiffness: 200, 
              damping: 20 
            }}
            whileHover={{ 
              y: -12, 
              scale: 1.03,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(category.id)}
            onMouseEnter={() => setHoveredCategory(category.id)}
            onMouseLeave={() => setHoveredCategory(null)}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${category.gradient} p-8 md:p-10 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-gold/50 border ${category.borderColor} ${hoveredCategory === category.id ? `shadow-2xl ${category.glowColor}` : 'shadow-xl shadow-black/30'}`}
          >
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 60%)',
              }}
            />

            <AnimatePresence>
              {hoveredCategory === category.id && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full ${category.particleColor} opacity-60`}
                      initial={{ 
                        x: Math.random() * 200 - 100, 
                        y: 150,
                        scale: 0 
                      }}
                      animate={{ 
                        y: -50 - Math.random() * 100,
                        x: Math.random() * 200 - 100,
                        scale: [0, 1, 0],
                        opacity: [0, 0.8, 0]
                      }}
                      transition={{ 
                        duration: 1.5 + Math.random() * 0.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 0.5
                      }}
                      style={{
                        left: '50%',
                        filter: 'blur(1px)',
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center justify-center space-y-5 relative z-10">
              <motion.div 
                className="relative"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
                  animate={hoveredCategory === category.id ? {
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="relative p-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <category.icon className={`relative w-16 h-16 md:w-20 md:h-20 ${category.iconColor} stroke-[1.5] drop-shadow-lg`} />
                </motion.div>
              </motion.div>
              
              <div className="text-center space-y-2">
                <motion.h3 
                  className="text-xl md:text-2xl font-bold text-white drop-shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {category.title}
                </motion.h3>
                <motion.p 
                  className="text-sm text-white/70 max-w-[200px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {category.description}
                </motion.p>
              </div>

              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ y: 10 }}
                whileHover={{ y: 0 }}
              >
                <span className="text-sm text-white font-medium">Wybierz</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.div>
              </motion.div>
            </div>

            <motion.div 
              className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" 
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
            />
          </motion.button>
        ))}
      </div>

      <motion.div 
        className="flex justify-center pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={onCancel}
          className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <X className="w-5 h-5" />
          </motion.div>
          <span className="font-medium">Anuluj</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default AuctionCategorySelector;
