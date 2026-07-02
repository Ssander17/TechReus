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

  const getLocalAssistantResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("cepillo")) {
      return "¡Excelente pregunta! 🪥 Los cepillos de dientes de plástico comunes tardan más de 400 años en descomponerse y no se reciclan en contenedores estándar.\n\nTe recomiendo:\n1. Cambiar a cepillos de bambú biodegradables (retirando las cerdas de nailon antes de compostar el mango).\n2. Si tienes cepillos de plástico viejos, puedes reutilizarlos para limpiar juntas de baldosas, calzado o cadenas de bicicleta.\n3. Llevarlos a puntos de recogida especializados de marcas asociadas.";
    }
    if (q.includes("cocina") || q.includes("plástico") || q.includes("plastico")) {
      return "¡Reducir plástico en la cocina es un gran paso! 🥑 Aquí tienes unos ecotips prácticos:\n\n• **Adiós al film plástico**: Usa envoltorios de cera de abeja lavables y reutilizables.\n• **Compra a granel**: Lleva tus propios frascos de vidrio y bolsas de tela para legumbres, arroz o frutos secos.\n• **Estropajos naturales**: Cambia las esponjas sintéticas de poliuretano por estropajos de lufa vegetal biodegradable.\n• **Almacenamiento**: Prefiere recipientes de vidrio o acero inoxidable sobre los de plástico tradicional.";
    }
    if (q.includes("compost") || q.includes("compostera") || q.includes("orgánico") || q.includes("organico")) {
      return "¡Iniciar tu propia compostera es asombroso! 🍂 Sigue esta guía de 3 pasos sencillos:\n\n1. **El contenedor**: Puede ser una caja de plástico perforada o un espacio en tu jardín.\n2. **La receta (50/50)**:\n   - *Materiales Verdes* (Nitrógeno): Restos de frutas, verduras, café y bolsitas de té.\n   - *Materiales Marrones* (Carbono): Hojas secas, cartón sin tinta troceado, aserrín o cáscaras de huevo.\n3. **Mantenimiento**: Revuelve la mezcla una vez por semana para airearla y asegúrate de que esté húmeda como una esponja escurrida. ¡En 3 meses tendrás abono premium para tus plantas!";
    }
    if (q.includes("electrónico") || q.includes("electronico") || q.includes("celular") || q.includes("computadora") || q.includes("laptop") || q.includes("reciclar") || q.includes("recicl")) {
      return "En TechReus nos apasiona el reciclaje de tecnología 💻.\n\nSi tienes laptops, smartphones o tablets viejos:\n1. **Usa nuestro Portal de Vendedor**: Registra los detalles de tu equipo en la pestaña 'Vender mi equipo'. Te daremos un diagnóstico técnico automático y estimación de CO2 evitado.\n2. **Puntos de Reciclaje**: Si el equipo no funciona del todo, llévalo a uno de nuestros contenedores de EcoTech para extraer metales valiosos y evitar fugas de litio o plomo al medio ambiente.\n3. **Gana EcoPoints**: Acumula puntos canjeables por descuentos en nuestra tienda de tecnología reacondicionada certificada.";
    }
    if (q.includes("hola") || q.includes("buenos") || q.includes("saludos") || q.includes("que tal") || q.includes("quién eres") || q.includes("quien eres")) {
      return "¡Hola! Qué gusto saludarte 🌱. Estoy aquí para darte recomendaciones de sostenibilidad, tips de reciclaje o guiarte en el uso de la plataforma TechReus. ¿Qué te gustaría aprender hoy?";
    }
    return "¡Me encanta tu iniciativa verde! 🌍 Como tu EcoAsistente local, te recuerdo que cada pequeño hábito cuenta. Puedes:\n\n• Registrar tus dispositivos antiguos en la pestaña 'Vender mi equipo' para darles una segunda vida.\n• Comprar tecnología reacondicionada en nuestro catálogo con diagnóstico certificado QR.\n• Administrar clientes sostenibles en el panel de control.\n\n¿Quieres que hablemos sobre cómo reciclar materiales complejos, compostar en casa o reducir plásticos?";
  };

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
      console.warn("Chat error, using smart rule-based local response fallback:", err);
      // Smart Fallback response
      const fallbackText = getLocalAssistantResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          text: `${fallbackText}\n\n*(EcoAsistente local operando de modo seguro offline)* ♻️`,
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
