import { drizzle } from "drizzle-orm/sqlite3";
import sqlite3 from "sqlite3";
import { env } from "../config/env.js";

const sqlite = new sqlite3.Database(env.DATABASE_URL);

export const db = drizzle(sqlite);
