import { createContext, useContext } from 'react';

interface CardContextValue {
  variant: 'default' | 'elevated' | 'outlined';
  size: 'sm' | 'md' | 'lg';
}

const CardContext = createContext<CardContextValue | undefined>(undefined);

interface CardProps {
  children: any;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}: CardProps) {
  const variants = {
    default: 'bg-card border border-border',
    elevated: 'bg-card shadow-lg border-0',
    outlined: 'bg-transparent border-2 border-border'
  };

  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <CardContext.Provider value={{ variant, size }}>
      <div className={`rounded-xl transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

export function CardHeader({ children, className = '' }: { children: any; className?: string }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: any; className?: string }) {
  return (
    <h3 className={`text-xl font-semibold text-foreground ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: any; className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: any; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: any; className?: string }) {
  return (
    <div className={`mt-4 pt-4 border-t border-border ${className}`}>
      {children}
    </div>
  );
}
