import { describe, it, expect } from 'vitest';
import { censorText } from '../utils/antiCircumvention.js';

describe('Anti-Circumvention Module', () => {
  it('should not alter clean text', () => {
    const text = 'This is a normal description for my item.';
    expect(censorText(text)).toBe(text);
  });

  it('should replace email addresses with hidden-contact marker', () => {
    const text = 'Contact me at test@example.com for more info.';
    const censored = censorText(text);
    expect(censored).toContain('Dane ukryte do momentu opłacenia aukcji');
    expect(censored).not.toContain('test@example.com');
  });

  it('should replace phone numbers with hidden-contact marker', () => {
    const text = 'Call me: +48 123 456 789 or 123456789.';
    const censored = censorText(text);
    expect(censored).toContain('Dane ukryte do momentu opłacenia aukcji');
    expect(censored).not.toContain('123456789');
    expect(censored).not.toContain('123 456 789');
  });

  it('should replace prohibited keywords with ***', () => {
    const text = 'Can we do this via revolut or blik? Send me a przelew.';
    const censored = censorText(text);
    expect(censored).toContain('***');
    expect(censored.toLowerCase()).not.toContain('revolut');
    expect(censored.toLowerCase()).not.toContain('blik');
    expect(censored.toLowerCase()).not.toContain('przelew');
  });

  it('should handle multiple violations in one text', () => {
    const text = 'Hit me up at foo@bar.com or call 555-123-456. Accept blik.';
    const censored = censorText(text);
    expect(censored).toContain('Dane ukryte do momentu opłacenia aukcji');
    expect(censored).toContain('***');
  });
});
