import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { markUserOffline } from "@/hooks/useOnlinePresence";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  userRole: string | null;
  userRoles: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isTaskGiver: boolean;
  isTaskDoer: boolean;
  hasBothRoles: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const [profileResult, rolesResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }
      if (rolesResult.data) {
        const roles = rolesResult.data.map(r => r.role);
        setUserRoles(roles);
        // Set primary role: admin > task_doer > task_giver
        const adminRole = roles.find(r => r === 'admin');
        const taskDoerRole = roles.find(r => r === 'task_doer');
        const taskGiverRole = roles.find(r => r === 'task_giver');
        setUserRole(adminRole || taskDoerRole || taskGiverRole || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await markUserOffline(user?.id);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole(null);
    setUserRoles([]);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
          setUserRoles([]);
        }

        if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Computed role flags
  const isTaskGiver = userRoles.includes('task_giver');
  const isTaskDoer = userRoles.includes('task_doer');
  const hasBothRoles = isTaskGiver && isTaskDoer;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userRole,
        userRoles,
        isLoading,
        isAuthenticated: !!user,
        isTaskGiver,
        isTaskDoer,
        hasBothRoles,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
