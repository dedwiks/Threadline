export const PORT = process.env.PORT || 5001;
export const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173").trim();
export const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").trim();
export const MONGODB_URI = process.env.MONGODB_URI;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
export const SESSION_SECRET = process.env.SESSION_SECRET;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
