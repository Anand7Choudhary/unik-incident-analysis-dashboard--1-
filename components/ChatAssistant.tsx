import React, { useState, useRef, useEffect } from 'react';
import { ProcessedIncident, StructuredResponse } from '../types';
import { getChatResponseForInsights } from '../services/geminiService';
import { SendIcon, AiIcon, RefreshIcon } from './Icons';
import StructuredResponseOutput from './output/StructuredResponseOutput';

interface ChatAssistantProps {
  incidents: ProcessedIncident[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string | StructuredResponse;
  id: string;
}

const CHAT_HISTORY_KEY = 'unik-chat-history';

const initialMessageContent: StructuredResponse = {
  responseType: 'text',
  title: "Hello! I'm your UniK data assistant.",
  summary: "Ask me anything about the current data set.",
  data: { text: "You can ask for summaries, trends, or specific statistics." }
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({ incidents }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages.map(msg => ({...msg, role: msg.role === 'model' ? 'assistant' : msg.role }));
        }
      }
    } catch (error) {
      console.error("Failed to parse chat history from localStorage", error);
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
    return [
      { 
        role: 'assistant', 
        id: `initial-${Date.now()}`,
        content: initialMessageContent
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState({ active: false, seconds: 60 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (cooldown.active) {
      timerRef.current = window.setInterval(() => {
        setCooldown(prev => {
          const newSeconds = prev.seconds - 1;
          if (newSeconds <= 0) {
            clearInterval(timerRef.current!);
            return { active: false, seconds: 60 }; // Reset
          }
          return { ...prev, seconds: newSeconds };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cooldown.active]);
  
  const handleSendMessage = async (e: React.FormEvent, messageText: string = input) => {
    e.preventDefault();
    if (!messageText.trim() || isLoading || cooldown.active) return;

    const userMessage: Message = { role: 'user', content: messageText, id: `user-${Date.now()}` };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setCooldown({ active: true, seconds: 60 });

    try {
        const historyForApi = updatedMessages.map(msg => ({ 
            role: msg.role, 
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }));

        const responseText = await getChatResponseForInsights(incidents, historyForApi);
        
        let structuredResponse: StructuredResponse;
        try {
            structuredResponse = JSON.parse(responseText);
        } catch (parseError) {
            structuredResponse = {
                responseType: 'text',
                title: "Response",
                summary: "Here is the raw response from the model.",
                data: { text: responseText }
            };
        }
        
        const modelMessage: Message = { role: 'assistant', content: structuredResponse, id: `model-${Date.now()}` };
        setMessages(prev => [...prev, modelMessage]);

    } catch (err: any) {
        const errorMessage: Message = { 
            role: 'assistant', 
            id: `error-${Date.now()}`,
            content: {
                responseType: 'text',
                title: "Error",
                summary: "An error occurred.",
                data: { text: "Sorry, I couldn't process that. Please check the connection or try again."}
            }
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleNewChat = () => {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    setMessages([{ 
        role: 'assistant', 
        id: `initial-${Date.now()}`,
        content: initialMessageContent
    }]);
  };

  const suggestedQuestions = [
      "Which team has the highest number of incidents?",
      "What is the distribution of incident categories? Show as a pie chart.",
      "Is there a correlation between team and incident seriousness score?",
      "Show me a monthly trend of 'Aggression' incidents as a line chart."
  ];

  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const progress = cooldown.seconds / 60;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col h-[75vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <AiIcon className="w-8 h-8 text-blue-500 flex-shrink-0 mt-2 animate-pulse-slow" />}
            <div className={`w-full max-w-2xl px-1 py-1 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
               <div className="bg-white rounded-xl p-4">
                {typeof msg.content === 'string' 
                    ? <pre className="font-sans whitespace-pre-wrap text-gray-800">{msg.content}</pre> 
                    : <StructuredResponseOutput response={msg.content} />
                }
               </div>
            </div>
          </div>
        ))}

        {isLoading && (
            <div className="flex items-start gap-3 justify-start">
                 <AiIcon className="w-8 h-8 text-blue-500 flex-shrink-0 animate-pulse-fast" />
                 <div className="w-full max-w-lg px-1 py-1 rounded-2xl bg-gray-200">
                     <div className="bg-white rounded-xl p-4 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2 delay-150"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                     </div>
                 </div>
            </div>
        )}
         <div ref={messagesEndRef} />
      </div>
      
      {!isLoading && messages.length <= 1 && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedQuestions.map(q => (
                <button 
                    key={q} 
                    onClick={(e) => { setInput(q); handleSendMessage(e, q); }}
                    className="text-left p-3 bg-white/50 hover:bg-white/90 border border-gray-200 rounded-lg text-sm text-gray-700 transition-all"
                >
                    {q}
                </button>
            ))}
        </div>
      )}

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center">
            <button
                type="button"
                onClick={handleNewChat}
                className="mr-3 bg-gray-200 text-gray-600 p-3 rounded-full hover:bg-gray-300 transition-colors flex-shrink-0"
                aria-label="New chat"
            >
                <RefreshIcon />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trends, summaries, or statistics..."
              className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
              disabled={isLoading}
            />
            <div className="cooldown-wrapper ml-3">
              {cooldown.active && (
                <svg className="cooldown-progress-ring" viewBox="0 0 46 46">
                   <circle
                        className="text-gray-200"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius} cx="23" cy="23"
                    />
                    <circle
                      className="cooldown-progress-ring__circle text-blue-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="transparent"
                      r={radius}
                      cx="23"
                      cy="23"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                </svg>
              )}
              <button
                type="submit"
                disabled={isLoading || cooldown.active || !input.trim()}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md disabled:shadow-none"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
        </form>
         {cooldown.active && (
          <p className="text-xs text-gray-500 text-center mt-2">
            API call limit resets in {cooldown.seconds}s
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatAssistant;