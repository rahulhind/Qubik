import React, { FormEvent, useState, useEffect, useRef } from "react";
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
  "Authorization": "Bearer hf_OtHdbounXlhdWExFXQALdltPbvbTwGPsjky"
};

export const ChatPanel = ({ messages, userId, onMessageSend }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lastReceivedMessage, setLastReceivedMessage] = useState<string>("");
  const [processedMessages, setProcessedMessages] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const checkMessages = async () => {
      try {
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
      } catch (error) {
        console.error("Error checking messages:", error);
        setProcessedMessages(messages.map(() => "An error occurred while checking the message"));
      }
    };

    checkMessages();
  }, [messages]);

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

  async function toxicity(data) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/s-nlp/roberta_toxicity_classifier",
        {
          headers: { Authorization: "Bearer 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" },
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error in toxicity function:", error);
      throw error;  // rethrow the error to be caught in the caller function
    }
  }

  const checkToxicity = async (messageFromUser: string): Promise<string> => {
    try {
      const response = await toxicity({ "inputs": messageFromUser });
      const scores = response[0];
      const toxicLabel = scores.find(score => score.label === "toxic");

      if (toxicLabel && toxicLabel.score > 0.5) {
        return "This message cannot be displayed";
      } else {
        return messageFromUser;
      }
    } catch (error) {
      console.error("Error checking toxicity:", error);
      return "An error occurred while checking the message";
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      const messageToProcess = lastReceivedMessage || "Give a beautiful pickup line to start a conversation.";
      const apiResponse = await queryAPI(messageToProcess);
      if (apiResponse && apiResponse[0]?.generated_text) {
        const generatedText = apiResponse[0].generated_text;
        const suggestions = parseResponse(generatedText);
        setSuggestions(suggestions);
      } else {
        console.error('No generated text found in API response');
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
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
      className="flex flex-col w-full md:w-1/3 bg-white dark:bg-gray-800 p-4"
      style={{
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

      <div ref={chatContainerRef} className="flex-grow overflow-y-auto">
        {processedMessages.map((message, idx) => (
          <div
            key={idx}
            style={{
              margin: "5px 0",
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: "#2b2b2b",
            }}
          >
            <strong>{convertToYouThem(messages[idx])}:</strong> {message}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex border-t border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 fixed bottom-0 w-full md:static"
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
          className="flex-grow border border-gray-300 dark:border-gray-600 p-2 rounded-l bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="Type a message..."
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
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
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
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
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
