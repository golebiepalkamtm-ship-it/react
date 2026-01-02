export { apiClient } from './api';
export { auctionService } from './auctionService';
export { contactService } from './contactService';
export { meetingsService } from './meetingsService';
export { referencesService } from './referencesService';
export { userService } from './userService';
export { websocketService } from './websocketService';

export type { ContactFormData } from './contactService';
export type { Meeting, CreateMeetingRequest } from './meetingsService';
export type { Reference, CreateReferenceRequest } from './referencesService';

export type { SupabaseClient } from '@supabase/supabase-js';
