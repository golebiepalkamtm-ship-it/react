import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className = '' }: LoadingSpinnerProps) => (
  <div className={`flex items-center justify-center min-h-[50vh] ${className}`}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="relative"
    >
      <Loader2 className="w-12 h-12 text-gold" />
    </motion.div>
  </div>
);

export default LoadingSpinner;
