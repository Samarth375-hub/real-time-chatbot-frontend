import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket", "polling"] }); // Ensure CORS compatibility

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on("bot_response", (data) => {
      setMessages((prev) => [...prev, { text: data.message, sender: "bot" }]);
      setIsTyping(false);
    });

    socket.on("bot_typing", () => {
      setIsTyping(true);
    });

    return () => {
      socket.off("bot_response");
      socket.off("bot_typing");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === "") return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setIsTyping(true);
    socket.emit("user_message", { message: input });
    setInput("");
  };

  return (
    <div className="chat-container">
      <h2>Chatbot</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Bot is typing...</div>}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
