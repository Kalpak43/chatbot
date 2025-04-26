import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "../../firebase";
import { FirebaseError } from "firebase/app";

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      return user;
    } catch (e) {
      if (e instanceof Error || e instanceof FirebaseError) {
        return thunkAPI.rejectWithValue(e.message);
      } else {
        return thunkAPI.rejectWithValue("An unknown error occurred");
      }
    }
  }
);

export const signin = createAsyncThunk(
  "auth/signin",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      return user;
    } catch (e) {
      if (e instanceof Error || e instanceof FirebaseError) {
        return thunkAPI.rejectWithValue(e.message);
      } else {
        return thunkAPI.rejectWithValue("An unknown error occurred");
      }
    }
  }
);

export const checkLogin = createAsyncThunk(
  "auth/checkLogin",
  async (_, thunkAPI) => {
    try {
      const user = await new Promise<User | null>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          if (user) resolve(user);
          else reject(new Error("User not logged in"));
        });
      });

      return user;
    } catch (e) {
      if (e instanceof Error || e instanceof FirebaseError) {
        return thunkAPI.rejectWithValue(e.message);
      } else {
        return thunkAPI.rejectWithValue("An unknown error occurred");
      }
    }
  }
);

export const signout = createAsyncThunk("auth/signout", async (_, thunkAPI) => {
  try {
    await signOut(auth);
  } catch (e) {
    if (e instanceof Error || e instanceof FirebaseError) {
      return thunkAPI.rejectWithValue(e.message);
    } else {
      return thunkAPI.rejectWithValue("An unknown error occurred");
    }
  }
});

export const signinWithGoogle = createAsyncThunk(
  "auth/signinWithGoogle",
  async (_, thunkAPI) => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);

      return res.user;
    } catch (e) {
      if (e instanceof Error || e instanceof FirebaseError) {
        return thunkAPI.rejectWithValue(e.message);
      } else {
        return thunkAPI.rejectWithValue("An unknown error occurred");
      }
    }
  }
);
