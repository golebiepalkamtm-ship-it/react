const SettingsSection = ({ title, children }: {
  title: string;
  children: ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        className="flex justify-between w-full"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold">{title}</span>
        <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};