import axios from "axios";
import config from "./config";

const api = axios.create({
  baseURL: config.API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
