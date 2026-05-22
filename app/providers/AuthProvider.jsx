import { createContext, useEffect, useState } from "react";
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
  const [userRole, setUserRole] = useState(null);

  //google singin
  const googleSignIn = () => {
    return signInWithPopup(auth, provider)
  }

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
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  // check user role
   useEffect(() => {
      if (user) {
        fetch(`http://localhost:3021/users/role?email=${user.email}`, {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          }
        })
          .then((res) => res.json())
          .then((data) => {
            setUserRole(data.role || null);
          });
      }
    }, [user]);

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
    userRole,
    setUserRole

  };

  return <AuthContext value={authData}>{children}</AuthContext>;
};

export default AuthProvider;
