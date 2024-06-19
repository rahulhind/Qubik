import React, { FormEvent, useState, useEffect, useCallback } from "react";
import axios from "axios";

export type TMessage = {
  userId: string;
  message?: string;
};

type ChatPanelProps = {
  messages: TMessage[];
  userId: string;
  onMessageSend: (message: string) => void;
};

const API_URL = "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct";
const headers = {
  "Authorization": "Bearer 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"
};

export const ChatPanel = ({ messages, userId, onMessageSend }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastReceivedMessage, setLastReceivedMessage] = useState<string>("");
  const [processedMessages, setProcessedMessages] = useState<string[]>([]);

  const toxicity = async (data: { inputs: string }) => {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/s-nlp/roberta_toxicity_classifier",
      {
        headers: {
          Authorization:"Bearer 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",
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(data)
      }
    );
    const result = await response.json();
    return result;
  };

  const checkToxicity = useCallback(async (messageFromUser: string): Promise<string> => {
    try {
      const response = await toxicity({ "inputs": messageFromUser });
      const scores = response[0];
      const toxicLabel = scores.find((score: { label: string, score: number }) => score.label === "toxic");

      if (toxicLabel && toxicLabel.score > 0.5) {
        return "This message cannot be displayed";
      } else {
        return messageFromUser;
      }
    } catch (error) {
      console.error("Error checking toxicity:", error);
      return "An error occurred while checking the message";
    }
  }, []);

  useEffect(() => {
    const checkMessages = async () => {
      const checkedMessages = await Promise.all(
        messages.map(async (message) => {
          if (message.message) {
            return await checkToxicity(message.message);
          } else {
            return "This message is undefined";
          }
        })
      );
      setProcessedMessages(checkedMessages);
    };

    checkMessages();
  }, [messages, checkToxicity]);

  useEffect(() => {
    const lastMessage = messages.filter(message => message.userId !== userId).pop();
    if (lastMessage) {
      setLastReceivedMessage(lastMessage.message || "");
    }
  }, [messages, userId]);

  const queryAPI = async (input: string) => {
    try {
      const payload = { inputs: `User received the message: "${input}". Suggest five responses.` };
      const res = await axios.post(API_URL, payload, { headers });
      return res.data;
    } catch (error) {
      console.error('Error querying the API:', error);
      return null;
    }
  };

  const parseResponse = (responseText: string) => {
    const regex = /(?<=\d\.\s)"(.*?)"/g;
    const matches = responseText.match(regex);
    return matches ? matches.map(match => match.replace(/"/g, "")) : [];
  };

  const handleGenerateSuggestions = async () => {
    const messageToProcess = lastReceivedMessage || "Give a beautiful pickup line to start a conversation.";
    const apiResponse = await queryAPI(messageToProcess);
    if (apiResponse && apiResponse[0]?.generated_text) {
      const generatedText = apiResponse[0].generated_text;
      const suggestions = parseResponse(generatedText);
      setSuggestions(suggestions);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onMessageSend(input.trim());
      setInput("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onMessageSend(suggestion);
    setSuggestions([]);
  };

  const convertToYouThem = (message: TMessage) => {
    return message.userId === userId ? "You" : "Them";
  };

  return (
    <div
      className="chat-panel"
      style={{
        backgroundColor: "#1c1c1c",
        padding: "20px",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "100%", 
        maxWidth: "600px", 
        margin: "0 auto", 
      }}
    >
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#2b2b2b",
          }}
        >
          <strong>Suggestions:</strong>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  cursor: "pointer",
                  padding: "5px",
                  borderBottom: idx !== suggestions.length - 1 ? "1px solid #444" : "none",
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
  
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          flex: 1,
          overflowY: "auto",
        }}
      >
         {processedMessages.map((message, idx) => (
        <li
          key={idx}
          style={{
            margin: "5px 0",
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "#2b2b2b",
          }}
        >
          <strong>{convertToYouThem(messages[idx])}:</strong> {message}
        </li>
      ))}
      </ul>
  
      <form
        onSubmit={handleSubmit}
        style={{
          flex: "0 0 auto",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            backgroundColor: "#2b2b2b",
            color: "#ffffff",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#28a745",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
        <button
          type="button"
          onClick={handleGenerateSuggestions}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Generate
        </button>
      </form>
    </div>
  );
};
