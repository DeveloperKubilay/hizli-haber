import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { BotMessageSquare } from 'lucide-react';
import { ai } from '../../services/firebase';

const AIChat = ({ news }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "**Selamlar!** 👋✨ Ben senin **haber buddy'n** 🤖💫\n\nBu haberle ilgili kafanda **soru işaretleri** mi var? 🤔💭\n\n*Sor gelsin!* 🔥💯",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Haber içeriğini prompta ekle
      let haberIcerik = news ? `\n\nHaber Başlığı: ${news.name || ''}\nHaber Özeti: ${news.summary || ''}\nHaber Açıklaması: ${news.des || ''}` : '';
      const aiPrompt = `Sen genç ve eğlenceli bir haber asistanısın. Kullanıcının sorusu: "${inputValue}".\n${haberIcerik}\n\nZ kuşağına hitap eden eğlenceli bir dille cevap ver. Bol bol emoji kullan 😊🔥💯. Modern slang ve güncel ifadeler kullan. Samimi ve arkadaşça yaklaş. Sadece sorulan soruya doğrudan cevap ver. Cevabını markdown formatında ver. Türkçe yanıtla.`;
      console.log("🤖 AI Prompt:", aiPrompt);
      const aiResponse = await ai(aiPrompt);
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "**Ups!** �💥 Bir şeyler ters gitti!\n\n*Biraz sonra tekrar dene* 🔄✨",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* AI Chat Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-lg font-semibold"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ minWidth: 220 }}
      >
        {/* AI Robot Icon */}
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondaryBG">
          <BotMessageSquare className="w-5 h-5 text-white" />
        </span>
        <span>Yapay Zekaya Sor</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-32 right-8 z-50 w-[450px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-tbackground dark:bg-blackSelectBg rounded-3xl shadow-2xl border border-secondary/40 flex flex-col overflow-hidden sm:w-[450px] xs:w-[350px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-secondaryBG rounded-full flex items-center justify-center">
                  <BotMessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Haber Asistanı</h3>
                  <p className="text-xs opacity-90">Haberle ilgili sorularınızı sorun</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="ml-2 p-1 rounded-full hover:bg-secondaryBG transition">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-tbackground dark:bg-blackSelectBg">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 break-words ${
                    message.isUser 
                      ? 'bg-secondary text-white' 
                      : 'bg-primaryBG hover:bg-blackSelectHover hover:text-white text-textPrimary'
                  }`}>
                    {message.isUser ? (
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    ) : (
                      <div className="text-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 text-textPrimary leading-relaxed">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-secondary">{children}</strong>,
                            em: ({ children }) => <em className="italic text-textPrimary">{children}</em>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-textPrimary ml-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-textPrimary ml-2">{children}</ol>,
                            li: ({ children }) => <li className="text-textPrimary">{children}</li>,
                            code: ({ children }) => <code className="bg-secondary/20 px-1.5 py-0.5 rounded text-secondary font-mono text-xs">{children}</code>,
                            blockquote: ({ children }) => <blockquote className="border-l-4 border-secondary pl-3 italic text-textPrimary/80 mb-2 bg-secondary/5 py-1">{children}</blockquote>,
                            h1: ({ children }) => <h1 className="text-lg font-bold text-secondary mb-2 mt-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold text-secondary mb-2 mt-1">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-secondary mb-1 mt-1">{children}</h3>,
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-white/80' : 'text-secondary'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-primaryBG text-secondary border border-secondary/30 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-secondary rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className="w-2 h-2 bg-secondary rounded-full"
                      />
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                        className="w-2 h-2 bg-secondary rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-secondary/30 bg-tbackground dark:bg-blackSelectBg">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Haberle ilgili sorunuzu yazın..."
                  className="flex-1 px-4 py-3 text-sm border border-secondaryBG rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary bg-primaryBG text-textPrimary placeholder-textSecondary"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-5 py-3 bg-gradient-to-r from-secondary to-secondaryHover text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
