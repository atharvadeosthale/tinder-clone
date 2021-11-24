import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { View, Text } from "react-native";
import * as Google from "expo-google-app-auth";
import {
  GoogleAuthProvider,
  signInWithCredential,
  onAuthStateChanged,
  signOut,
} from "@firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext({});

const config = {
  iosClientId:
    "979951250205-8lp2mat4b7oar3ospa22ka3ucq7c042c.apps.googleusercontent.com",
  androidClientId:
    "979951250205-a4d16qql5rqt5cse4e3do1khtb90sh3v.apps.googleusercontent.com",
  scope: ["profile", "email"],
  permissions: ["public_profile", "email", "gender", "location"],
};

export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log(user);
          setUser(user);
        } else {
          setUser(null);
        }
        setLoadingInitial(false);
      }),

    []
  );

  const logout = () => {
    setLoading(true);
    signOut(auth)
      .catch((err) => {
        setError(err);
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await Google.logInAsync(config)
      .then(async (loginResult) => {
        if (loginResult.type === "success") {
          // login
          const { idToken, accessToken } = loginResult;
          const credential = GoogleAuthProvider.credential(
            idToken,
            accessToken
          );
          await signInWithCredential(auth, credential);
        }

        return Promise.reject();
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  const memoedvalue = useMemo(() => ({
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
  }));

  return (
    <AuthContext.Provider value={memoedvalue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
