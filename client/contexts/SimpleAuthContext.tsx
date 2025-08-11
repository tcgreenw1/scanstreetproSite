import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { getErrorMessage } from '@/utils/errorHandler';

interface SimpleUser {
  id: string;
  email: string;
  role?: string;
  organization_id?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  } | null;
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('simpleAuth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.warn('Invalid saved user data:', error);
        localStorage.removeItem('simpleAuth_user');
      }
    }
    
    setLoading(false);

    return () => {
      mounted.current = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Demo users for testing
      const demoUsers = [
        {
          id: 'admin-demo',
          email: 'admin@scanstreetpro.com',
          password: 'AdminPass123!',
          role: 'admin',
          organization: {
            id: 'org-admin',
            name: 'Scan Street Pro Admin',
            slug: 'scan-street-admin',
            plan: 'enterprise'
          }
        },
        {
          id: 'test-demo',
          email: 'test@springfield.gov',
          password: 'TestUser123!',
          role: 'manager',
          organization: {
            id: 'org-springfield-free',
            name: 'City of Springfield (Free)',
            slug: 'springfield-free',
            plan: 'free'
          }
        },
        {
          id: 'premium-demo',
          email: 'premium@springfield.gov',
          password: 'Premium!',
          role: 'manager',
          organization: {
            id: 'org-springfield-premium',
            name: 'City of Springfield (Premium)',
            slug: 'springfield-premium',
            plan: 'professional'
          }
        }
      ];

      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        const authUser: SimpleUser = {
          id: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
          organization_id: demoUser.organization.id,
          organization: demoUser.organization
        };

        setUser(authUser);
        localStorage.setItem('simpleAuth_user', JSON.stringify(authUser));
        console.log('✅ Demo user signed in:', email);
      } else {
        throw new Error('Invalid credentials. Use demo credentials: admin@scanstreetpro.com / AdminPass123!');
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      throw new Error('Sign up not available in demo mode. Use existing demo credentials.');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      localStorage.removeItem('simpleAuth_user');
      console.log('✅ Signed out');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
