import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ai } from '../../services/firebase';

const AIChat = ({ news }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Merhaba! Ben haber asistanınızım. Size haberin içeriği, kaynak güvenilirliği veya başka sorularınızla yardımcı olabilirim. Nasıl yardımcı olabilirim?",
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
      let haberIcerik = news ? `\n\nHaber Başlığı: ${news.name || ''}\nHaber Özeti: ${news.minides || ''}\nHaber İçeriği: ${news.content || ''}` : '';
      const aiPrompt = `Sen bir haber asistanısın. Kullanıcının sorusu: "${inputValue}".\n${haberIcerik}\nKullanıcıya haberin içeriğiyle ilgili, kaynak güvenilirliği, güncel olaylar veya medya okuryazarlığı konularında yardımcı ol. Kısa, net ve yardımcı cevaplar ver. Türkçe yanıtla.`;
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
        text: "Üzgünüm, şu anda bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
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
        {/* AI Icon */}
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondaryBG">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#1bd96a" />
            <rect x="9.5" y="9.5" width="5" height="5" fill="#16181c" />
            <circle cx="12" cy="12" r="2.5" fill="#22ff84" />
          </svg>
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
            className="fixed bottom-32 right-8 z-50 w-[370px] h-[520px] bg-tbackground dark:bg-blackSelectBg rounded-3xl shadow-2xl border border-secondary/40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-secondaryBG rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#1bd96a" />
                    <rect x="9.5" y="9.5" width="5" height="5" fill="#16181c" />
                    <circle cx="12" cy="12" r="2.5" fill="#22ff84" />
                  </svg>
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
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 break-words ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-secondary to-secondaryHover text-white' 
                      : 'bg-primaryBG text-textPrimary border border-secondary/30'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-white/70' : 'text-secondary'
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
                  className="flex-1 px-3 py-2 text-sm border border-secondaryBG rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary bg-primaryBG text-textPrimary"
                  disabled={isLoading}
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-secondary to-secondaryHover text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
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
