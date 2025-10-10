// Simple user management (you can enhance this later with Firebase Auth)
export interface User {
    id: string;
    name: string;
    email?: string;
  }
  
  // Generate a simple user ID (in production, use Firebase Auth)
  export const createUser = (name: string): User => {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      name,
    };
  };
  
  // Get or create user from localStorage
  export const getCurrentUser = (): User => {
    const stored = localStorage.getItem('rate-everything-user');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Create anonymous user
    const user = createUser('Anonymous User');
    localStorage.setItem('rate-everything-user', JSON.stringify(user));
    return user;
  };