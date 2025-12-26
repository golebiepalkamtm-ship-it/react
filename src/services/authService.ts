export class AuthServiceRemovedError extends Error {
  constructor() {
    super('Firebase authService was removed. Use Supabase via AuthContext (useAuth) instead.');
  }
}

export const authService = {
  login: async () => {
    throw new AuthServiceRemovedError();
  },
  register: async () => {
    throw new AuthServiceRemovedError();
  },
  logout: async () => {
    throw new AuthServiceRemovedError();
  },
  getToken: () => {
    throw new AuthServiceRemovedError();
  },
  getCurrentUser: () => {
    throw new AuthServiceRemovedError();
  },
  isAuthenticated: () => {
    throw new AuthServiceRemovedError();
  },
};