import {createContext,useContext,useState,useEffect,ReactNode,} from "react";
import {signIn,signOut,getCurrentUser,updateUserAttributes,fetchAuthSession,signUp,fetchUserAttributes,} from "@aws-amplify/auth";
import "@/awsConfig";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  accentColor: string;
  loading: boolean;
  setAccentColor: (color: string) => void;
  useMetric: boolean;
  setUseMetric: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accentColor, setAccentColorState] = useState("#ff6b35");
  const [loading, setLoading] = useState<boolean>(true);
  const [useMetric, setUseMetricState] = useState(true);
  const settings_url = import.meta.env.VITE_SETTINGS_API;

  // -----------------------------
  // Load stored preferences
  // -----------------------------
  useEffect(() => {
    // Try fetching the logged-in user from Cognito
    (async () => {
      try {
        const cognitoUser = await getCurrentUser();
        const userAttributes = await fetchUserAttributes();
        if (cognitoUser) {
          setUser({
            id: cognitoUser.userId,
            email: cognitoUser.signInDetails?.loginId || "",
            name: userAttributes.name,
            // name: "Yash",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cognitoUser.username}`,
          });
        }
      } catch {
        // no user signed in
      }
    })();
    setLoading(false);
  }, []);

  useEffect(()=>{
    if(user?.id)
      getSettings();
  },[user])

  // -----------------------------
  // Accent and Unit helpers
  // -----------------------------
  const applyAccentColor = (color: string) => {
    const hsl = hexToHSL(color);
    document.documentElement.style.setProperty("--accent", hsl);
  };

  const hexToHSL = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "25 95% 53%";

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
      l * 100
    )}%`;
  };

  const setAccentColor = async (color: string) => {
    setAccentColorState(color);
    await fetch(`${settings_url}/userSettings`,{ method: 'POST', body: JSON.stringify({accentColor: color,unit: useMetric ? "metric" : "imperial", userId: user.id})});
    applyAccentColor(color);
  };

  const getSettings = async() =>{
    const settings = await fetch(`${settings_url}/getSettings?userId=${user?.id}`).then(res => res.json());
    if(settings.accentColor){
      setAccentColorState(settings.accentColor);
      applyAccentColor(settings.accentColor);
    }
    if(settings.unit)
      setUseMetricState(settings.unit === "metric");
  }

  const setUseMetric = async (value: boolean) => {
    setUseMetricState(value);
    await fetch(`${settings_url}/userSettings`,{ method: 'POST', body: JSON.stringify({unit: value ? "metric" : "imperial",accentColor: accentColor, userId: user.id})});
  };

  const login = async (email: string, password: string) => {
    try {
      await signIn({ username: email, password});

      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      const userProfile: User = {
        id: currentUser.userId,
        email: email,
        name: userAttributes.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
      };

      setUser(userProfile);
      // localStorage.setItem("ridemate_user", JSON.stringify(userProfile));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
        },
      },
    });
  };

  const logout = async () => {
    try {
      await signOut({ global: true });
      setUser(null);
      localStorage.removeItem("ridemate_user");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const attributes: Record<string, string> = {};
      if (updates.name) attributes.name = updates.name;
      if (updates.email) attributes.email = updates.email;

      await updateUserAttributes({ userAttributes: attributes });

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // localStorage.setItem("ridemate_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        accentColor,
        loading,
        setAccentColor,
        useMetric,
        setUseMetric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
