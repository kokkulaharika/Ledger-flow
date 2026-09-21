import axios from "axios";

// Create one Axios instance for communicating with
// the LedgerFlow backend.
const api = axios.create({
  // Your Express backend base URL.
  baseURL: "http://localhost:5000/api",

  // Tell the backend that we are sending JSON data.
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;