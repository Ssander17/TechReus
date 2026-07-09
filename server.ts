import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for lazy loading Gemini API safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured in the Secrets panel.");
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. PRODUCTS DATABASE (In-memory sustainable products catalog)
const PRODUCTS = [
  {
    id: "p4",
    name: "Cargador Solar Portátil",
    description: "Powerbank portátil de 10,000mAh con panel solar integrado de alta eficiencia, carga dos dispositivos a la vez con energía limpia.",
    price: 29.90,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&q=80&w=600",
    impact: "Aprovecha la energía solar directa, disminuyendo el consumo de la red eléctrica.",
    co2Saved: 3.80,
    rating: 4.6,
    stock: 15
  },
  {
    id: "p7",
    name: "Laptop Reacondicionada HP EliteBook 840 Sostenible",
    description: "Laptop empresarial ultradelgada certificada con diagnóstico inteligente. Chasis de aluminio reciclado, pantalla Full HD y óptimo rendimiento energético.",
    price: 489.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600",
    impact: "Evita la fabricación de un equipo nuevo, reduciendo drásticamente la minería de tierras raras y desechos electrónicos.",
    co2Saved: 320.00, // Refurbished avoids manufacturing footprint (~320kg CO2)
    rating: 4.9,
    stock: 8,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 94,
      screenStatus: "Perfecto (Sin pixeles muertos)",
      storageStatus: "SSD 512GB NVMe (Salud 100%)",
      cpuStatus: "Intel Core i7 11va Gen (Verificado)",
      certifiedDate: "2026-06-20",
      serialNumber: "EC-LT-840G8",
      co2SavedProduction: 320,
      modelYear: 2022
    }
  },
  {
    id: "p8",
    name: "Smartphone Reacondicionado iPhone 13 Pro Green",
    description: "Smartphone de alto rendimiento verificado en 45 puntos de control automático. Batería premium y garantía de durabilidad ecológica con certificación QR.",
    price: 399.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600",
    impact: "Ahorra el 80% de la huella de carbono asociada con la fabricación de un teléfono nuevo y recupera materiales valiosos.",
    co2Saved: 85.00, // Avoids ~85kg CO2
    rating: 4.8,
    stock: 12,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 91,
      screenStatus: "Excelente (Ligeros micro-rasguños imperceptibles)",
      storageStatus: "128GB Flash NVMe (Verificado)",
      cpuStatus: "Apple A15 Bionic (Rendimiento 100%)",
      certifiedDate: "2026-06-22",
      serialNumber: "EC-SP-I13P",
      co2SavedProduction: 85,
      modelYear: 2021
    }
  },
  {
    id: "p9",
    name: "Tablet Sostenible iPad Air 4 Eco-Certificada",
    description: "Tablet ecológica ideal para lectura y productividad. Chasis de aluminio 100% reciclado verificado en componentes y calibración de batería digital.",
    price: 329.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600",
    impact: "Prolonga el ciclo de vida útil del hardware y evita residuos contaminantes de metales pesados en vertederos.",
    co2Saved: 110.00, // Avoids ~110kg CO2
    rating: 4.7,
    stock: 6,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 92,
      screenStatus: "Excelente (Colores y brillo calibrados)",
      storageStatus: "64GB Flash (Salud Excelente)",
      cpuStatus: "Apple A14 Bionic (Verificado)",
      certifiedDate: "2026-06-18",
      serialNumber: "EC-TB-IPA4",
      co2SavedProduction: 110,
      modelYear: 2020
    }
  },
  {
    id: "p10",
    name: "Smartwatch Reacondicionado Apple Watch Series 7",
    description: "Smartwatch deportivo con pantalla siempre encendida. Chasis de aluminio aeroespacial 100% reciclado, ideal para tracking de salud diaria.",
    price: 189.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
    impact: "Previene la acumulación de desechos tecnológicos y evita la extracción de litio y cobalto para baterías nuevas.",
    co2Saved: 38.00,
    rating: 4.6,
    stock: 14,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 88,
      screenStatus: "Perfecto (Sin detalles estéticos)",
      storageStatus: "32GB Flash Integrado (Salud 100%)",
      cpuStatus: "Apple S7 Dual-Core (Certificado)",
      certifiedDate: "2026-06-25",
      serialNumber: "EC-SW-AW7",
      co2SavedProduction: 38,
      modelYear: 2021
    }
  },
  {
    id: "p11",
    name: "Auriculares Inalámbricos de Plástico Oceánico",
    description: "Auriculares premium con cancelación activa de ruido and transductores de alta fidelidad, construidos con un 85% de plástico recuperado de los océanos.",
    price: 59.90,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    impact: "Ayuda a limpiar los ecosistemas marinos al incorporar plástico reciclado en su diseño de alta durabilidad.",
    co2Saved: 8.50,
    rating: 4.5,
    stock: 25
  },
  {
    id: "p12",
    name: "Monitor Reacondicionado Dell UltraSharp 24\" IPS",
    description: "Monitor profesional con resolución Full HD y panel IPS de alta precisión cromática. Cuenta con modo Eco de apagado automático inteligente.",
    price: 139.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600",
    impact: "Evita la emisión de plásticos bromados y el uso de mercurio que se requiere para nuevas retroiluminaciones de pantallas.",
    co2Saved: 160.00,
    rating: 4.8,
    stock: 5,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 100, // Alimentación continua sin degradación
      screenStatus: "Perfecto (Brillo y contraste calibrados con espectrómetro)",
      storageStatus: "Firmware Dell Verificado (Estable)",
      cpuStatus: "Chipset TCON Realtek Eco-Friendly (Verificado)",
      certifiedDate: "2026-06-21",
      serialNumber: "EC-MN-DELL24",
      co2SavedProduction: 160,
      modelYear: 2022
    }
  },
  {
    id: "p13",
    name: "Consola Reacondicionada Nintendo Switch Lite Gray",
    description: "Consola de videojuegos portátil ideal para entretenimiento en movimiento. Todos los componentes de botones y joysticks han sido renovados.",
    price: 149.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=600",
    impact: "Reduce la necesidad de fabricar nuevas placas integradas y prolonga el disfrute de hardware existente.",
    co2Saved: 65.00,
    rating: 4.7,
    stock: 4,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 90,
      screenStatus: "Excelente (Con protector de pantalla pre-instalado)",
      storageStatus: "32GB EMMC + Lector MicroSD (Operación 100%)",
      cpuStatus: "NVIDIA Tegra Custom (Ahorro energético optimizado)",
      certifiedDate: "2026-06-24",
      serialNumber: "EC-VG-NSLITE",
      co2SavedProduction: 65,
      modelYear: 2020
    }
  },
  {
    id: "p14",
    name: "Teclado Mecánico Sostenible de Bambú",
    description: "Teclado mecánico retroiluminado con interruptores táctiles silenciosos. Carcasa exterior fabricada con bambú natural biodegradable y plástico reciclado.",
    price: 69.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
    impact: "Sustituye la carcasa tradicional de derivados plásticos de combustibles fósiles por bambú de rápido crecimiento.",
    co2Saved: 12.00,
    rating: 4.6,
    stock: 18
  },
  {
    id: "p16",
    name: "Altavoz Bluetooth de Corcho y Textil Reciclado",
    description: "Altavoz inalámbrico de alta potencia acústica. Revestimiento de corcho natural para absorción acústica óptima y malla de tela reciclada de botellas PET.",
    price: 45.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600",
    impact: "Uso de materiales orgánicos renovables con huella negativa de CO2 en el proceso de recolección.",
    co2Saved: 7.40,
    rating: 4.4,
    stock: 30
  },
  {
    id: "p17",
    name: "Smartphone Reacondicionado Samsung Galaxy S22 Ultra",
    description: "Smartphone premium con lápiz óptico S-Pen integrado, cinco cámaras avanzadas y pantalla AMOLED dinámica. Verificado exhaustivamente.",
    price: 479.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600",
    impact: "Evita la huella de refinamiento de metales valiosos como oro, cobre y cobalto que requiere cada smartphone moderno.",
    co2Saved: 90.00,
    rating: 4.9,
    stock: 7,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 93,
      screenStatus: "Perfecto (Sin quemaduras de pantalla ni rasguños)",
      storageStatus: "256GB UFS 3.1 de alta velocidad (Verificado)",
      cpuStatus: "Snapdragon 8 Gen 1 (Rendimiento verificado al 100%)",
      certifiedDate: "2026-06-26",
      serialNumber: "EC-SP-S22U",
      co2SavedProduction: 90,
      modelYear: 2022
    }
  },
  {
    id: "p18",
    name: "Ratón Inalámbrico con Panel de Micro-Carga Solar",
    description: "Ratón ergonómico inalámbrico de alta precisión con un mini panel solar integrado en la parte frontal que se recarga de forma continua con luz ambiental.",
    price: 34.50,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600",
    impact: "Elimina la necesidad de pilas alcalinas desechables recargándose infinitamente con luz indirecta.",
    co2Saved: 4.10,
    rating: 4.6,
    stock: 20
  },
  {
    id: "p19",
    name: "E-Reader Reacondicionado Kindle Paperwhite E-Ink",
    description: "Lector de libros electrónicos con pantalla táctil de 6.8 pulgadas antirreflejos y luz cálida ajustable. Batería ultra duradera de hasta 10 semanas.",
    price: 79.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600",
    impact: "Reduce la tala de árboles y la energía consumida en la distribución global de libros impresos en papel físico.",
    co2Saved: 42.00,
    rating: 4.8,
    stock: 11,
    isEcoTech: true,
    diagnostics: {
      batteryHealth: 95,
      screenStatus: "Excelente (Contraste perfecto, sin pixeles de tinta trabados)",
      storageStatus: "8GB Flash integrado (Suficiente para 5000+ libros)",
      cpuStatus: "NXP i.MX6 SoloLite (Verificado térmicamente)",
      certifiedDate: "2026-06-23",
      serialNumber: "EC-ER-KPW5",
      co2SavedProduction: 42,
      modelYear: 2021
    }
  }
];

// 2. ECO-CHALLENGES (Desafíos mensuales de la comunidad)
const CHALLENGES = [
  {
    id: "c1",
    title: "Semana Libre de Plásticos",
    description: "Evita por completo los plásticos de un solo uso (botellas, popotes, bolsas, empaques) durante 7 días.",
    points: 150,
    participants: 1240,
    category: "Plásticos",
    duration: "7 días"
  },
  {
    id: "c2",
    title: "Transporte Cero Emisiones",
    description: "Utiliza únicamente bicicleta, transporte público o camina para todos tus traslados laborales o escolares esta semana.",
    points: 200,
    participants: 843,
    category: "Movilidad",
    duration: "5 días"
  },
  {
    id: "c3",
    title: "Días de Dieta Basada en Plantas",
    description: "Sustituye la carne y derivados animales por proteínas vegetales en tus comidas durante 3 días seguidos.",
    points: 120,
    participants: 954,
    category: "Alimentación",
    duration: "3 días"
  },
  {
    id: "c4",
    title: "Apagón Electrónico Diario",
    description: "Desconecta todos tus dispositivos y electrodomésticos no esenciales durante 2 horas por las noches.",
    points: 100,
    participants: 612,
    category: "Energía",
    duration: "4 días"
  }
];

// API Endpoint for products
app.get("/api/products", (req, res) => {
  res.json(PRODUCTS);
});

// API Endpoint for challenges
app.get("/api/challenges", (req, res) => {
  res.json(CHALLENGES);
});

// CUSTOMER REGISTRY DATABASE (In-memory presentation store)
const CUSTOMERS = [
  {
    id: "c-1",
    name: "Alejandra Gómez",
    email: "alejandra.gomez@example.com",
    phone: "+593 96 883 8479",
    address: "Av. de la República y Eloy Alfaro, Quito, 170518",
    trackingNumber: "TR-2026-89472",
    hasAccount: true,
    password: "123",
    ecoPoints: 120,
    createdAt: "2026-06-25T10:30:00.000Z"
  },
  {
    id: "c-2",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@example.com",
    phone: "+593 99 887 7665",
    address: "Av. 9 de Octubre y Boyacá, Guayaquil, 090306",
    trackingNumber: "TR-2026-10582",
    hasAccount: false,
    password: "",
    ecoPoints: 0,
    createdAt: "2026-06-27T15:45:00.000Z"
  }
];

// USER-SUBMITTED PRODUCTS (In-memory presentation store)
const USER_PRODUCTS = [
  {
    id: "up-1",
    name: "MacBook Pro M1 2020",
    description: "MacBook Pro con chip M1 en excelente estado físico, teclado en español, caja y cargador original.",
    category: "Laptops",
    suggestedPrice: 750,
    co2Saved: 250,
    specs: {
      batteryHealth: "89%",
      screenStatus: "Excelente (Sin rasguños)",
      storageStatus: "SSD 256GB OK",
      cpuStatus: "Apple M1 8-Core"
    },
    customerEmail: "alejandra.gomez@example.com",
    customerName: "Alejandra Gómez",
    status: "pending_review",
    daysRemaining: 11,
    createdAt: "2026-06-28T12:00:00.000Z"
  }
];

// API Endpoints for Customers (In-memory CRUD)
app.get("/api/customers", (req, res) => {
  res.json(CUSTOMERS);
});

// Authentication Endpoint for Clients
app.post("/api/customers/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "El correo y la contraseña son obligatorios." });
  }
  const customer = CUSTOMERS.find(
    c => c.email.toLowerCase() === email.toLowerCase() && c.hasAccount && c.password === password
  );
  if (!customer) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos, o la cuenta no existe." });
  }
  res.json(customer);
});

app.post("/api/customers", (req, res) => {
  const { name, email, phone, address, trackingNumber, hasAccount, password, ecoPoints } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "El nombre y el correo electrónico son obligatorios." });
  }
  
  // Check if account already exists with this email when trying to register
  if (hasAccount) {
    const existing = CUSTOMERS.find(c => c.email.toLowerCase() === email.toLowerCase() && c.hasAccount);
    if (existing) {
      return res.status(400).json({ error: "Ya existe una cuenta activa con este correo electrónico." });
    }
  }

  const existingIdx = CUSTOMERS.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
  const newCustomer = {
    id: existingIdx !== -1 ? CUSTOMERS[existingIdx].id : `c-${Date.now()}`,
    name,
    email,
    phone: phone || "",
    address: address || "",
    trackingNumber: trackingNumber || `TR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    hasAccount: !!hasAccount,
    password: password || "",
    ecoPoints: ecoPoints || (hasAccount ? 100 : 0), // 100 welcome ecoPoints!
    createdAt: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    CUSTOMERS[existingIdx] = newCustomer;
  } else {
    CUSTOMERS.push(newCustomer);
  }
  res.status(201).json(newCustomer);
});

app.put("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, trackingNumber, hasAccount, password, ecoPoints } = req.body;
  const index = CUSTOMERS.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Cliente no encontrado." });
  }
  CUSTOMERS[index] = {
    ...CUSTOMERS[index],
    name: name !== undefined ? name : CUSTOMERS[index].name,
    email: email !== undefined ? email : CUSTOMERS[index].email,
    phone: phone !== undefined ? phone : CUSTOMERS[index].phone,
    address: address !== undefined ? address : CUSTOMERS[index].address,
    trackingNumber: trackingNumber !== undefined ? trackingNumber : CUSTOMERS[index].trackingNumber,
    hasAccount: hasAccount !== undefined ? !!hasAccount : CUSTOMERS[index].hasAccount,
    password: password !== undefined ? password : CUSTOMERS[index].password,
    ecoPoints: ecoPoints !== undefined ? Number(ecoPoints) : CUSTOMERS[index].ecoPoints
  };
  res.json(CUSTOMERS[index]);
});

app.delete("/api/customers/:id", (req, res) => {
  const { id } = req.params;
  const index = CUSTOMERS.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Cliente no encontrado." });
  }
  const deleted = CUSTOMERS.splice(index, 1);
  res.json(deleted[0]);
});


// API Endpoints for User-Submitted Products (In-memory CRUD)
app.get("/api/user-products", (req, res) => {
  const { email } = req.query;
  if (email) {
    const filtered = USER_PRODUCTS.filter(
      p => p.customerEmail.toLowerCase() === (email as string).toLowerCase()
    );
    return res.json(filtered);
  }
  res.json(USER_PRODUCTS);
});

app.post("/api/user-products", (req, res) => {
  const { name, description, category, suggestedPrice, specs, customerEmail, customerName } = req.body;
  if (!name || !category || !suggestedPrice || !customerEmail) {
    return res.status(400).json({ error: "Faltan campos obligatorios para registrar el producto." });
  }

  // Calculate CO2 Saved based on category
  let co2Saved = 50;
  const lowerCat = category.toLowerCase();
  if (lowerCat.includes("laptop") || lowerCat.includes("ordenador") || lowerCat.includes("computador") || lowerCat.includes("portátil") || lowerCat.includes("portatil")) {
    co2Saved = 250 + Math.floor(Math.random() * 70);
  } else if (lowerCat.includes("phone") || lowerCat.includes("celular") || lowerCat.includes("móvil") || lowerCat.includes("movil") || lowerCat.includes("teléfono") || lowerCat.includes("telefono")) {
    co2Saved = 70 + Math.floor(Math.random() * 20);
  } else if (lowerCat.includes("tablet") || lowerCat.includes("ipad")) {
    co2Saved = 100 + Math.floor(Math.random() * 20);
  } else if (lowerCat.includes("watch") || lowerCat.includes("reloj")) {
    co2Saved = 30 + Math.floor(Math.random() * 15);
  }

  // Create new user product with 10 to 15 days review period (inclusive)
  const daysRemaining = 10 + Math.floor(Math.random() * 6); // 10, 11, 12, 13, 14, 15

  const newProduct = {
    id: `up-${Date.now()}`,
    name,
    description: description || "",
    category,
    suggestedPrice: Number(suggestedPrice),
    co2Saved,
    specs: specs || {},
    customerEmail,
    customerName: customerName || "Usuario Registrado",
    status: "pending_review",
    daysRemaining,
    createdAt: new Date().toISOString()
  };

  USER_PRODUCTS.push(newProduct);
  res.status(201).json(newProduct);
});


// 3. GEMINI ECO-ASSISTANT (AI Chatbot)
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "El mensaje del usuario es requerido." });
    }

    try {
      const ai = getGeminiClient();
      
      const systemInstruction = 
        "Eres 'EcoAsistente', un experto en ecología, reciclaje, sostenibilidad y vida cero residuos de la plataforma TechReus. " +
        "Tu meta es inspirar y aconsejar a los usuarios para reducir su impacto ambiental de manera práctica y amable en español. " +
        "Proporciona respuestas breves, estructuradas con viñetas, entusiastas y muy enfocadas a la acción cotidiana. " +
        "Si te preguntan cómo reciclar un objeto específico, da instrucciones claras paso a paso. " +
        "Usa tonos amigables e introduce de vez en cuando un emoji ecológico como 🌱, ♻️, 🌍, 🌊.";

      // Formulate query incorporating chat history if present
      let contents = "";
      if (history && history.length > 0) {
        contents = "Historial de conversación:\n" + 
          history.map((h: any) => `${h.role === 'user' ? 'Usuario' : 'EcoAsistente'}: ${h.text}`).join("\n") +
          `\n\nUsuario actual: ${message}`;
      } else {
        contents = message;
      }

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: result.text || "¡Hola! Estoy aquí para resolver tus dudas ecológicas. Intentemos de nuevo." });
    } catch (apiError: any) {
      console.warn("Gemini API error, falling back to simulated eco-expert:", apiError.message);
      
      // Simulated response if Gemini API key is missing or invalid
      const mockResponses = [
        "¡Excelente pregunta! Reducir nuestros residuos es un gran primer paso. Te sugiero intentar sustituir los envases de plástico de un solo uso por alternativas reutilizables. 🌱",
        "Para reciclar eso adecuadamente, asegúrate de limpiarlo y secarlo para evitar contaminar otros materiales. Los residuos limpios tienen un valor real en los puntos de recolección de TechReus. ♻️",
        "¡Hola! Reducir el consumo de energía en casa es sencillo: desconecta los cargadores que no uses (consumo vampiro) y aprovecha al máximo la luz solar durante el día. ¡Pequeñas acciones logran grandes cambios! 🌍",
        "El compostaje doméstico es una maravillosa forma de transformar los desechos orgánicos de cocina en abono nutritivo para tus plantas. ¿Te gustaría saber cómo empezar una compostera básica? 🍂"
      ];
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      res.json({ 
        text: `${randomResponse}\n\n*(Nota: EcoAsistente está funcionando en modo de simulación ecológica ya que el API key de Gemini no está configurado).*` 
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
});

// 4. GEMINI CARBON FOOTPRINT ANALYZER
app.post("/api/gemini/footprint", async (req, res) => {
  try {
    const { transportation, energy, diet, waste, totalCo2 } = req.body;

    if (totalCo2 === undefined) {
      return res.status(400).json({ error: "Los datos de la huella de carbono son requeridos." });
    }

    try {
      const ai = getGeminiClient();
      
      const prompt = `Un usuario de TechReus ha calculado su huella de carbono mensual aproximada.
      Los datos de consumo son:
      - Transporte: ${transportation.type === 'car' ? `Automóvil (${transportation.fuel === 'gasoline' ? 'Gasolina' : 'Diésel/Híbrido'}, ${transportation.distance} km al mes)` : transportation.type === 'public' ? `Transporte Público (${transportation.distance} km al mes)` : 'Bicicleta / Caminar / Eléctrico'}
      - Electricidad/Energía en Hogar: ${energy.kwh} kWh al mes, Gas: ${energy.gas} balones/mes
      - Tipo de Alimentación: ${diet === 'heavy-meat' ? 'Alto consumo de carne roja' : diet === 'moderate-meat' ? 'Consumo moderado de carne/pollo' : diet === 'vegetarian' ? 'Vegetariano' : 'Vegano'}
      - Gestión de Residuos: ${waste.recycle ? 'Recicla activamente' : 'No recicla habitualmente'}, Compostaje: ${waste.compost ? 'Composta residuos orgánicos' : 'No composta'}
      
      Su huella total calculada es de: ${totalCo2.toFixed(2)} toneladas de CO2 al año.
      
      Por favor, genera un informe ecológico personalizado en ESPAÑOL. El informe DEBE ser devuelto en formato JSON con la siguiente estructura:
      {
        "feedback": "Mensaje motivador corto de 2-3 frases analizando su huella actual comparada con el promedio latinoamericano/mundial (aprox 4-5 toneladas por persona al año).",
        "criticalArea": "El área que más impacto negativo tiene según los datos provistos y por qué.",
        "actionPlan": [
          "Acción práctica 1 enfocada a su transporte o energía con su impacto positivo estimado.",
          "Acción práctica 2 enfocada a su alimentación con su impacto positivo estimado.",
          "Acción práctica 3 enfocada a su gestión de residuos con su impacto positivo estimado."
        ],
        "estimatedSavings": "Porcentaje o cantidad de toneladas de CO2 que podría reducir si sigue este plan (ej. '¡Podrías reducir hasta un 25% de tus emisiones (1.2 Ton CO2/año) de inmediato!')"
      }`;

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        }
      });

      const responseText = result.text || "{}";
      const report = JSON.parse(responseText.trim());
      res.json(report);
    } catch (apiError: any) {
      console.warn("Gemini API error on footprint, falling back to static calculation:", apiError.message);
      
      // Fallback response with calculated recommendations
      let mainAction = "Sustituye traslados en automóvil por caminatas o bicicleta.";
      let foodAction = "Suma un día sin carne adicional a tu semana.";
      let wasteAction = "Comienza a clasificar plásticos y cartón para llevarlos al centro TechReus.";
      let criticalArea = "Transporte e ineficiencia de combustibles fósiles.";

      if (diet === 'heavy-meat') {
        foodAction = "Intenta reducir tu consumo de carne roja a solo 2 veces por semana para salvar bosques y ahorrar agua.";
        criticalArea = "Consumo de carne roja (alta huella de metano y deforestación).";
      } else if (transportation.type === 'car' && transportation.distance > 800) {
        mainAction = "Prueba compartir automóvil (carpooling) o usar transporte público 2 días a la semana para disminuir tus emisiones de combustión.";
        criticalArea = "Uso intensivo de automóvil particular de combustión.";
      } else if (energy.kwh > 250) {
        mainAction = "Sustituye bombillas incandescentes por iluminación LED de bajo consumo y desenchufa los electrodomésticos inactivos.";
        criticalArea = "Alto consumo de energía eléctrica residencial.";
      }

      const mockReport = {
        feedback: `¡Gran esfuerzo al medir tu huella! Tus emisiones anuales estimadas de ${totalCo2.toFixed(2)} toneladas de CO2 demuestran que estás consciente de tus hábitos. Comparado con el promedio latinoamericano de 4.0 toneladas, tienes una excelente base para lograr un impacto positivo aún mayor.`,
        criticalArea: criticalArea,
        actionPlan: [
          `🚗 ${mainAction}`,
          `🍎 ${foodAction}`,
          `♻️ ${wasteAction}`
        ],
        estimatedSavings: `¡Podrías reducir hasta un ${(totalCo2 * 0.22).toFixed(1)} toneladas de CO2 al año (~22%) aplicando estos cambios!`
      };
      
      res.json(mockReport);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error al procesar el informe de huella de carbono" });
  }
});

// Serve Vite build in production, otherwise hook up Vite middleware
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
