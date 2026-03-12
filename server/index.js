import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import dotenv from "dotenv";
import { handleMessage, handleDisconnect } from "./roomManager.js";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Serve static files from `public/` directory
app.use(express.static("public"));

app.get("/sala/:code", (req, res) => {
  res.sendFile("rooms.html", { root: "public" });
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
