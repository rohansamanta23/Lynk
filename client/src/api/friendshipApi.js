import API from "./axios.js";

export const getFriendList = async () => {
  const res = await API.get("/friendship/list");
  return res.data.data;
};

export const getSentRequests = async () => {
  const res = await API.get("/friendship/sent");
  return res.data.data;
};

export const getReceivedRequests = async () => {
    const res = await API.get("/friendship/pending");
    return res.data.data;
};

export const getBlockList = async () => {
    const res = await API.get("/friendship/blocked");
    return res.data.data;
}

export const searchUsers = async (query) => {
  const res = await API.get(`/user/search?query=${encodeURIComponent(query)}`);
  return res.data.data;
};
