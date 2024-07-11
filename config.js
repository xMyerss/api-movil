import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST || "3.223.118.103";
export const DB_USER = process.env.DB_USER || "josafat";
export const DB_PASSWORD = process.env.DB_PASSWORD || "josafat020";
export const DB_DATABASE = process.env.DB_DATABASE || "movil";
export const DB_PORT = process.env.DB_PORT || 3306;
export const API_HOST = process.env.API_HOST || "localhost:3306";