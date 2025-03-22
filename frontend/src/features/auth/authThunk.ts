import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    { email, password }: { email: string; password: string },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
      });

      console.log("SIGNUP : ", res.data);
      if (res.status !== 200) {
        return thunkAPI.rejectWithValue(res.data.message);
      }

      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        return thunkAPI.rejectWithValue(
          e.response?.data?.message || "An error occurred"
        );
      } else if (e instanceof Error) {
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
      const res = await axios.post(
        `${API_URL}/api/auth/signin`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("SIGNUP : ", res.data);
      if (res.status !== 200) {
        return thunkAPI.rejectWithValue(res.data.message);
      }

      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        return thunkAPI.rejectWithValue(
          e.response?.data?.message || "An error occurred"
        );
      } else if (e instanceof Error) {
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
      const res = await axios.get(`${API_URL}/api/auth/check`, {
        withCredentials: true,
      });
      console.log(res);

      if (res.status !== 200) {
        return thunkAPI.rejectWithValue(res.data.message);
      }
      
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e)) {
        return thunkAPI.rejectWithValue(
          e.response?.data?.message || "An error occurred"
        );
      } else if (e instanceof Error) {
        return thunkAPI.rejectWithValue(e.message);
      } else {
        return thunkAPI.rejectWithValue("An unknown error occurred");
      }
    }
  }
);

export const signout = createAsyncThunk("auth/signout", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${API_URL}/api/auth/signout`, {
      withCredentials: true,
    });

    console.log("SIGNOUT : ", res.data);
    if (res.status !== 200) {
      return thunkAPI.rejectWithValue(res.data.message);
    }

    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      return thunkAPI.rejectWithValue(
        e.response?.data?.message || "An error occurred"
      );
    } else if (e instanceof Error) {
      return thunkAPI.rejectWithValue(e.message);
    } else {
      return thunkAPI.rejectWithValue("An unknown error occurred");
    }
  }
});
