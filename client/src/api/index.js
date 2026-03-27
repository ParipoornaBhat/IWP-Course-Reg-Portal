import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("scr_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => api.post("/auth/login", data);
export const signup = (data) => api.post("/auth/signup", data);

// Courses
export const getCourses = () => api.get("/courses");
export const createCourse = (data) => api.post("/courses", data);

// Registration
export const registerCourses = (data) => api.post("/register", data);
export const getMyRegistrations = () => api.get("/register/me");

export default api;
