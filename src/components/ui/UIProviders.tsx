import { ReactNode } from 'react';
import { ToastProvider } from './ToastProvider';
import { OverlayProvider } from '@/components/overlays/OverlayProvider';

interface UIProvidersProps {
  children: ReactNode;
}

export const UIProviders = ({ children }: UIProvidersProps) => {
  return (
    <ToastProvider>
      <OverlayProvider>
        {children}
      </OverlayProvider>
    </ToastProvider>
  );
};
