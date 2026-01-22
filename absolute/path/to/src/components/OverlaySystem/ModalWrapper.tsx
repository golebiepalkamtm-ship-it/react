import { FocusTrap } from 'focus-trap-react';

export const ModalWrapper = ({ children }: { children: ReactNode }) => {
  const trapRef = useRef<FocusTrap>();

  useHotkeys('esc', () => {
    trapRef.current?.deactivate();
    // ... logika zamykania ...
  });

  return (
    <FocusTrap ref={trapRef}>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </FocusTrap>
  );
};