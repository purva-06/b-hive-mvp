import axios from "axios";

import {
  getStoredToken,
  removeStoredToken,
} from "../utils/authStorage.js";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:8000/api",

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      removeStoredToken();

      window.dispatchEvent(
        new CustomEvent("b-hive:unauthorized")
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;