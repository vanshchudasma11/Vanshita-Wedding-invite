import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type FamilyAuthStatus = 'loading' | 'unauthenticated' | 'unauthorized' | 'authorized';

export interface AuthDiagnosticInfo {
  checkedEmail: string | null;
  userId: string | null;
  matchedVia: 'env_allowlist' | 'default_allowlist' | 'database_user_id' | 'database_email' | 'none';
  dbTableStatus: 'found' | 'missing' | 'error' | 'not_queried';
  dbErrorMessage?: string;
  allowedEmailsConfigured: string[];
}

/**
 * Hardcoded allowlist of explicitly authorized family email addresses.
 * Additional emails can be supplied via VITE_FAMILY_EMAILS or public.family_members table.
 */
const DEFAULT_AUTHORIZED_FAMILY_EMAILS: string[] = [
  'vanshchudasma11@gmail.com',
];

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** Overall family-dashboard authorization status */
  familyStatus: FamilyAuthStatus;
  /** Diagnostic information useful for debugging authorization issues in development */
  diagnosticInfo: AuthDiagnosticInfo | null;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  /** Re-check family_members membership (call after sign-in) */
  refreshFamilyStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function checkFamilyMembership(
  currentUser: User,
  setDiag?: (diag: AuthDiagnosticInfo) => void
): Promise<boolean> {
  const email = (currentUser.email || (currentUser.user_metadata?.email as string) || '')
    .trim()
    .toLowerCase();
  const userId = currentUser.id;

  const rawEnvEmails = (import.meta.env.VITE_FAMILY_EMAILS as string | undefined) || '';
  const envAllowedEmails = rawEnvEmails
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const allConfiguredEmails = Array.from(
    new Set([...DEFAULT_AUTHORIZED_FAMILY_EMAILS, ...envAllowedEmails])
  );

  // 1. Check default / hardcoded allowlist
  if (email && DEFAULT_AUTHORIZED_FAMILY_EMAILS.includes(email)) {
    const diag: AuthDiagnosticInfo = {
      checkedEmail: email,
      userId,
      matchedVia: 'default_allowlist',
      dbTableStatus: 'not_queried',
      allowedEmailsConfigured: allConfiguredEmails,
    };
    setDiag?.(diag);
    if (import.meta.env.DEV) {
      console.info('[Auth Diagnostics] Authorized via hardcoded family allowlist:', email);
    }
    return true;
  }

  // 2. Check configured environment allowlist if set
  if (email && envAllowedEmails.includes(email)) {
    const diag: AuthDiagnosticInfo = {
      checkedEmail: email,
      userId,
      matchedVia: 'env_allowlist',
      dbTableStatus: 'not_queried',
      allowedEmailsConfigured: allConfiguredEmails,
    };
    setDiag?.(diag);
    if (import.meta.env.DEV) {
      console.info('[Auth Diagnostics] Authorized via VITE_FAMILY_EMAILS allowlist:', email);
    }
    return true;
  }

  // 3. Check database table `family_members`
  try {
    let dbStatus: 'found' | 'missing' | 'error' = 'found';
    let dbErrorMsg: string | undefined;

    // 3A. Query by user_id
    const { data: byId, error: errorId } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (errorId) {
      if (errorId.code === 'PGRST205' || errorId.message.includes('schema cache')) {
        dbStatus = 'missing';
        dbErrorMsg = 'Table public.family_members does not exist in Supabase schema cache.';
      } else if (errorId.code !== 'PGRST116') {
        dbStatus = 'error';
        dbErrorMsg = errorId.message;
      }
    }

    if (byId) {
      const diag: AuthDiagnosticInfo = {
        checkedEmail: email,
        userId,
        matchedVia: 'database_user_id',
        dbTableStatus: 'found',
        allowedEmailsConfigured: allConfiguredEmails,
      };
      setDiag?.(diag);
      if (import.meta.env.DEV) {
        console.info('[Auth Diagnostics] Authorized via family_members database table (user_id match):', userId);
      }
      return true;
    }

    // 3B. Query by email
    if (email) {
      const { data: byEmail, error: errorEmail } = await supabase
        .from('family_members')
        .select('id, user_id')
        .ilike('email', email)
        .maybeSingle();

      if (errorEmail && dbStatus === 'found') {
        if (errorEmail.code === 'PGRST205' || errorEmail.message.includes('schema cache')) {
          dbStatus = 'missing';
          dbErrorMsg = 'Table public.family_members does not exist in Supabase schema cache.';
        } else if (errorEmail.code !== 'PGRST116') {
          dbStatus = 'error';
          dbErrorMsg = errorEmail.message;
        }
      }

      if (byEmail) {
        // Link user_id if null
        if (!byEmail.user_id) {
          void Promise.resolve(
            supabase
              .from('family_members')
              .update({ user_id: userId })
              .eq('id', byEmail.id)
          ).catch(() => {});
        }
        const diag: AuthDiagnosticInfo = {
          checkedEmail: email,
          userId,
          matchedVia: 'database_email',
          dbTableStatus: 'found',
          allowedEmailsConfigured: allConfiguredEmails,
        };
        setDiag?.(diag);
        if (import.meta.env.DEV) {
          console.info('[Auth Diagnostics] Authorized via family_members database table (email match):', email);
        }
        return true;
      }
    }

    // User is neither in allowlists nor database table
    const diag: AuthDiagnosticInfo = {
      checkedEmail: email || null,
      userId,
      matchedVia: 'none',
      dbTableStatus: dbStatus,
      dbErrorMessage: dbErrorMsg,
      allowedEmailsConfigured: allConfiguredEmails,
    };
    setDiag?.(diag);

    if (import.meta.env.DEV) {
      console.warn('[Auth Diagnostics] Authorization rejected:', {
        email: email || '(empty)',
        userId,
        reason:
          dbStatus === 'missing'
            ? 'family_members table missing in Supabase and email not found in configured allowlist.'
            : 'Email / user ID not registered as an authorized family member.',
        configuredAllowlist: allConfiguredEmails,
      });
    }

    return false;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const diag: AuthDiagnosticInfo = {
      checkedEmail: email || null,
      userId,
      matchedVia: 'none',
      dbTableStatus: 'error',
      dbErrorMessage: errorMsg,
      allowedEmailsConfigured: allConfiguredEmails,
    };
    setDiag?.(diag);
    if (import.meta.env.DEV) {
      console.warn('[Auth Diagnostics] Unexpected error checking family membership:', err);
    }
    return false;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [familyStatus, setFamilyStatus] = useState<FamilyAuthStatus>('loading');
  const [diagnosticInfo, setDiagnosticInfo] = useState<AuthDiagnosticInfo | null>(null);

  const deriveFamilyStatus = useCallback(async (currentUser: User | null): Promise<FamilyAuthStatus> => {
    if (!currentUser) {
      setFamilyStatus('unauthenticated');
      setDiagnosticInfo(null);
      return 'unauthenticated';
    }
    const isMember = await checkFamilyMembership(currentUser, setDiagnosticInfo);
    const status: FamilyAuthStatus = isMember ? 'authorized' : 'unauthorized';
    setFamilyStatus(status);
    return status;
  }, []);

  const refreshFamilyStatus = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    await deriveFamilyStatus(data.user ?? null);
  }, [deriveFamilyStatus]);

  useEffect(() => {
    // Hydrate session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      deriveFamilyStatus(data.session?.user ?? null);
    });

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);
      deriveFamilyStatus(newUser);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [deriveFamilyStatus]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthError | null> => {
      setFamilyStatus('loading');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setFamilyStatus('unauthenticated');
        return error;
      }
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await deriveFamilyStatus(data.user);
      }
      return null;
    },
    [deriveFamilyStatus]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setFamilyStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user, familyStatus, diagnosticInfo, signIn, signOut, refreshFamilyStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
