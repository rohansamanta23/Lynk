import API from "./axios.js";

export const getConversations = async () => {
  const res = await API.get("/conversations/");
  return res.data.data;
}