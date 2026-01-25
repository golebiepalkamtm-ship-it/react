export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-light to-background" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                <span className="font-display font-bold text-primary-foreground">P</span>
              </div>
              <span className="font-display text-xl font-semibold text-foreground">
                Pałka M.T.M.
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Hodowla gołębi pocztowych najwyższej klasy. 
              Pasja, tradycja i wieloletnie doświadczenie.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Szybkie linki
            </h4>
            <ul className="space-y-3">
              {['O nas', 'Osiągnięcia', 'Hodowla', 'Kontakt'].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(' ', '-')}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">
              Bądź na bieżąco
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Zapisz się do newslettera i otrzymuj najnowsze informacje o naszej hodowli.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Twój email"
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Zapisz
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Pałka M.T.M. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Polityka prywatności
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Regulamin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
