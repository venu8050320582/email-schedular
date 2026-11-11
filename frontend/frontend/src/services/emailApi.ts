import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export const getEmails = async () => {
  const response = await API.get("/api/emails");
  return response.data;
};

export const getEmailStats = async () => {
  const response = await API.get("/api/emails/stats");
  return response.data;
};

export const createEmail = async (email: {
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
}) => {
  const response = await API.post("/api/emails", email);
  return response.data;
};

export const cancelEmail = async (id: number) => {
  const response = await API.patch(`/api/emails/${id}/cancel`);
  return response.data;
};

export const deleteEmail = async (id: number) => {
  const response = await API.delete(`/api/emails/${id}`);
  return response.data;
};