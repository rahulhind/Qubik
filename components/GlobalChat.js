import React, { useState, useEffect, useRef } from "react";

function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => ws.current.close();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    ws.current.send(input);
    setInput("");
  };

  return (
    <div>
      <h1>Global Anonymous Chat Room</h1>
      <div
        style={{
          height: "300px",
          border: "1px solid #ccc",
          padding: "10px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "5px", padding: "5px", backgroundColor: "#f3f3f3", color:"black" }}>
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;
