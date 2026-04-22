import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import dotenv from "dotenv";
import { handleMessage, handleDisconnect } from "./roomManager.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Resolve absolute public directory and log static asset requests
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
app.use((req, res, next) => {
  // only log requests for common static asset types to avoid noise
  if (req.url.match(/\.(css|js|html|png|jpg|svg|json)$/i)) {
    console.log(`[static] ${req.method} ${req.url}`);
  }
  next();
});
app.use(express.static(publicDir));

app.get("/sala/:code", (req, res) => {
  res.sendFile(path.join(publicDir, "rooms.html"));
});

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw);
      handleMessage(ws, message, wss);
    } catch (err) {
      console.error('Invalid message', err);
      ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid message format' } }));
    }
  });

  ws.on("close", () => {
    handleDisconnect(ws, wss);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    console.error("Stop the process using that port or change PORT in .env.");
    process.exit(1);
  }

  console.error("Server error:", err);
  process.exit(1);
});
