import { User as FirebaseUser } from 'firebase/auth';

// User interface that extends Firebase user with additional properties
export interface User {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
  isAnonymous?: boolean;
}

// Convert Firebase user to our User interface
export const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous User',
    email: firebaseUser.email || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    isAnonymous: firebaseUser.isAnonymous,
  };
};

// Generate a simple user ID for anonymous users (fallback)
export const createAnonymousUser = (): User => {
  const id = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    name: 'Anonymous User',
    isAnonymous: true,
  };
};

// Get or create anonymous user from localStorage (fallback when no Firebase auth)
export const getAnonymousUser = (): User => {
  const stored = localStorage.getItem('rate-everything-anonymous-user');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Create anonymous user
  const user = createAnonymousUser();
  localStorage.setItem('rate-everything-anonymous-user', JSON.stringify(user));
  return user;
};