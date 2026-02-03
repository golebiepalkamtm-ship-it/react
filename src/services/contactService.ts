import { supabase } from '@/lib/supabase';

export interface ContactFormData {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactResponse {
  message: string;
}

export const contactService = {
  /**
   * Wyślij formularz kontaktowy - zapisuje do Supabase i otwiera email
   */
  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    // Zapisz wiadomość do Supabase (jeśli tabela istnieje)
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          full_name: data.fullName,
          email: data.email,
          subject: data.subject,
          message: data.message,
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        console.warn('Could not save to database:', error.message);
        // Kontynuuj nawet jeśli baza nie działa
      }
    } catch (e) {
      console.warn('Database save failed:', e);
    }
    
    // Otwórz klienta email z wypełnionymi danymi (bez przekierowania strony)
    const emailTo = 'kontakt@palkamtm.pl';
    const emailSubject = encodeURIComponent(`[Formularz kontaktowy] ${data.subject}`);
    const emailBody = encodeURIComponent(
      `Imię i nazwisko: ${data.fullName}\n` +
      `Email: ${data.email}\n` +
      `Temat: ${data.subject}\n\n` +
      `Wiadomość:\n${data.message}`
    );
    
    // Utwórz tymczasowy link i kliknij go
    const mailtoLink = document.createElement('a');
    mailtoLink.href = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
    mailtoLink.target = '_blank';
    mailtoLink.rel = 'noopener noreferrer';
    document.body.appendChild(mailtoLink);
    mailtoLink.click();
    document.body.removeChild(mailtoLink);
    
    return { message: 'Formularz został przesłany' };
  },
};

export default contactService;
