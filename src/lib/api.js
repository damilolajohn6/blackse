import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER
  ? `${process.env.NEXT_PUBLIC_SERVER}`
  : "http://localhost:8000/api/v2";

const api = axios.create({
  baseURL: `${API_BASE_URL}/instructor`,
  withCredentials: true,
});

export default api;
