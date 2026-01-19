import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Price Formatting', () => {
    const formatPrice = (price: number, currency = 'PLN') => {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency,
      }).format(price);
    };

    it('should format price in PLN', () => {
      const result = formatPrice(1000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should handle decimal prices', () => {
      const result = formatPrice(99.99);
      expect(result).toContain('99');
    });

    it('should handle zero price', () => {
      const result = formatPrice(0);
      expect(result).toContain('0');
    });
  });

  describe('Date Formatting', () => {
    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTimeRemaining = (endDate: Date) => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff <= 0) return 'Zakończona';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    it('should format date in Polish locale', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('2024');
    });

    it('should show "Zakończona" for past dates', () => {
      const pastDate = new Date(Date.now() - 1000);
      const result = formatTimeRemaining(pastDate);
      expect(result).toBe('Zakończona');
    });

    it('should format days and hours for future dates', () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const result = formatTimeRemaining(futureDate);
      expect(result).toContain('d');
    });
  });

  describe('Validation', () => {
    const validateEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
      const phoneRegex = /^\+?[0-9]{9,15}$/;
      return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const validateBidAmount = (amount: number, currentPrice: number, minIncrement: number) => {
      if (amount <= 0) return { valid: false, error: 'Amount must be positive' };
      if (amount < currentPrice + minIncrement) {
        return { valid: false, error: `Minimum bid is ${currentPrice + minIncrement}` };
      }
      return { valid: true };
    };

    it('should validate correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });

    it('should validate correct phone', () => {
      expect(validatePhone('+48123456789')).toBe(true);
      expect(validatePhone('123456789')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
    });

    it('should validate bid amount', () => {
      const result = validateBidAmount(150, 100, 10);
      expect(result.valid).toBe(true);
    });

    it('should reject bid below minimum', () => {
      const result = validateBidAmount(105, 100, 10);
      expect(result.valid).toBe(false);
    });

    it('should reject zero bid', () => {
      const result = validateBidAmount(0, 100, 10);
      expect(result.valid).toBe(false);
    });
  });

  describe('String Utils', () => {
    const truncate = (str: string, maxLength: number) => {
      if (str.length <= maxLength) return str;
      return str.slice(0, maxLength) + '...';
    };

    const generateUsername = (email: string) => {
      return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    };

    it('should truncate long strings', () => {
      const result = truncate('This is a very long string', 10);
      expect(result).toBe('This is a ...');
    });

    it('should not truncate short strings', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });

    it('should generate username from email', () => {
      const result = generateUsername('john.doe@example.com');
      expect(result).toBe('john_doe');
    });
  });

  describe('Number Utils', () => {
    const clamp = (value: number, min: number, max: number) => {
      return Math.min(Math.max(value, min), max);
    };

    const calculateCommission = (amount: number, rate = 0.1) => {
      return Math.round(amount * rate * 100) / 100;
    };

    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('should calculate 10% commission', () => {
      expect(calculateCommission(1000)).toBe(100);
      expect(calculateCommission(555)).toBe(55.5);
    });
  });
});
