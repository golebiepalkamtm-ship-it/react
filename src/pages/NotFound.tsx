import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logger } from '@/lib/logger';

const NotFound = (props) => {
  const location = useLocation();

  useEffect(() => {
    logger.warn("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Ups! Strona nie została znaleziona</p>
        <a href="/" className="text-black underline hover:text-black/90">
          Wróć do strony głównej
        </a>
      </div>
    </div>
  );
};

export default NotFound;
