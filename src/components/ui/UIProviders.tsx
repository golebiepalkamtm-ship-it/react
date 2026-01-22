import { ReactNode } from 'react';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';

interface UIProvidersProps {
  children: ReactNode;
}

export const UIProviders = ({ children }: UIProvidersProps) => {
  return (
    <ToastProvider>
      <ModalProvider>
        {children}
      </ModalProvider>
    </ToastProvider>
  );
};
