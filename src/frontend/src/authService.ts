import { VerifyPasswordResponse, Provider } from "./types";
import { API_BASE_URL } from "./constants";

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const DEFAULT_USER_EMAIL = import.meta.env.VITE_DEFAULT_USER_EMAIL;
const DEFAULT_USER_PASSWORD = import.meta.env.VITE_DEFAULT_USER_PASSWORD;

export const autoLoginDefaultUser = async (
  setIdToken: (token: string | null) => void,
  setSelectedProvider: (provider: Provider) => void
) => {
  if (!DEFAULT_USER_EMAIL || !DEFAULT_USER_PASSWORD || !API_KEY) {
    console.warn("Missing environment variables for auto-login");
    return null;
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: DEFAULT_USER_EMAIL,
          password: DEFAULT_USER_PASSWORD,
          returnSecureToken: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data: VerifyPasswordResponse = await response.json();

    setIdToken(data.idToken);

    // Fetch provider profile
    try {
      const profileResponse = await fetch(
        `${API_BASE_URL}/api/providers/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (profileResponse.ok) {
        const providerProfile = await profileResponse.json();

        setSelectedProvider(providerProfile);

        return {
          ...data,
          providerProfile,
        };
      } else {
        console.warn(
          "Failed to fetch provider profile:",
          profileResponse.status
        );
        return data;
      }
    } catch (profileError) {
      console.warn("Error fetching provider profile:", profileError);
      return data;
    }
  } catch (error) {
    console.error("Auto-login failed:", error);
    return null;
  }
};
