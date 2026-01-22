import { useDrag } from '@use-gesture/react';

export const GestureModal = ({ children, onClose }: { 
  children: ReactNode;
  onClose: () => void;
}) => {
  const bind = useDrag(({ movement: [mx], velocity }) => {
    if (velocity > 0.5 && mx > 100) onClose();
  });

  return (
    <animated.div
      {...bind()}
      className="touch-none bg-white rounded-xl shadow-2xl"
    >
      {children}
    </animated.div>
  );
};