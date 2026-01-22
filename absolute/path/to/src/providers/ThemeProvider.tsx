const themes = {
  light: {
    '--overlay-bg': 'rgba(255, 255, 255, 0.95)',
    '--text-primary': '#1a1a1a',
    '--accent-gold': '#d4af37'
  },
  dark: {
    '--overlay-bg': 'rgba(0, 0, 0, 0.95)',
    '--text-primary': '#ffffff',
    '--accent-gold': '#c5a642'
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.style.setProperty(
      'color-scheme', 
      theme === 'dark' ? 'dark' : 'light'
    );
    Object.entries(themes[theme]).forEach(([prop, value]) => {
      document.documentElement.style.setProperty(prop, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};