import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

class AuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.user = user;
      this.token = user ? await user.getIdToken() : null;
    });
  }

  async login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    this.token = await result.user.getIdToken();
    return result.user;
  }

  async register(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    this.token = await result.user.getIdToken();
    return result.user;
  }

  async logout() {
    await signOut(auth);
    this.token = null;
    this.user = null;
  }

  getToken = () => this.token;
  getCurrentUser = () => this.user;
  isAuthenticated = () => !!this.user;
}

export const authService = new AuthService();