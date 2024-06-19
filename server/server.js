const WebSocket = require("ws");
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  const guestId = `Guest-${Math.floor(Math.random() * 10000)}`;

  ws.on("message", (message) => {
    const fullMessage = `${guestId}: ${message}`;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(fullMessage);
      }
    });
  });

  ws.send(`Welcome, ${guestId}!`);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running at http://localhost:${PORT}`);
});
