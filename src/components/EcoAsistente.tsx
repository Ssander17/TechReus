import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { MessageSquare, Send, X, Leaf, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function EcoAsistente() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m0",
      role: "assistant",
      text: "¡Hola! Soy tu EcoAsistente personal 🌱. Estoy listo para ayudarte a resolver cualquier duda sobre cómo reciclar materiales complejos, reducir residuos en el hogar, compostar o mejorar tus hábitos. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date()
    }
  ]);
  const [inputMsg, setInputMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "¿Cómo reciclo cepillos de dientes?",
    "Tips para reducir plástico en la cocina",
    "¿Cómo empezar una compostera básica?",
    "¿Qué materiales electrónicos se reciclan?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg("");
    setLoading(true);

    try {
      // Gather conversation history (excluding the first mock welcome)
      const formattedHistory = messages
        .filter(m => m.id !== "m0")
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: formattedHistory
        })
      });

      if (!response.ok) {
        throw new Error("Error en la conexión del asistente.");
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(),
        role: "assistant",
        text: data.text,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      // Fallback message error
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          text: "Lo lamento, experimenté un pequeño percance al intentar conectarme. Intenta preguntar de nuevo o asegúrate de que el servidor esté activo. ♻️",
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg transition-all cursor-pointer group"
          >
            <div className="p-1 bg-emerald-500 rounded-full group-hover:rotate-12 transition-transform duration-300">
              <Leaf className="w-4 h-4 fill-white/10" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight">EcoAsistente AI</span>
            
            {/* Pulsing indicator ring */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col justify-between overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/25 border border-emerald-400/20 text-emerald-400 rounded-xl">
                  <Leaf className="w-4.5 h-4.5 fill-emerald-500/10 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm flex items-center space-x-1">
                    <span>EcoAsistente AI</span>
                    <Sparkles className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wider">Sostenibilidad Inteligente</span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-3xs leading-relaxed ${
                        isUser
                          ? "bg-slate-800 text-slate-50 font-medium rounded-tr-none"
                          : "bg-white text-slate-700 border border-slate-100 rounded-tl-none whitespace-pre-wrap"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {/* Loader */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-3xs flex items-center space-x-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Redactando respuesta...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips and Input Form Area */}
            <div className="p-4 border-t border-slate-50 space-y-3 bg-white shrink-0">
              {/* Suggestion chips */}
              {messages.length === 1 && !loading && (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSendMessage(item)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 text-slate-600 hover:text-emerald-800 text-[10px] font-semibold rounded-lg text-left transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Send Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMsg);
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  placeholder="Hacer una consulta sobre reciclaje..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || loading}
                  className={`p-2 rounded-xl text-white shadow-xs transition-all ${
                    inputMsg.trim() && !loading
                      ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                  aria-label="Enviar mensaje"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
