import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import authVideo from "@/assets/auth-background.mp4";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1 
      }
    },
    exit: { opacity: 0, x: -20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Video Background - Left Side */}
      <div className="hidden lg:block lg:w-3/5 xl:w-2/3 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={authVideo} type="video/mp4" />
        </video>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        
        {/* Brand watermark */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-12 left-12 z-10"
        >
          <h1 className="font-display text-5xl xl:text-6xl text-cream tracking-tight">
            PALKA<span className="text-gradient-gold">MTM</span>
          </h1>
          <p className="text-cream/60 mt-3 text-lg tracking-wide font-light">
            Hodowla Gołębi Sportowych
          </p>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/10 to-transparent blur-2xl" />
      </div>

      {/* Auth Form - Right Side */}
      <div className="w-full lg:w-2/5 xl:w-1/3 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        {/* Mobile video background */}
        <div className="absolute inset-0 lg:hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src={authVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
        </div>

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-6"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-gold" />
            </motion.div>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-tight mb-2">
              {isSignUp ? "Dołącz do nas" : "Witaj ponownie"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isSignUp 
                ? "Stwórz konto i odkryj świat hodowli" 
                : "Zaloguj się do swojego konta"}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="relative bg-secondary/50 rounded-xl p-1 mb-8 backdrop-blur-sm border border-border/50">
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-card rounded-lg shadow-lg border border-border/50"
              animate={{ x: isSignUp ? "calc(100% + 4px)" : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <div className="relative flex">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-3 text-sm font-medium transition-colors duration-300 rounded-lg ${
                  !isSignUp ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                Logowanie
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-3 text-sm font-medium transition-colors duration-300 rounded-lg ${
                  isSignUp ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                Rejestracja
              </button>
            </div>
          </div>

          {/* Social Auth */}
          <div className="space-y-3 mb-8">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--secondary))" }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-card border border-border/50 text-foreground text-sm font-medium transition-all duration-300 hover:border-primary/30"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Kontynuuj z Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--secondary))" }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-card border border-border/50 text-foreground text-sm font-medium transition-all duration-300 hover:border-primary/30"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Kontynuuj z Facebook
            </motion.button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs text-muted-foreground uppercase tracking-wider">
                lub email
              </span>
            </div>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? "signup" : "signin"}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {isSignUp && (
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Imię i nazwisko
                  </label>
                  <motion.div
                    variants={inputVariants}
                    whileFocus="focus"
                    className="relative group"
                  >
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Jan Kowalski"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                  </motion.div>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Adres email
                </label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  className="relative group"
                >
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="twoj@email.com"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Hasło
                </label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  className="relative group"
                >
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </motion.div>
              </motion.div>

              {isSignUp && (
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Potwierdź hasło
                  </label>
                  <motion.div
                    variants={inputVariants}
                    whileFocus="focus"
                    className="relative group"
                  >
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {!isSignUp && (
                <motion.div variants={itemVariants} className="flex justify-end">
                  <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                    Zapomniałeś hasła?
                  </a>
                </motion.div>
              )}

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-gradient-gold text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-gold hover:opacity-90 transition-all duration-300 group"
              >
                {isSignUp ? "Utwórz konto" : "Zaloguj się"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-8">
            {isSignUp ? "Masz już konto? " : "Nie masz konta? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isSignUp ? "Zaloguj się" : "Zarejestruj się"}
            </button>
          </p>

          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            Kontynuując, akceptujesz nasze{" "}
            <a href="#" className="underline hover:text-muted-foreground transition-colors">
              Warunki użytkowania
            </a>{" "}
            i{" "}
            <a href="#" className="underline hover:text-muted-foreground transition-colors">
              Politykę prywatności
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
