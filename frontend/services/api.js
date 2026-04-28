import axios from "axios";

const API_TIMEOUT_MS = 15000;

/**
 * Puedes sobreescribir la URL con:
 * EXPO_PUBLIC_API_URL=http://TU_IP/api
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim() || "https://passguardian.duckdns.org/api";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token || null;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

const normalizeError = (error) => {
  if (error.code === "ECONNABORTED") {
    return new Error("Tiempo de espera agotado al consultar la API.");
  }

    if (error.response) {
      const responseData = error.response.data;
      let message = `HTTP ${error.response.status}`;
      
      if (typeof responseData === "object") {
        if (responseData?.detail) {
          message = responseData.detail;
        } else {
          // If it's a validation error object from Django (e.g., {"website_url": ["Enter a valid URL."]})
          message = Object.values(responseData).flat().join(" ");
        }
      }
      
      const normalized = new Error(message);
      normalized.status = error.response.status;
      normalized.data = responseData;
      return normalized;
    }

  return error;
};

const request = async (method, endpoint, body = null, options = {}) => {
  try {
    const response = await apiClient.request({
      method,
      url: endpoint,
      data: body,
      ...options,
    });
    return response.data;
  } catch (error) {
    throw normalizeError(error);
  }
};

export const api = {
  get: (endpoint, options = {}) => request("GET", endpoint, null, options),
  post: (endpoint, body, options = {}) => request("POST", endpoint, body, options),
  put: (endpoint, body, options = {}) => request("PUT", endpoint, body, options),
  patch: (endpoint, body, options = {}) => request("PATCH", endpoint, body, options),
  del: (endpoint, options = {}) => request("DELETE", endpoint, null, options),
};

export default api;
