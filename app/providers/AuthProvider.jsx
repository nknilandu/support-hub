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
  const [loading, setLoading] = useState(true);

  //google singin
  const googleSignIn = () => {
    return signInWithPopup(auth, provider);
  };

  // create user
  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // login user
  const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // reset password
  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // log out user
  const logOut = () => {
    return signOut(auth);
  };

  // update user
  const updateUserProfile = (profileData) => {
    return updateProfile(auth.currentUser, profileData);
  };

  // observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // check user role
  const fetchUserRole = async (firebaseUser = user) => {
    try {
      if (!firebaseUser) {
        return null;
      }

      const token = await firebaseUser.getIdToken(true);
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
  };

  const authData = {
    googleSignIn,
    createUser,
    loginUser,
    forgotPassword,
    logOut,
    user,
    setUser,
    loading,
    updateUserProfile,
    fetchUserRole,
  };

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
