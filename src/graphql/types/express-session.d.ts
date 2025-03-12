// src/types/express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number; // Add userId to the session type
    sessionId?: string; // Add sessionId to the session type
  }
}
