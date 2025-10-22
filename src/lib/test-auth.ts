// Test Firebase Google Auth Configuration
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const testGoogleAuth = async () => {
  try {
    console.log('🔍 Testing Google Auth Configuration...');
    console.log('Auth instance:', auth.app.name);
    
    const provider = new GoogleAuthProvider();
    console.log('Provider created:', provider);
    
    const result = await signInWithPopup(auth, provider);
    console.log('✅ Google Auth Success:', result.user);
    return result;
  } catch (error: any) {
    console.error('❌ Google Auth Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};
