import { createContext, useCallback, useEffect, useState } from "react";
import { app } from "../../firebase/firebase.config";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

export const AuthContext = createContext();
const provider = new GoogleAuthProvider();
const auth = getAuth(app);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userVersion, setUserVersion] = useState(0);
  const [loading, setLoading] = useState(true);

  // Force React consumers to re-read updated auth.currentUser properties
  const syncAuthUser = useCallback(() => {
    setUser(auth.currentUser || null);
    setUserVersion((v) => v + 1);
    return auth.currentUser || null;
  }, []);

  // Google Sign-In
  const googleSignIn = () => {
    return signInWithPopup(auth, provider);
  };

  // Create user
  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login user
  const loginUser = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    syncAuthUser();
    return credential;
  };

  // Reset password
  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Log out user
  const logOut = () => {
    return signOut(auth);
  };

  // Update user profile in Firebase & immediately trigger UI refresh
  const updateUserProfile = async (profileData) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const cleanProfile = {};
    if (profileData.displayName !== undefined) {
      cleanProfile.displayName = profileData.displayName;
    }
    if (profileData.photoURL !== undefined) {
      cleanProfile.photoURL = profileData.photoURL;
    }

    await updateProfile(currentUser, cleanProfile);
    await currentUser.reload();
    return syncAuthUser();
  };

  // Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setUserVersion((v) => v + 1);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check user role
  const fetchUserRole = useCallback(async (firebaseUser) => {
    try {
      const targetUser = firebaseUser || auth.currentUser;
      if (!targetUser) {
        return null;
      }

      const token = await targetUser.getIdToken(true);
      const res = await fetch("http://localhost:3021/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        return null;
      }
      return data?.user?.role || null;
    } catch (error) {
      console.log("fetchUserRole error:", error);
      return null;
    }
  }, []);

  const authData = {
    googleSignIn,
    createUser,
    loginUser,
    forgotPassword,
    logOut,
    user,
    userVersion,
    setUser,
    syncAuthUser,
    loading,
    updateUserProfile,
    fetchUserRole,
  };

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;