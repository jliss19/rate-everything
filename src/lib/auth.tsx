import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase';
import { createOrUpdateUserProfile } from './database';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData?: { name?: string; photoURL?: string; profileDescription?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData?: { name?: string; photoURL?: string; profileDescription?: string }
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firebase Realtime Database
      // Note: Firebase Auth handles password hashing securely, so we don't store password hashes
      await createOrUpdateUserProfile(user.uid, {
        email: user.email || email,
        name: profileData?.name || user.email?.split('@')[0] || 'User',
        photoURL: profileData?.photoURL || user.photoURL,
        profileDescription: profileData?.profileDescription,
      });
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Create or update user profile in Firebase Realtime Database
      await createOrUpdateUserProfile(user.uid, {
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || undefined,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
