"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  userRole: string | null;
  availableRoles: string[];
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  sendVerificationEmail: async () => {},
  userRole: null,
  availableRoles: [],
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      // Unblock rendering as soon as auth is known; the role lookup below is a
      // Firestore round trip and must not sit on the first-paint path.
      setLoading(false);

      if (user) {
        // Special handling for System Architect
        if (user.email === 'kameel@maverickdesign.co.za') {
          const systemArchitectRole = 'System Architect';
          setUserRole(systemArchitectRole);
          
          // Ensure Firestore is in sync and fetch actual display name
          try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            let actualDisplayName = user.displayName || 'Kameel';
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              // Use the display name from Firestore if available
              if (userData.displayName && userData.displayName !== 'System Architect') {
                actualDisplayName = userData.displayName;
              }
              
              // Update Firestore if role is incorrect
              if (userData.role !== systemArchitectRole) {
                await setDoc(userRef, {
                  uid: user.uid,
                  email: user.email,
                  displayName: actualDisplayName,
                  role: systemArchitectRole,
                  updatedAt: new Date().toISOString()
                }, { merge: true });
              }
            } else {
              // Create new user document
              await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: actualDisplayName,
                role: systemArchitectRole,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
            
            // Update Firebase Auth profile if needed
            if (!user.displayName || user.displayName === 'System Architect') {
              await updateProfile(user, { displayName: actualDisplayName });
            }
          } catch (error) {
            console.error('Error syncing System Architect role:', error);
          }
           setAvailableRoles(['System Architect']); // The UI handles the "All Roles" display for System Architect specifically
        } else {
          // Fetch user role from Firestore for other users
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              const primaryRole = data.role || 'Player';
              setUserRole(primaryRole);
              
              // Handle multiple roles
              if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
                 // Ensure primary role is in the list
                 const roles = data.roles.includes(primaryRole) ? data.roles : [primaryRole, ...data.roles];
                 // Remove duplicates just in case
                 setAvailableRoles([...new Set(roles)]);
              } else {
                setAvailableRoles([primaryRole]);
              }

            } else {
              setUserRole('Player'); // Default role
              setAvailableRoles(['Player']);
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
            setUserRole('Player');
            setAvailableRoles(['Player']);
          }
        }
      } else {
        setUserRole(null);
        setAvailableRoles([]);
      }
    });

    return unsubscribe;
  }, []);

  // Server actions authorize against an httpOnly session cookie, not the
  // client SDK's state, so every sign-in must mint one. Firebase only accepts
  // an ID token minted in the last five minutes, so this runs at sign-in
  // rather than on token refresh.
  const startServerSession = async (firebaseUser: User) => {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error('Could not establish a secure session. Please try again.');
  };

  const signIn = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await startServerSession(user);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile
    await updateProfile(user, { displayName });
    
    // Send verification email
    await sendEmailVerification(user);
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      role: 'Player', // Default role
      roles: ['Player'], // Default roles list
      createdAt: new Date().toISOString(),
      emailVerified: false,
    });

    await startServerSession(user);
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } finally {
      await firebaseSignOut(auth);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    if (user) {
      await sendEmailVerification(user);
    } else {
      throw new Error('No user is currently signed in');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword, sendVerificationEmail, userRole, availableRoles }}>
      {children}
    </AuthContext.Provider>
  );
}
