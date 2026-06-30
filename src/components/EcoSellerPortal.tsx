import React, { useState, useEffect } from "react";
import { 
  User, Mail, Lock, Plus, ShieldCheck, AlertCircle, Calendar, 
  Cpu, Smartphone, Laptop, Tablet, RotateCw, LogOut, Clock, 
  Sparkles, Info, CheckCircle2, ChevronRight, HelpCircle, Phone, MapPin, DollarSign
} from "lucide-react";
import { Customer, UserSubmittedProduct } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface EcoSellerPortalProps {
  loggedInUser: Customer | null;
  setLoggedInUser: (user: Customer | null) => void;
}

export default function EcoSellerPortal({
  loggedInUser,
  setLoggedInUser
}: EcoSellerPortalProps) {
  // Navigation inside portal
  const [activeSubTab, setActiveSubTab] = useState<"register" | "my_listings">("register");
  
  // Auth Form State (for creating account or logging in)
  const [authType, setAuthType] = useState<"login" | "register">("register");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Form states for login
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Form states for register
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  // Device Registration Form State
  const [submittingDevice, setSubmittingDevice] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [deviceData, setDeviceData] = useState({
    name: "",
    description: "",
    category: "Laptops",
    suggestedPrice: "",
    batteryHealth: "90",
    screenStatus: "Perfecto (Sin detalles)",
    storageStatus: "SSD 256GB OK",
    cpuStatus: "Intel Core i5 / Apple M1"
  });

  // User submitted listings state
  const [listings, setListings] = useState<UserSubmittedProduct[]>([]);
  const [listingsLoading, setListingsLoading] = useState<boolean>(false);

  // Load listings when logged in or switching tabs
  const fetchUserListings = async () => {
    if (!loggedInUser) return;
    setListingsLoading(true);
    try {
      let apiListings: UserSubmittedProduct[] = [];
      try {
        const res = await fetch(`/api/user-products?email=${encodeURIComponent(loggedInUser.email)}`);
        if (res.ok) {
          apiListings = await res.json();
        }
      } catch (err) {
        console.warn("API listings fetch failed, using local listings fallback:", err);
      }

      // Load local products from localStorage
      const localStr = localStorage.getItem("techreus_local_products");
      const localProducts: UserSubmittedProduct[] = localStr ? JSON.parse(localStr) : [];

      // Filter local products for this user
      const userLocalProducts = localProducts.filter(
        p => p.customerEmail.toLowerCase() === loggedInUser.email.toLowerCase()
      );

      // Merge: API results first, then override or add with local ones
      const mergedMap = new Map<string, UserSubmittedProduct>();
      apiListings.forEach(p => mergedMap.set(p.id, p));
      userLocalProducts.forEach(p => mergedMap.set(p.id, p));

      setListings(Array.from(mergedMap.values()));
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUser) {
      fetchUserListings();
    }
  }, [loggedInUser]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      setAuthError("Por favor rellena todos los campos.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      let user: Customer | null = null;
      try {
        const res = await fetch("/api/customers/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password
          })
        });

        if (res.ok) {
          user = await res.json();
        }
      } catch (err) {
        console.warn("API login failed, checking local storage:", err);
      }

      if (!user) {
        const localStr = localStorage.getItem("techreus_local_customers");
        const localCustomers: Customer[] = localStr ? JSON.parse(localStr) : [];
        const found = localCustomers.find(
          c => c.email.toLowerCase() === loginData.email.toLowerCase() && c.hasAccount && c.password === loginData.password
        );
        if (found) {
          user = found;
        }
      }

      if (!user) {
        throw new Error("Credenciales incorrectas o la cuenta no existe.");
      }

      setLoggedInUser(user);
      setAuthSuccess(`¡Bienvenido de nuevo, ${user.name}!`);
      setTimeout(() => setAuthSuccess(null), 3500);
    } catch (err: any) {
      setAuthError(err.message || "Error al iniciar sesión.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone, address, password, confirmPassword } = registerData;

    if (!name || !email || !password) {
      setAuthError("Por favor, rellena los campos obligatorios (Nombre, Correo y Contraseña).");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Las contraseñas no coinciden.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    try {
      let user: Customer | null = null;
      try {
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            address,
            hasAccount: true,
            password
          })
        });

        if (res.ok) {
          user = await res.json();
        }
      } catch (err) {
        console.warn("API register failed, saving locally:", err);
      }

      if (!user) {
        user = {
          id: `c-${Date.now()}`,
          name,
          email,
          phone: phone || "",
          address: address || "",
          trackingNumber: `TR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          hasAccount: true,
          password,
          ecoPoints: 100, // Welcome points
          createdAt: new Date().toISOString()
        } as Customer;
      }

      // Save to localStorage list
      const localStr = localStorage.getItem("techreus_local_customers");
      const localCustomers: Customer[] = localStr ? JSON.parse(localStr) : [];
      const filtered = localCustomers.filter(c => c.id !== user!.id && c.email.toLowerCase() !== user!.email.toLowerCase());
      filtered.push(user);
      localStorage.setItem("techreus_local_customers", JSON.stringify(filtered));

      setLoggedInUser(user);
      setAuthSuccess("¡Cuenta creada exitosamente! Ya puedes registrar tu equipo.");
      setTimeout(() => setAuthSuccess(null), 4000);
    } catch (err: any) {
      setAuthError(err.message || "Error al registrar la cuenta.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Device Registration submission
  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInUser) return;

    const { name, category, suggestedPrice, description, cpuStatus, batteryHealth, storageStatus, screenStatus } = deviceData;

    if (!name.trim() || !suggestedPrice || isNaN(Number(suggestedPrice))) {
      alert("Por favor introduce un nombre válido y un precio sugerido correcto.");
      return;
    }

    setSubmittingDevice(true);
    try {
      const co2Saved = category === "Laptops" ? 250 : category === "Smartphones" ? 75 : 120;
      const devicePayload = {
        name,
        description,
        category,
        suggestedPrice: Number(suggestedPrice),
        specs: {
          cpuStatus,
          batteryHealth: `${batteryHealth}%`,
          storageStatus,
          screenStatus
        },
        customerEmail: loggedInUser.email,
        customerName: loggedInUser.name
      };

      let registeredProduct: UserSubmittedProduct | null = null;
      try {
        const res = await fetch("/api/user-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(devicePayload)
        });

        if (res.ok) {
          registeredProduct = await res.json();
        }
      } catch (err) {
        console.warn("API product submit failed, saving locally:", err);
      }

      if (!registeredProduct) {
        registeredProduct = {
          id: `up-${Date.now()}`,
          name,
          description,
          category,
          suggestedPrice: Number(suggestedPrice),
          co2Saved,
          specs: {
            cpuStatus,
            batteryHealth: `${batteryHealth}%`,
            storageStatus,
            screenStatus
          },
          customerEmail: loggedInUser.email,
          customerName: loggedInUser.name,
          status: "pending_review",
          daysRemaining: 12,
          createdAt: new Date().toISOString()
        } as UserSubmittedProduct;
      }

      // Save to localStorage list
      const localStr = localStorage.getItem("techreus_local_products");
      const localProducts: UserSubmittedProduct[] = localStr ? JSON.parse(localStr) : [];
      localProducts.push(registeredProduct);
      localStorage.setItem("techreus_local_products", JSON.stringify(localProducts));

      setSubmitSuccess(true);
      setDeviceData({
        name: "",
        description: "",
        category: "Laptops",
        suggestedPrice: "",
        batteryHealth: "90",
        screenStatus: "Perfecto (Sin detalles)",
        storageStatus: "SSD 256GB OK",
        cpuStatus: "Intel Core i5 / Apple M1"
      });
      fetchUserListings();
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveSubTab("my_listings");
      }, 3000);
    } catch (err) {
      alert("Hubo un problema al procesar el registro de tu equipo.");
    } finally {
      setSubmittingDevice(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setListings([]);
    setLoginData({ email: "", password: "" });
    setRegisterData({ name: "", email: "", phone: "", address: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* 1. WELCOME & INFO HEADER CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full uppercase font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plataforma de Ventas Segura</span>
            </span>
            <h1 className="font-display font-extrabold text-3xl text-slate-800 tracking-tight leading-none">
              Vende tu Tecnología con Confianza
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Registra tu dispositivo para que nosotros lo vendamos en el catálogo de TechReus. 
              Para garantizar la máxima confianza, todos los equipos pasan por una 
              <span className="font-bold text-slate-700"> revisión técnica obligatoria de 10 a 15 días </span> 
              antes de ser publicados. ¡Hacemos el trabajo pesado por ti y por el planeta!
            </p>
          </div>
          
          {loggedInUser && (
            <div className="shrink-0 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-4 md:flex-col md:items-stretch">
              <div className="flex items-center space-x-3.5">
                <div className="p-2 bg-emerald-500/25 border border-emerald-400/20 text-emerald-400 rounded-xl">
                  <User className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Sesión Activa</div>
                  <p className="text-xs font-bold text-emerald-400 max-w-[150px] truncate">{loggedInUser.name}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. AUTHENTICATION PROTECTION: MANDATORY ACCOUNT CREATION */}
      {!loggedInUser ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Informative column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-emerald-950/5 border border-emerald-950/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-extrabold text-lg text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse fill-emerald-600/10" />
                <span>¿Por qué es obligatorio tener cuenta?</span>
              </h3>
              
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="flex gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0 h-fit text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 font-semibold mb-0.5">Trazabilidad Total</strong>
                    Asociamos tu equipo a tu perfil para comunicarte los resultados del diagnóstico de 45 puntos críticos.
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0 h-fit text-emerald-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 font-semibold mb-0.5">Control del Período de Revisión</strong>
                    Podrás ver en tiempo real la cuenta regresiva del período de 10-15 días de revisión de tus equipos en tu panel privado.
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0 h-fit text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 font-semibold mb-0.5">Garantía de Confianza</strong>
                    Fomentamos un mercado circular transparente. Al verificar la identidad del vendedor, garantizamos que cada producto listado sea lícito y de alta fidelidad.
                  </div>
                </div>
              </div>
            </div>

            {/* Support Callout */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 flex gap-4 items-start">
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-white">¿Necesitas ayuda con tu envío?</p>
                <p className="text-slate-400 leading-normal">Ofrecemos recolector a domicilio gratuito una vez registrado el dispositivo. Si tienes dudas, contáctanos al número de soporte directo.</p>
                <span className="font-mono text-emerald-400 font-bold tracking-wider">+34 900 839 201</span>
              </div>
            </div>
          </div>

          {/* Account Creation / Login Form column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md">
            
            {/* Custom Tabs */}
            <div className="flex border-b border-slate-100 pb-4 mb-6">
              <button
                onClick={() => { setAuthType("register"); setAuthError(null); }}
                className={`flex-1 pb-2.5 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  authType === "register"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                1. Crear Cuenta Sostenible (Requerido)
              </button>
              <button
                onClick={() => { setAuthType("login"); setAuthError(null); }}
                className={`flex-1 pb-2.5 text-center text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  authType === "login"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                2. Ya tengo cuenta (Log In)
              </button>
            </div>

            {/* Error notifications */}
            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* 2a. REGISTER FORM */}
            {authType === "register" ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase font-mono">Nombre Completo *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Ej. Alejandra Gómez"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase font-mono">Correo Electrónico *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="ejemplo@correo.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase font-mono">Teléfono Móvil (Opcional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="+34 612 345 678"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase font-mono">Dirección de Envío / Recogida (Opcional)</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Calle, Ciudad, Código Postal"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase font-mono">Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase font-mono">Confirmar Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        placeholder="Repite la contraseña"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {authLoading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Creando cuenta y preparando portal...</span>
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4" />
                        <span>Crear Cuenta Sostenible & Ingresar</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-3">
                    Al registrarte, declaras que los equipos ofrecidos son de procedencia legítima y aceptas nuestros términos de reacondicionamiento técnico de 10-15 días.
                  </p>
                </div>
              </form>
            ) : (
              /* 2b. LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase font-mono">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase font-mono">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Tu contraseña secreta"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {authLoading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Autenticando usuario...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Iniciar Sesión & Ingresar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      ) : (
        /* 3. LOGGED IN PORTAL (SUBMIT FORM AND MY REVIEWED LISTINGS) */
        <div className="space-y-6">
          
          {/* Sub Navigation */}
          <div className="flex border-b border-slate-100 pb-3 mb-4 gap-4">
            <button
              onClick={() => setActiveSubTab("register")}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
                activeSubTab === "register"
                  ? "border-emerald-600 text-emerald-600 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Equipo</span>
            </button>
            <button
              onClick={() => { setActiveSubTab("my_listings"); fetchUserListings(); }}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center space-x-2 relative ${
                activeSubTab === "my_listings"
                  ? "border-emerald-600 text-emerald-600 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Mis Equipos en Revisión</span>
              {listings.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-emerald-600 text-white rounded-full font-bold">
                  {listings.length}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeSubTab === "register" ? (
              
              /* 3A. DEVICE SUBMISSION FORM */
              <motion.div
                key="register-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left explanation of the process */}
                <div className="lg:col-span-4 space-y-5">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 border border-slate-800">
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
                      <Cpu className="w-4 h-4 text-emerald-400" />
                      <span>Inspección de Confianza</span>
                    </div>
                    <h3 className="font-display font-bold text-base">Período de Revisión Obligatorio</h3>
                    <p className="text-xs text-slate-400 leading-normal">
                      Una vez registrado el equipo, se te asignará un servicio de recogida. Cuando llegue a nuestro laboratorio, nuestros ingenieros realizarán la calibración y el análisis:
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-2.5 font-sans">
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">1.</span>
                        <span>Desensamble y verificación de hardware genuino.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">2.</span>
                        <span>Análisis electroquímico de celdas de batería.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">3.</span>
                        <span>Medición y calibración de panel de visualización.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">4.</span>
                        <span>Estimación de CO2 evitado y firma del Certificado QR.</span>
                      </li>
                    </ul>
                    <div className="p-3 bg-slate-950 rounded-xl text-[10px] text-center text-emerald-400 font-semibold border border-slate-800/40">
                      ⏱️ Revisión Técnica: 10 a 15 días hábiles.
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start space-x-3 text-emerald-950">
                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                    <div className="text-xs space-y-1 leading-normal">
                      <span className="font-extrabold text-emerald-900 block">¡Gana EcoPuntos!</span>
                      <p>Por cada dispositivo que entregues con éxito para reacondicionamiento, sumaremos 500 EcoPuntos a tu perfil para canjear en compras directas.</p>
                    </div>
                  </div>
                </div>

                {/* Actual form */}
                <form onSubmit={handleDeviceSubmit} className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                  <h3 className="font-display font-extrabold text-lg text-slate-800 border-b border-slate-50 pb-2 flex items-center space-x-2">
                    <Laptop className="w-5 h-5 text-emerald-600" />
                    <span>Datos Técnicos del Dispositivo</span>
                  </h3>

                  {submitSuccess && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-3 animate-fade-in">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <strong className="block font-bold">¡Equipo registrado exitosamente!</strong>
                        <p className="text-emerald-600 mt-0.5">Estamos cargando tu panel de control de revisiones (10-15 días estimación).</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-mono">Nombre / Modelo exacto *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. HP EliteBook 840 G8"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={deviceData.name}
                        onChange={(e) => setDeviceData({...deviceData, name: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-mono">Categoría de Equipo *</label>
                      <select
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={deviceData.category}
                        onChange={(e) => setDeviceData({...deviceData, category: e.target.value})}
                      >
                        <option value="Laptops">Laptop / Ordenador Portátil</option>
                        <option value="Smartphones">Smartphone / Teléfono Móvil</option>
                        <option value="Tablets">Tablet / iPad</option>
                        <option value="Smartwatches">Smartwatch / Reloj Inteligente</option>
                        <option value="Consolas">Consola de Videojuegos</option>
                        <option value="Otros">Otro Dispositivo Tecnológico</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-mono">Precio de Venta Sugerido (USD) *</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          required
                          min="10"
                          max="5000"
                          placeholder="Ej. 450"
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all font-semibold"
                          value={deviceData.suggestedPrice}
                          onChange={(e) => setDeviceData({...deviceData, suggestedPrice: e.target.value})}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium">Nuestro equipo verificará el precio final según el diagnóstico físico.</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-mono">Salud Estimada de Batería (%) *</label>
                      <input
                        type="number"
                        required
                        min="50"
                        max="100"
                        placeholder="Ej. 92"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all font-mono"
                        value={deviceData.batteryHealth}
                        onChange={(e) => setDeviceData({...deviceData, batteryHealth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-mono">Procesador / CPU</label>
                      <input
                        type="text"
                        placeholder="Ej. Intel i7 / M1"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={deviceData.cpuStatus}
                        onChange={(e) => setDeviceData({...deviceData, cpuStatus: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-mono">Almacenamiento SSD/Flash</label>
                      <input
                        type="text"
                        placeholder="Ej. 512GB NVMe M.2"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={deviceData.storageStatus}
                        onChange={(e) => setDeviceData({...deviceData, storageStatus: e.target.value})}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-mono">Estado de Pantalla / Chasis</label>
                      <input
                        type="text"
                        placeholder="Ej. Excelente / Sin rayones"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all"
                        value={deviceData.screenStatus}
                        onChange={(e) => setDeviceData({...deviceData, screenStatus: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase font-mono">Descripción de estado y detalles físicos</label>
                    <textarea
                      rows={3}
                      placeholder="Indica el estado estético general, si tiene abolladuras, rasguños, o si funciona el teclado, puertos y accesorios que incluyes..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all resize-none"
                      value={deviceData.description}
                      onChange={(e) => setDeviceData({...deviceData, description: e.target.value})}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingDevice || submitSuccess}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      {submittingDevice ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>Guardando datos y calculando CO2...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Registrar Dispositivo & Iniciar Revisión de 10-15 Días</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              
              /* 3B. MY LISTINGS / TRACKING TIMELINE */
              <motion.div
                key="listings-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {listingsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                    <RotateCw className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-xs font-medium">Buscando tus equipos en revisión...</p>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-4">
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-full w-fit mx-auto">
                      <Clock className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-lg text-slate-800">No tienes equipos registrados</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Aún no has registrado ningún dispositivo de tu propiedad para reacondicionamiento y venta. ¡Empieza registrando tu primera laptop o smartphone!
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSubTab("register")}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Registrar mi primer equipo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {listings.map((item) => (
                      <div key={item.id} className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-2xs space-y-5">
                        
                        {/* Header details */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-50 pb-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                              ID: {item.id}
                            </span>
                            <h3 className="font-display font-extrabold text-lg text-slate-800">
                              {item.name}
                            </h3>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400 font-medium font-mono">
                              <span>Categoría: {item.category}</span>
                              <span>•</span>
                              <span>Sugerido: <span className="text-slate-700 font-bold font-sans">${item.suggestedPrice.toFixed(2)} USD</span></span>
                              <span>•</span>
                              <span>Registrado: {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          {/* CO2 Savings Tag */}
                          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-bold font-mono self-start flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                            <span>-{item.co2Saved}kg CO2 Estimado</span>
                          </div>
                        </div>

                        {/* Specs grid */}
                        <div className="bg-slate-50/50 border border-slate-100/70 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans mb-0.5">CPU/Procesador</span>
                            <span className="text-slate-800 font-bold block truncate">{item.specs.cpuStatus || "S/D"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans mb-0.5">Batería Original</span>
                            <span className="text-slate-800 font-bold block text-emerald-600 font-sans">{item.specs.batteryHealth || "S/D"} Salud</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans mb-0.5">Almacenamiento</span>
                            <span className="text-slate-800 font-bold block truncate">{item.specs.storageStatus || "S/D"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase font-sans mb-0.5">Pantalla / Chasis</span>
                            <span className="text-slate-800 font-bold block truncate">{item.specs.screenStatus || "S/D"}</span>
                          </div>
                        </div>

                        {/* Revision Status Timer block */}
                        <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-start space-x-3 text-amber-950">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                            <div className="text-xs space-y-1">
                              <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                                Estado: En Revisión Técnica Obligatoria ⏳
                              </span>
                              <p className="text-amber-850 leading-relaxed max-w-xl">
                                Tu equipo está en proceso de inspección exhaustiva de 45 puntos de control por parte de nuestro laboratorio. Esto garantiza que el comprador final reciba el equipo con absoluta confianza de calidad.
                              </p>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-amber-500/10 border border-amber-400/20 text-amber-700 rounded-xl text-center font-mono text-xs font-extrabold shrink-0 self-stretch md:self-auto flex flex-col justify-center">
                            <span className="text-[10px] text-amber-600 font-semibold block uppercase font-sans">Tiempo de Revisión Restante</span>
                            <span className="text-base font-black text-amber-850">{item.daysRemaining} Días Estimados</span>
                          </div>
                        </div>

                        {/* Progress Timeline Tracker */}
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Línea de Tiempo del Proceso de Confianza</span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                            {/* Step 1 */}
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>1. Registro</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 leading-tight block">Equipo dado de alta de manera segura en el sistema.</span>
                            </div>

                            {/* Step 2 */}
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>2. Envío Gratuito</span>
                              </div>
                              <span className="text-[10px] text-emerald-600 leading-tight block">Kit de envío emitido. Recolección en domicilio programada.</span>
                            </div>

                            {/* Step 3 */}
                            <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-xl space-y-1 relative overflow-hidden">
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                              <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs">
                                <RotateCw className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                                <span>3. Inspección</span>
                              </div>
                              <span className="text-[10px] text-amber-600 leading-tight block">Diagnóstico de 45 puntos críticos. Plazo de 10-15 días.</span>
                            </div>

                            {/* Step 4 */}
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 opacity-60">
                              <div className="flex items-center space-x-1.5 text-slate-500 font-bold text-xs">
                                <div className="w-3.5 h-3.5 border-2 border-slate-300 rounded-full"></div>
                                <span>4. Publicación</span>
                              </div>
                              <span className="text-[10px] text-slate-400 leading-tight block">Acreditación de certificado QR y listado en la tienda sostenible.</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
