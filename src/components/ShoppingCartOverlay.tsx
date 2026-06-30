import { CartItem, Product, Customer } from "../types";
import { 
  X, Trash2, Plus, Minus, ShieldCheck, AlertCircle, 
  ShoppingBag, ArrowLeft, User, Mail, Phone, MapPin, Check, Copy, PhoneCall,
  Lock, CreditCard, Wallet, Smartphone, Gift, UserPlus, LogIn, Percent
} from "lucide-react";
import React, { useState } from "react";

interface ShoppingCartOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  loggedInUser: Customer | null;
  setLoggedInUser: (user: Customer | null) => void;
}

export default function ShoppingCartOverlay({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  loggedInUser,
  setLoggedInUser,
}: ShoppingCartOverlayProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'registration' | 'success'>('cart');
  const [checkoutType, setCheckoutType] = useState<'guest' | 'create_account' | 'login'>('guest');
  
  // Registration / Guest Info
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: ""
  });

  // Login Info
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bizum' | 'paypal' | 'applepay'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: ""
  });
  const [bizumPhone, setBizumPhone] = useState("");
  const [cardFocused, setCardFocused] = useState(false);

  // User States
  const [loading, setLoading] = useState<boolean>(false);
  const [registeredCustomer, setRegisteredCustomer] = useState<Customer | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Pricing & Impact Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalCo2Saved = cart.reduce((acc, item) => acc + item.product.co2Saved * item.quantity, 0);
  
  // Discount System (5% off for registering or being logged in)
  const isEligibleForDiscount = checkoutType === 'create_account' || loggedInUser !== null;
  const discountAmount = isEligibleForDiscount ? subtotal * 0.05 : 0;
  const discountedSubtotal = subtotal - discountAmount;

  // Sustainable courier delivery fee
  const shippingFee = discountedSubtotal > 30 ? 0 : 2.50;
  const grandTotal = Math.max(0, discountedSubtotal + shippingFee);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'number') {
      // Format 16 digits into blocks of 4
      value = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
    } else if (name === 'expiry') {
      // Format MM/YY
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      value = value.substring(0, 5);
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 3);
    }
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Contraseña o correo incorrectos.");
      }

      const user = await res.json();
      setLoggedInUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        password: ""
      });
      // Switch back to "guest" checkout mode since they are now authenticated
      setCheckoutType('guest');
    } catch (err: any) {
      setAuthError(err.message || "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      password: ""
    });
  };

  const handleCheckout = () => {
    setCheckoutStep('registration');
  };

  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Por favor, ingrese su nombre y correo electrónico.");
      return;
    }

    if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.holder || !cardDetails.expiry || !cardDetails.cvv)) {
      alert("Por favor, complete los datos de su tarjeta para la pasarela segura.");
      return;
    }

    if (paymentMethod === 'bizum' && !bizumPhone) {
      alert("Por favor, proporcione su número de móvil para Bizum.");
      return;
    }

    setLoading(true);
    try {
      const trackingNumber = `TR-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        trackingNumber,
        hasAccount: checkoutType === 'create_account' || !!loggedInUser,
        password: checkoutType === 'create_account' ? formData.password : (loggedInUser ? loggedInUser.password : ""),
        ecoPoints: checkoutType === 'create_account' ? 100 : (loggedInUser ? (loggedInUser.ecoPoints || 0) + 20 : 0) // Earn points for purchasing!
      };

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo registrar la compra con tus datos.");
      }

      const data = await res.json();
      setRegisteredCustomer(data);
      setCheckoutStep('success');
    } catch (err: any) {
      alert(err.message || "Error al procesar la compra.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTracking = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDone = () => {
    setCheckoutStep('cart');
    setFormData({ name: "", email: "", phone: "", address: "", password: "" });
    setLoginData({ email: "", password: "" });
    setCardDetails({ number: "", holder: "", expiry: "", cvv: "" });
    setBizumPhone("");
    setRegisteredCustomer(null);
    onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-slate-950 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="font-display font-extrabold text-sm uppercase tracking-wider">
                {checkoutStep === 'cart' && "Carrito Ecológico"}
                {checkoutStep === 'registration' && "Pasarela Sostenible"}
                {checkoutStep === 'success' && "Orden Confirmada"}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: CART ITEMS */}
          {checkoutStep === 'cart' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {cart.length === 0 ? (
                <div className="flex-1 p-6 text-center flex flex-col justify-center items-center space-y-4 bg-slate-50/50">
                  <div className="p-4 bg-slate-100 rounded-full text-slate-400">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-bold text-slate-700 text-sm">Tu carrito está vacío</h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-normal">
                    Agrega productos de tecnología verde reacondicionada y reduce de inmediato tu huella tecnológica.
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Items list */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {cart.map((item) => (
                      <div 
                        key={item.product.id}
                        className="flex items-center space-x-3.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                      >
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-xl shrink-0 border border-slate-100 shadow-3xs"
                        />
                        <div className="flex-1 space-y-1">
                          <h4 className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">{item.product.name}</h4>
                          <span className="text-[9px] text-emerald-600 block font-bold uppercase tracking-wider">{item.product.category}</span>
                          <span className="text-xs font-bold text-slate-900">${item.product.price.toFixed(2)}</span>
                        </div>

                        {/* Quantity triggers & remove */}
                        <div className="flex items-center space-x-1.5">
                          <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200/60 p-0.5">
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-white rounded-md cursor-pointer transition-colors"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-xs font-mono font-bold text-slate-700 px-1.5">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-white rounded-md cursor-pointer transition-colors"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <button 
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                            aria-label="Quitar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trust Badge/Conversion Incentive Section */}
                  <div className="mx-6 mb-4 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start space-x-3 shadow-3xs">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl">
                      <Percent className="w-4 h-4 animate-bounce" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-extrabold text-indigo-950 block">¿Quieres ahorrar un 5% extra?</span>
                      <p className="text-[10px] text-indigo-800 leading-normal">
                        Crea una cuenta gratuita de miembro durante el pago y recibe un **5% de descuento inmediato** y **100 EcoPoints** de bienvenida.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Environmental Impact section */}
                  <div className="bg-emerald-50/70 p-4 border-t border-b border-emerald-100 px-6 shrink-0 space-y-2">
                    <div className="flex items-center space-x-1.5 text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-extrabold">Eco-Resumen Certificado</span>
                    </div>
                    <p className="text-[11px] text-emerald-900 leading-normal">
                      Gracias a tu elección sostenible evitas residuos electrónicos y salvas un estimado de{" "}
                      <span className="font-extrabold text-emerald-700">-{totalCo2Saved.toFixed(2)} kg de CO₂</span>.
                    </p>
                  </div>

                  {/* Summary & Checkout footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4 shrink-0">
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal estimado</span>
                        <span className="font-mono font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Descuento de Miembro</span>
                        <span className="font-mono text-emerald-600 font-bold">-$0.00</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Envío Sostenible CO₂ Neutral</span>
                        <span className="font-mono">
                          {shippingFee === 0 ? <span className="text-emerald-600 font-bold uppercase text-[10px]">Gratis</span> : `$${shippingFee.toFixed(2)}`}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                        <span>Total de Compra</span>
                        <span className="font-mono text-base font-black">${(subtotal + shippingFee).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Proceder al Pago Seguro</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: PASARELA DE PAGO INTERACTIVA (Con / Sin Cuenta) */}
          {checkoutStep === 'registration' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-slate-50/30">
              <div className="p-6 space-y-5">
                <button
                  onClick={() => setCheckoutStep('cart')}
                  className="flex items-center text-slate-500 hover:text-slate-800 text-xs font-semibold gap-1 self-start cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al Carrito</span>
                </button>

                {/* Login Header State banner */}
                {loggedInUser ? (
                  <div className="bg-indigo-600 text-white rounded-2xl p-4 flex justify-between items-center shadow-3xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs">
                        {loggedInUser.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-indigo-200 block uppercase font-bold tracking-wider">Sesión Iniciada</span>
                        <p className="text-xs font-extrabold">{loggedInUser.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="text-[10px] bg-indigo-700 hover:bg-indigo-800 text-indigo-100 font-bold px-2 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      Salir
                    </button>
                  </div>
                ) : (
                  /* TAB SELECTION FOR CHECKOUT MODE */
                  <div className="bg-white p-1 rounded-xl border border-slate-200 flex justify-between text-center">
                    <button
                      onClick={() => { setCheckoutType('guest'); setAuthError(null); }}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        checkoutType === 'guest' ? 'bg-slate-900 text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Compra Rápida
                    </button>
                    <button
                      onClick={() => { setCheckoutType('create_account'); setAuthError(null); }}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        checkoutType === 'create_account' ? 'bg-slate-900 text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Crear Cuenta
                    </button>
                    <button
                      onClick={() => { setCheckoutType('login'); setAuthError(null); }}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        checkoutType === 'login' ? 'bg-slate-900 text-white shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                )}

                {/* LOGIN CONTAINER OR FORM DETAILS */}
                {checkoutType === 'login' && !loggedInUser ? (
                  <form onSubmit={handleLogin} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                    <div className="space-y-1 text-center pb-2">
                      <h4 className="font-display font-extrabold text-sm text-slate-800">Inicia sesión con tu cuenta</h4>
                      <p className="text-[11px] text-slate-400">Accede a tus datos de envío guardados y descuentos automáticos.</p>
                    </div>

                    {authError && (
                      <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Correo Electrónico *</label>
                      <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                        <input
                          type="email"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginInputChange}
                          required
                          placeholder="tucorreo@ejemplo.com"
                          className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Contraseña *</label>
                      <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                        <Lock className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                        <input
                          type="password"
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginInputChange}
                          required
                          placeholder="Tu contraseña"
                          className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Iniciar Sesión y Aplicar Envío</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* CHECKOUT & ADDRESS FORM (FOR GUEST / REGISTER) */
                  <form onSubmit={handleConfirmPurchase} className="space-y-4">
                    
                    {/* CUSTOMER PROFILE CARD FORM */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs space-y-4">
                      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                        <User className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                          {checkoutType === 'create_account' ? "Registro de Cuenta de Miembro" : "Detalles de Contacto de Envío"}
                        </h4>
                      </div>

                      {checkoutType === 'create_account' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-800 rounded-xl flex items-start gap-2">
                          <Gift className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>¡Excelente elección! Al registrarte ahorras 5% inmediato en esta compra y sumas 100 EcoPoints para tu próximo pedido.</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Nombre Completo *</label>
                        <div className="relative flex items-center bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5">
                          <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Ej. Alejandra Gómez"
                            required
                            className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Correo Electrónico *</label>
                          <div className="relative flex items-center bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5">
                            <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="correo@ejemplo.com"
                              required
                              disabled={loggedInUser !== null}
                              className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700 disabled:opacity-60"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Móvil de contacto</label>
                          <div className="relative flex items-center bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5">
                            <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Ej. +34 600 000 000"
                              className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password creation for account option */}
                      {checkoutType === 'create_account' && (
                        <div className="space-y-1 pt-1.5 border-t border-slate-100">
                          <label className="text-[9px] uppercase font-bold text-indigo-600 block tracking-wider">Crea tu Contraseña de Seguridad *</label>
                          <div className="relative flex items-center bg-indigo-50/50 border border-indigo-100 rounded-xl px-3 py-2.5">
                            <Lock className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Crea una contraseña segura"
                              required={checkoutType === 'create_account'}
                              className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700 focus:ring-0"
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 block leading-normal pt-1">
                            Tu contraseña te permitirá iniciar sesión, ver tu historial de despachos y tus EcoPoints ganados.
                          </span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Dirección de Entrega Sostenible *</label>
                        <div className="relative flex items-start bg-slate-50 border border-slate-150 rounded-xl px-3 py-2">
                          <MapPin className="w-4 h-4 text-slate-400 mr-2 mt-0.5 shrink-0" />
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Calle, Número, Piso, Código Postal, Ciudad"
                            required
                            rows={2}
                            className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CORE GORGEOUS PASARELA DE PAGO INTERACTIVA (SECURE PAYMENT GATEWAY) */}
                    <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                      
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Pasarela de Pago Segura SSL</span>
                        </div>
                        <span className="text-[9px] text-emerald-400 font-bold uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Banco-256bit
                        </span>
                      </div>

                      {/* Payment Method Selector Grid */}
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                            paymentMethod === 'card' 
                              ? 'bg-emerald-600 border-emerald-500 text-white font-bold' 
                              : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="text-[8px] uppercase tracking-wide">Tarjeta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bizum')}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                            paymentMethod === 'bizum' 
                              ? 'bg-emerald-600 border-emerald-500 text-white font-bold' 
                              : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                          <span className="text-[8px] uppercase tracking-wide">Bizum</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                            paymentMethod === 'paypal' 
                              ? 'bg-emerald-600 border-emerald-500 text-white font-bold' 
                              : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Wallet className="w-4 h-4" />
                          <span className="text-[8px] uppercase tracking-wide">PayPal</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('applepay')}
                          className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                            paymentMethod === 'applepay' 
                              ? 'bg-emerald-600 border-emerald-500 text-white font-bold' 
                              : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span className="text-[8px] uppercase tracking-wide">Apple Pay</span>
                        </button>
                      </div>

                      {/* Payment details form container */}
                      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                        {paymentMethod === 'card' && (
                          <div className="space-y-3.5">
                            {/* Live Interactive Card Graphic */}
                            <div className={`relative h-28 w-full rounded-xl bg-gradient-to-br from-emerald-600 to-indigo-800 p-4 text-white flex flex-col justify-between overflow-hidden shadow-md border border-emerald-500/20 transition-all duration-300 ${cardFocused ? 'scale-[1.02] ring-1 ring-emerald-400' : ''}`}>
                              <div className="flex justify-between items-start">
                                <span className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-200">TechReus GreenPay</span>
                                <div className="h-5 w-8 bg-white/20 rounded-md flex items-center justify-center text-[10px] font-mono tracking-tight text-white font-black">VISA</div>
                              </div>

                              <div className="font-mono text-sm tracking-widest text-center py-1">
                                {cardDetails.number || "•••• •••• •••• ••••"}
                              </div>

                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <div className="truncate pr-2">
                                  <span className="text-slate-300 text-[8px] block uppercase font-sans">Titular</span>
                                  <span className="truncate block font-bold uppercase">{cardDetails.holder || "NOMBRE EN TARJETA"}</span>
                                </div>
                                <div className="shrink-0 text-right">
                                  <span className="text-slate-300 text-[8px] block uppercase font-sans">Exp</span>
                                  <span className="font-bold">{cardDetails.expiry || "MM/YY"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Card inputs */}
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Número de Tarjeta</label>
                                <input
                                  type="text"
                                  name="number"
                                  value={cardDetails.number}
                                  onChange={handleCardInputChange}
                                  onFocus={() => setCardFocused(true)}
                                  onBlur={() => setCardFocused(false)}
                                  placeholder="4000 1234 5678 9010"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Nombre del Titular</label>
                                <input
                                  type="text"
                                  name="holder"
                                  value={cardDetails.holder}
                                  onChange={handleCardInputChange}
                                  onFocus={() => setCardFocused(true)}
                                  onBlur={() => setCardFocused(false)}
                                  placeholder="Ej. Alejandra Gómez"
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 uppercase focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Vencimiento</label>
                                  <input
                                    type="text"
                                    name="expiry"
                                    value={cardDetails.expiry}
                                    onChange={handleCardInputChange}
                                    onFocus={() => setCardFocused(true)}
                                    onBlur={() => setCardFocused(false)}
                                    placeholder="MM/YY"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 text-center focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">CVV (Código)</label>
                                  <input
                                    type="password"
                                    name="cvv"
                                    value={cardDetails.cvv}
                                    onChange={handleCardInputChange}
                                    onFocus={() => setCardFocused(true)}
                                    onBlur={() => setCardFocused(false)}
                                    placeholder="•••"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 text-center focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'bizum' && (
                          <div className="space-y-3.5 text-center">
                            <span className="text-[10px] text-slate-300 block leading-normal">
                              Paga de inmediato ingresando el número de móvil afiliado a tu banco. Te enviaremos una notificación instantánea de Bizum para confirmar.
                            </span>
                            <div className="space-y-1 text-left">
                              <label className="text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Número de Teléfono Bizum</label>
                              <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                                <Smartphone className="w-4 h-4 text-emerald-400 mr-2 shrink-0" />
                                <input
                                  type="tel"
                                  value={bizumPhone}
                                  onChange={(e) => setBizumPhone(e.target.value)}
                                  placeholder="Ej. 600 000 000"
                                  className="w-full bg-transparent border-0 outline-hidden text-xs text-white placeholder-slate-600 font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'paypal' && (
                          <div className="text-center py-2 space-y-2">
                            <span className="text-[10px] text-slate-300 block leading-normal">
                              Paga de forma rápida y segura vinculando tu monedero PayPal con nuestra pasarela de carbono neutro.
                            </span>
                            <button
                              type="button"
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold text-xs rounded-xl shadow-3xs inline-flex items-center space-x-1.5 cursor-pointer transition-colors"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>Conectar con PayPal</span>
                            </button>
                          </div>
                        )}

                        {paymentMethod === 'applepay' && (
                          <div className="text-center py-2 space-y-2">
                            <span className="text-[10px] text-slate-300 block leading-normal">
                              Usa Apple Pay para un checkout express con autenticación biométrica de un solo toque.
                            </span>
                            <button
                              type="button"
                              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-3xs inline-flex items-center space-x-1.5 cursor-pointer transition-colors"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Pagar con Apple Pay</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DYNAMIC REAL-TIME COST SUMMARY FOOTER IN CHECKOUT FORM */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs space-y-3 text-xs">
                      <span className="font-bold text-slate-800 block uppercase text-[10px] tracking-wider text-slate-400">Resumen Financiero</span>
                      <div className="space-y-1.5 text-slate-600">
                        <div className="flex justify-between">
                          <span>Subtotal de artículos</span>
                          <span className="font-mono text-slate-800">${subtotal.toFixed(2)}</span>
                        </div>
                        {isEligibleForDiscount && (
                          <div className="flex justify-between text-emerald-600 font-bold">
                            <span className="flex items-center gap-1">Descuento de Miembro (5%) <Percent className="w-3 h-3" /></span>
                            <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Envío Sostenible</span>
                          <span className="font-mono text-slate-700">
                            {shippingFee === 0 ? <span className="text-emerald-600 font-bold uppercase text-[9px]">Gratis</span> : `$${shippingFee.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-100">
                          <span>Total Neto a Pagar</span>
                          <span className="font-mono text-base font-black text-slate-950">${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <ShieldCheck className="w-4.5 h-4.5" />
                          <span>Pagar y Certificar Envío Ecológico</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CHECKOUT & TRACKING GUIDE */}
          {checkoutStep === 'success' && registeredCustomer && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 space-y-6">
              <div className="text-center space-y-4">
                <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center animate-bounce mx-auto">
                  <Check className="w-7 h-7 text-emerald-600 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-xl text-slate-800 tracking-tight">¡Pedido Confirmado!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Gracias por tu compra, <strong className="text-slate-700">{registeredCustomer.name}</strong>. Se ha generado la guía de transporte certificado.
                  </p>
                </div>
              </div>

              {/* GENERATED TRACKING GUIDE BOX */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">Guía de Seguimiento</span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span> Activo
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/40">
                  <span className="font-mono text-sm font-extrabold text-emerald-400 tracking-wide">
                    {registeredCustomer.trackingNumber}
                  </span>
                  <button
                    onClick={() => handleCopyTracking(registeredCustomer.trackingNumber || "")}
                    className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    title="Copiar guía"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-mono font-bold">{copied ? "Copiado" : "Copiar"}</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-300 leading-normal flex gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Copia este número para consultar el estado del despacho de baja huella de carbono con nuestros transportistas sostenibles.</span>
                </div>
              </div>

              {/* REGISTERED ADDRESS DETAILS */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block uppercase text-[10px] tracking-wider text-slate-400">Dirección de Despacho Registrada</span>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{registeredCustomer.address || "Retiro en Oficina / No especificado"}</span>
                </div>
              </div>

              {/* MEMBER REWARDS BANNER */}
              {registeredCustomer.hasAccount && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3 text-xs">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="font-bold text-indigo-950 block">¡Ganaste recompensas de Miembro!</span>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      Se han acreditado tus **{registeredCustomer.ecoPoints || 100} EcoPoints** en tu cuenta. Los podrás canjear por cupones de descuento y envíos gratis en futuras compras de tecnología verde.
                    </p>
                  </div>
                </div>
              )}

              {/* CUSTOMER SUPPORT CHANNELS (Números de ayudas) */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-3.5">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <PhoneCall className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Líneas de Ayuda y Soporte</span>
                </div>
                
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-emerald-100/50">
                    <span className="font-medium text-[11px]">Soporte Telefónico:</span>
                    <a href="tel:9008007387" className="font-mono font-bold hover:underline text-emerald-800">900 800 REUS</a>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-emerald-100/50">
                    <span className="font-medium text-[11px]">WhatsApp Express:</span>
                    <a href="https://wa.me/34611223344" target="_blank" rel="noopener noreferrer" className="font-mono font-bold hover:underline text-emerald-800">+34 611 223 344</a>
                  </div>
                  <div className="flex justify-between items-center bg-white/60 p-2 rounded-lg border border-emerald-100/50">
                    <span className="font-medium text-[11px]">Horario de Atención:</span>
                    <span className="font-medium text-emerald-800 text-[10px]">Lun-Vie 9:00 - 18:00</span>
                  </div>
                </div>
              </div>

              {/* Eco stats achieved */}
              <div className="bg-emerald-600 text-white rounded-2xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider opacity-85 block">Impacto Ambiental de tu compra:</span>
                  <span className="text-sm font-black">Emisiones de CO₂ Evitadas</span>
                </div>
                <div className="p-2 bg-emerald-700/60 rounded-xl text-center min-w-[70px] border border-emerald-500/30">
                  <span className="text-base font-black tracking-tight">-{totalCo2Saved.toFixed(1)} kg</span>
                </div>
              </div>

              <button
                onClick={handleDone}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Volver a la Tienda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
