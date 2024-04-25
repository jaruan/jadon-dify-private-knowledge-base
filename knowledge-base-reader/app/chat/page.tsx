"use client";

import React, { useState } from "react";
import ChatClient from "@/lib/dify/ChatClient";

const initMessages = ["Hello", "How are you?"];
const chatClient = ChatClient.getInstance();

const Chat = () => {
  const [messages, setMessages] = useState(initMessages);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      setInputMessage("");
      await chatClient.createChatMessage(
        inputMessage,
        "userId",
        (answer: string) => {
          console.log(answer);
          setMessages([...messages, answer]);
        }
      );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <div className="flex px-4 py-2 bg-gray-200">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 mr-2 bg-white rounded-lg"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
