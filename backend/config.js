import dotenv from "dotenv";
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/libraryDB";
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || "8b3ad07191dec7d690b18097eea25a7241f7cc861eed23251791ca6e34cfbb1e";
export const NODE_ENV = process.env.NODE_ENV || "development";
