import axios from "axios";

const baseURL = process.env.NODE_ENV === 'development' 
  ? process.env.NEXT_PUBLIC_API_BASE_URL_LOCAL 
  : process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://sys-activity-api.vercel.app",
});
