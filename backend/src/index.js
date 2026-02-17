import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { v4 as uuidv4 } from "uuid";
import { loadUsers, saveUsers } from "./usersStore.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/users", async (_req, res, next) => {
  try {
    const users = await loadUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.get("/api/users/:id", async (req, res, next) => {
  try {
    const users = await loadUsers();
    const user = users.find((u) => String(u._id) === String(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

app.post("/api/users", async (req, res, next) => {
  try {
    const { name, email, phone, role, status, jobTitle } = req.body ?? {};

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const users = await loadUsers();

    const now = new Date();
    const newUser = {
      _id: uuidv4(),
      name,
      email,
      phone: phone ?? "",
      role: role ?? "Staff",
      status: status ?? "Active",
      jobTitle: jobTitle ?? "",
      lastLogin: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    users.unshift(newUser);
    await saveUsers(users);

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

app.put("/api/users/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const patch = req.body ?? {};

    const users = await loadUsers();
    const idx = users.findIndex((u) => String(u._id) === id);
    if (idx === -1) return res.status(404).json({ error: "User not found" });

    const now = new Date();
    const updated = {
      ...users[idx],
      ...patch,
      _id: users[idx]._id,
      updatedAt: now.toISOString(),
    };

    users[idx] = updated;
    await saveUsers(users);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/users/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const users = await loadUsers();
    const nextUsers = users.filter((u) => String(u._id) !== id);

    if (nextUsers.length === users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    await saveUsers(nextUsers);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Basic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = Number(process.env.PORT || 5001);
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

