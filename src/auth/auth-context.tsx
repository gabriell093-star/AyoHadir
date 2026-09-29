import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { AppState } from "react-native";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

export type AuthProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  refreshProfile: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateAvatarUrl: (avatarUrl: string | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);

        if (!data.session) {
          setProfile(null);
        }
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
        setLoading(false);

        if (_event === "PASSWORD_RECOVERY") {
          setPasswordRecovery(true);
        }

        if (!nextSession) {
          setProfile(null);
          setPasswordRecovery(false);
        }
      }
    });

    supabase.auth.startAutoRefresh();

    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          supabase.auth.startAutoRefresh();
        } else {
          supabase.auth.stopAutoRefresh();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      appStateSubscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!session?.user.id) {
      return () => {
        mounted = false;
      };
    }

    void loadProfile(session.user.id)
      .then((nextProfile) => {
        if (mounted) {
          setProfile(nextProfile);
        }
      })
      .catch(() => {
        if (mounted) {
          setProfile(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      passwordRecovery,
      clearPasswordRecovery: () => setPasswordRecovery(false),
      refreshProfile: async () => {
        if (!session?.user.id) {
          setProfile(null);
          return;
        }

        setProfile(await loadProfile(session.user.id));
      },
      updateDisplayName: async (displayName) => {
        if (!session?.user.id) {
          throw new Error("Sesi pengguna tidak tersedia.");
        }

        const cleanedName = displayName.trim();

        if (!cleanedName) {
          throw new Error("Nama tidak boleh kosong.");
        }
        if (cleanedName.length > 80) {
          throw new Error("Nama maksimal 80 karakter.");
        }

        const { data, error } = await supabase
          .from("profiles")
          .update({
            display_name: cleanedName,
            updated_at: new Date().toISOString()
          })
          .eq("id", session.user.id)
          .select("display_name, avatar_url")
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Profil pengguna tidak ditemukan atau tidak dapat diperbarui.");
        }

        setProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url
        });
      },
      updateAvatarUrl: async (avatarUrl) => {
        if (!session?.user.id) {
          throw new Error("Sesi pengguna tidak tersedia.");
        }

        const { data, error } = await supabase
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq("id", session.user.id)
          .select("display_name, avatar_url")
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Profil pengguna tidak ditemukan atau tidak dapat diperbarui.");
        }

        setProfile({
          display_name: data.display_name,
          avatar_url: data.avatar_url
        });
      }
    }),
    [loading, profile, session]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return value;
}
