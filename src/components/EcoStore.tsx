import { useState, useEffect } from "react";
import { Product } from "../types";
import { Sparkles, Star, ShieldCheck, ShoppingCart, QrCode, Cpu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_PRODUCTS } from "../data";

interface EcoStoreProps {
  onAddToCart: (product: Product) => void;
}

export default function EcoStore({
  onAddToCart,
}: EcoStoreProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechProduct, setSelectedTechProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("API not available");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Error fetching products, using local fallback:", err);
        setProducts(DEFAULT_PRODUCTS);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products;

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-radial from-emerald-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-15 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/25 border border-emerald-400/30 rounded-full text-xs font-semibold tracking-wide uppercase text-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tecnología Sostenible</span>
          </span>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
            Tecnología premium que <br className="hidden sm:block" />
            <span className="text-emerald-400">cuida el planeta</span>
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            Cada compra de tecnología sostenible acumula ahorros ecológicos reales de CO2 y evita que residuos valiosos terminen en vertederos.
          </p>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="font-display font-extrabold text-2xl text-slate-800 tracking-tight">Catálogo de Tecnología Verde</h2>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl h-80"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-400">No hay productos disponibles en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full relative"
              >
                {/* Image & Category Tag */}
                <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] font-bold rounded-md uppercase shadow-2xs tracking-wider w-fit">
                      {product.category}
                    </span>
                    {product.isEcoTech && (
                      <span className="px-2 py-0.5 bg-blue-600/90 backdrop-blur-xs text-white text-[9px] font-extrabold rounded-md uppercase tracking-wider flex items-center space-x-1 shadow-2xs w-fit">
                        <Cpu className="w-2.5 h-2.5 animate-pulse" />
                        <span>EcoTech Certificado</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Rating Badge */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-md flex items-center space-x-0.5 shadow-2xs">
                    <Star className="w-3 h-3 fill-white text-white" />
                    <span>{product.rating}</span>
                  </span>
                </div>

                {/* Info Container */}
                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Ecological Impact Detail Banner */}
                  <div className={`rounded-xl p-3 border flex items-start space-x-2 ${
                    product.isEcoTech 
                      ? "bg-blue-50/50 border-blue-100/60" 
                      : "bg-emerald-50/50 border-emerald-100/60"
                  }`}>
                    <ShieldCheck className={`w-4 h-4 mt-0.5 shrink-0 ${product.isEcoTech ? "text-blue-600" : "text-emerald-600"}`} />
                    <div className={`text-[11px] leading-normal font-medium ${product.isEcoTech ? "text-blue-800" : "text-emerald-800"}`}>
                      <span className="font-bold">Efecto: </span> {product.impact}
                      <span className={`block mt-0.5 font-bold ${product.isEcoTech ? "text-blue-600" : "text-emerald-600"}`}>
                        -{product.co2Saved.toFixed(2)} kg CO2 evitado
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50 shrink-0 gap-2">
                    <div className="font-display text-slate-800 shrink-0">
                      <span className="text-xs font-semibold text-slate-400">USD</span>{" "}
                      <span className="text-lg sm:text-xl font-bold">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                      {product.isEcoTech && (
                        <button
                          onClick={() => setSelectedTechProduct(product)}
                          className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-3xs transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Ver Diagnóstico Técnico QR"
                        >
                          <QrCode className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Diagnóstico</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => onAddToCart(product)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Añadir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW SECTION: High Conversion Payment Gateway Showcase Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-0"></div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4 text-left">
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Checkout 100% Sostenible y Seguro</span>
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-tight">
              Compra con <span className="text-emerald-400">Pasarela Sostenible 2.0</span> de un solo toque
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Diseñamos la mejor experiencia de pago ecológica para tu comodidad. Elige entre registrar tu cuenta en 5 segundos para ganar recompensas o pagar de inmediato sin cuentas adicionales.
            </p>

            {/* Feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Compra Rápida:</strong> Sin contraseñas ni demoras</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Cuenta de Miembro:</strong> 5% Off + 100 EcoPoints</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Seguridad Bancaria:</strong> Certificado SSL de 256 bits</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Envíos Neutros:</strong> Transporte CO₂ neutral certificado</span>
              </div>
            </div>
          </div>

          {/* Visual Interactive Credit Card Mockup Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3.5 w-full">
            <div className="relative w-full max-w-[280px] h-36 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-indigo-800 p-4 shadow-xl border border-emerald-500/20 text-white flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start">
                <div className="space-y-0.5 text-left">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-300">GreenPay Network</span>
                  <span className="text-[7px] text-slate-200 block">Carbono Compensado</span>
                </div>
                <div className="font-mono text-[10px] font-black uppercase text-emerald-200 tracking-wider">VISA GREEN</div>
              </div>
              <div className="font-mono text-xs tracking-widest text-center py-2">
                4000 •••• •••• 9872
              </div>
              <div className="flex justify-between items-center text-[8px] font-mono text-left">
                <div>
                  <span className="text-slate-400 uppercase text-[6px]">Eco-Miembro</span>
                  <span className="block font-bold">CLIENTE ECO-COMPROMETIDO</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase text-[6px]">Ahorro CO₂</span>
                  <span className="block font-bold">-14.5 kg</span>
                </div>
              </div>
            </div>

            {/* Simulated Checkout Channels mini-grid */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Tarjeta Bancaria</span>
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-teal-400 font-bold">Bizum</span>
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 font-semibold text-sky-400">PayPal</span>
              <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-white font-bold"> Pay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Product Diagnostic Modal */}
      <AnimatePresence>
        {selectedTechProduct && selectedTechProduct.diagnostics && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setSelectedTechProduct(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white text-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 text-blue-600 font-bold text-xs font-mono uppercase">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>Calidad Certificada</span>
                  </div>
                  <h3 className="font-display font-extrabold text-lg text-slate-800 leading-tight">
                    {selectedTechProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTechProduct(null)}
                  className="p-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR and Details layout */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Styled generated QR container */}
                <div className="p-3 bg-slate-950 rounded-2xl flex flex-col items-center justify-center space-y-1.5 shrink-0 border border-slate-800 shadow-xs">
                  <div className="relative w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=https://techreus.dev/cert/${selectedTechProduct.diagnostics.serialNumber}`}
                      alt="Device QR Certificate"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[7.5px] font-mono font-black tracking-widest text-emerald-400 uppercase">QR VERIFICADO</span>
                </div>

                {/* Device parameters verified logs */}
                <div className="flex-1 space-y-3 font-mono text-[11px] text-slate-600 w-full">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Código Serial</span>
                    <p className="text-slate-900 font-bold font-sans">{selectedTechProduct.diagnostics.serialNumber}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span>Procesador:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[130px]">{selectedTechProduct.diagnostics.cpuStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Salud Batería:</span>
                      <span className="font-bold text-emerald-600">{selectedTechProduct.diagnostics.batteryHealth}% Original</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pantalla:</span>
                      <span className="font-bold text-slate-800 truncate max-w-[130px]">{selectedTechProduct.diagnostics.screenStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Almacenamiento:</span>
                      <span className="font-bold text-slate-800">{selectedTechProduct.diagnostics.storageStatus.split(" ")[0]} SSD OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha Diagnóstico:</span>
                      <span className="font-bold text-slate-800">{selectedTechProduct.diagnostics.certifiedDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Savings Statement */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start space-x-3 text-emerald-950">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs space-y-1 leading-normal">
                  <span className="font-extrabold text-emerald-900 block">Compromiso Ambiental Certificado:</span>
                  <p>
                    Evitas un aproximado de <span className="font-black text-emerald-700">-{selectedTechProduct.diagnostics.co2SavedProduction} kg de CO2</span> en fabricación primaria, lo que equivale a plantar 15 árboles medianos.
                  </p>
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTechProduct(null);
                    onAddToCart(selectedTechProduct);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Comprar Sostenible</span>
                </button>
                <button
                  onClick={() => setSelectedTechProduct(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
