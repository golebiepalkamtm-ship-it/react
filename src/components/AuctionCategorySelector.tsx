import { Bird, Pill, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuctionCategorySelectorProps {
  onSelectCategory: (category: 'pigeons' | 'supplements' | 'accessories') => void;
  onCancel: () => void;
}

const AuctionCategorySelector = ({ onSelectCategory, onCancel }: AuctionCategorySelectorProps) => {
  const categories = [
    {
      id: 'pigeons' as const,
      title: 'Aukcja gołębi',
      icon: Bird,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      iconColor: 'text-blue-100',
    },
    {
      id: 'supplements' as const,
      title: 'Suplementy',
      icon: Pill,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700',
      iconColor: 'text-green-100',
    },
    {
      id: 'accessories' as const,
      title: 'Akcesoria hodowlane',
      icon: Droplet,
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700',
      iconColor: 'text-amber-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Utwórz aukcję
        </h2>
        <p className="text-muted-foreground text-lg">
          Wybierz kategorię aukcji, którą chcesz utworzyć
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectCategory(category.id)}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} ${category.hoverColor} p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-gold/50`}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                <category.icon className={`relative w-20 h-20 ${category.iconColor} stroke-[1.5]`} />
              </div>
              
              <h3 className="text-xl font-bold text-white text-center">
                {category.title}
              </h3>
            </div>

            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
          </motion.button>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
};

export default AuctionCategorySelector;
