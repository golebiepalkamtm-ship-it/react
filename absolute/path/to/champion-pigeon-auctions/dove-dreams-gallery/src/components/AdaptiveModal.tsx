type ModalState = 'entering' | 'active' | 'loading_internal' | 'success_feedback' | 'exiting';

const ModalContext = createContext<{
  state: ModalState;
  variant: 'admin' | 'auction';
  triggerTransition: (newState: ModalState) => void;
}>(null!);

const ModalRoot = ({ variant }: { variant: 'admin' | 'auction' }) => {
  const [currentState, setState] = useState<ModalState>('entering');
  
  const theme = useMemo(() => variant === 'admin' ? {
    accent: 'bg-blue-600',
    icon: ShieldIcon,
    blur: 'backdrop-blur-lg'
  } : {
    accent: 'bg-amber-900',
    icon: GemIcon,
    blur: 'backdrop-blur-xl'
  }, [variant]);

  // ... existing code ...
}