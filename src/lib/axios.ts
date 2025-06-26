import axios from "axios";

export const api = axios.create({
  baseURL: "https://sys-activity-api.vercel.app",
});
