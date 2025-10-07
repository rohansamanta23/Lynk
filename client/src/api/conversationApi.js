import API from "./axios.js";

export const getConversations = async () => {
  const res = await API.get("/conversations/");
  return res.data.data;
}

export const getConversationById = async (id) => {
  const res = await API.get(`/conversations/${id}`);
  return res.data.data;
}