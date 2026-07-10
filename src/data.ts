import { Product, Customer, UserSubmittedProduct } from "./types";

export const DEFAULT_PRODUCTS: Product[] = [
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
    name: "Laptop HP EliteBook 840 Sostenible",
    description: "Laptop empresarial ultradelgada certificada con diagnóstico inteligente. Chasis de aluminio reciclado, pantalla Full HD y óptimo rendimiento energético.",
    price: 489.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600",
    impact: "Evita la fabricación de un equipo nuevo, reduciendo drásticamente la minería de tierras raras y desechos electrónicos.",
    co2Saved: 320.00,
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
    name: "Smartphone iPhone 13 Pro Green",
    description: "Smartphone de alto rendimiento verificado en 45 puntos de control automático. Batería premium y garantía de durabilidad ecológica con certificación QR.",
    price: 399.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600",
    impact: "Ahorra el 80% de la huella de carbono asociada con la fabricación de un teléfono nuevo y recupera materiales valiosos.",
    co2Saved: 85.00,
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
    co2Saved: 110.00,
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
    name: "Smartwatch Apple Watch Series 7 Reacondicionado",
    description: "Smartwatch deportivo con pantalla siempre encendida. Chasis de aluminio aeroespacial 100% reciclado, ideal para tracking de salud diaria.",
    price: 189.00,
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600",
    impact: "Previene la acumulación de desechos tecnológicos and evita la extracción de litio y cobalto para baterías nuevas.",
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
    description: "Auriculares premium con cancelación activa de ruido y transductores de alta fidelidad, construidos con un 85% de plástico recuperado de los océanos.",
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
    name: "Monitor Dell UltraSharp 24\" IPS Reacondicionado",
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
      batteryHealth: 100,
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
    name: "Consola Nintendo Switch Lite Gray Reacondicionada",
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
    name: "Smartphone Samsung Galaxy S22 Ultra Reacondicionado",
    description: "Smartphone premium con lápiz óptico S-Pen integrado, de cinco cámaras avanzadas y pantalla AMOLED dinámica. Verificado exhaustivamente.",
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
    name: "E-Reader Kindle Paperwhite E-Ink Reacondicionado",
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
  },
  {
    id: "p-mantenimiento",
    name: "Mantenimiento Preventivo y Correctivo de Equipos",
    description: "Servicio integral de limpieza profunda, cambio de pasta térmica, optimización de sistema y diagnóstico de hardware para tu laptop, PC o consola. El costo final se determinará según el diagnóstico de nuestros técnicos.",
    price: 0.00,
    category: "Servicios",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=600",
    impact: "Prolonga la vida útil de tus equipos actuales para reducir la chatarra electrónica y evitar la emisión de nuevos gases contaminantes.",
    co2Saved: 45.00,
    rating: 4.9,
    stock: 99
  }
];

export const DEFAULT_CUSTOMERS: Customer[] = [
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

export const DEFAULT_USER_PRODUCTS: UserSubmittedProduct[] = [
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
