import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import Header from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-transparent">
      <Header />
      <div className="text-center relative z-10">
        <h1 className="font-display text-4xl md:text-5xl text-foreground font-bold leading-tight mb-4">
          404
        </h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Ups! Strona nie została znaleziona
        </p>
        <Link to="/" className="text-black underline hover:text-black/90">
          Wróć do strony głównej
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
