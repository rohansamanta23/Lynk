import API from "./axios.js";

const registerUser = async (formData) => {
  console.log(formData);
  try {
    const response = await API.post("/auth/register", formData);
    return response.data;
  } catch (error) {
    // Normalize error before throwing
    if (error.response) {
      // Server responded with 4xx/5xx
      throw new Error(error.response.data?.message || "Request failed");
    } else if (error.request) {
      // No response (server down, CORS, timeout)
      throw new Error("Server not reachable. Please try again later.");
    } else {
      // Something else in frontend
      throw new Error("Unexpected error occurred.");
    }
  }
};

const loginUser = async (formData) => {
  console.log(formData);
  try {
    const response = await API.post("/auth/login", formData);
    return response.data;
  } catch (error) {
    // Normalize error before throwing
    if (error.response) {
      // Server responded with 4xx/5xx
      throw new Error(error.response.data?.message || "Request failed");
    } else if (error.request) {
      // No response (server down, CORS, timeout)
      throw new Error("Server not reachable. Please try again later.");
    } else {
      // Something else in frontend
      throw new Error("Unexpected error occurred.");
    }
  }
};

const refreshUser = async () => {
  try {
    const response = await API.post("/auth/refresh");
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Request failed");
    } else if (error.request) {
      throw new Error("Server not reachable. Please try again later.");
    } else {
      throw new Error("Unexpected error occurred.");
    }
  }
};

const getMe = async () => {
  try {
    const response = await API.get("/user/me");
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || "Request failed");
    } else if (error.request) {
      throw new Error("Server not reachable. Please try again later.");
    } else {
      throw new Error("Unexpected error occurred.");
    }
  }
};

export { registerUser, loginUser, refreshUser, getMe };
