import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2), "utf8");
  }
}

export async function loadUsers() {
  await ensureDataFile();
  const raw = await fs.readFile(USERS_FILE, "utf8");
  const parsed = JSON.parse(raw || "[]");
  return Array.isArray(parsed) ? parsed : [];
}

export async function saveUsers(users) {
  await ensureDataFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

