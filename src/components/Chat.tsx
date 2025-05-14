import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../context/GameContext';
import { Send } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  playerName: string;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, playerName }) => {
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-700 p-3">
        <h3 className="text-lg font-semibold">Game Chat</h3>
      </div>
      
      {/* Messages container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center italic">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`max-w-[80%] ${msg.sender === playerName 
                ? 'ml-auto bg-blue-700 rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                : msg.sender === 'System'
                  ? 'mx-auto bg-gray-700 rounded-lg italic text-gray-300'
                  : 'mr-auto bg-gray-700 rounded-tl-lg rounded-tr-lg rounded-br-lg'
              } p-2 break-words`}
            >
              {msg.sender !== 'System' && msg.sender !== playerName && (
                <p className="text-xs text-gray-300 font-semibold">{msg.sender}</p>
              )}
              <p>{msg.text}</p>
              <p className="text-xs text-gray-300 text-right mt-1">
                {formatTimestamp(msg.timestamp)}
              </p>
            </div>
          ))
        )}
      </div>
      
      {/* Input form */}
      <form 
        onSubmit={handleSubmit} 
        className="p-3 border-t border-gray-700 flex"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="bg-blue-700 hover:bg-blue-600 rounded-r-md px-3 py-2 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;