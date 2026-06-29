import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// All auth flows use httpOnly cookies set by the backend (set-cookie on /auth/login).
// We never persist JWT tokens in localStorage to avoid XSS exfiltration.
export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});
