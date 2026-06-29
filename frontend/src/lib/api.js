import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const setAuthHeader = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("noir_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("noir_token");
  }
};

// Restore on load
const stored = typeof window !== "undefined" ? localStorage.getItem("noir_token") : null;
if (stored) {
  api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
}
