import { useState } from "react";
import { Laptop, ShieldCheck, DollarSign, Smartphone, Tablet, QrCode, Cpu, CheckCircle2, RotateCw, Sparkles, ExternalLink, Activity, Info, ChevronRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EcoTechInnovationProps {
}

export default function EcoTechInnovation({}: EcoTechInnovationProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>("laptop");
  const [testState, setTestState] = useState<"idle" | "testing" | "completed">("idle");
  const [testProgress, setTestProgress] = useState<number>(0);
  const [currentTestStep, setCurrentTestStep] = useState<string>("");
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [hasClaimedBonus, setHasClaimedBonus] = useState<boolean>(false);
  const [activeCertModal, setActiveCertModal] = useState<boolean>(false);

  const DEVICES_TO_TEST = [
    {
      id: "laptop",
      name: "HP EliteBook 840 G8",
      type: "Laptop Reacondicionada",
      specs: { cpu: "Intel Core i7 11va Gen", battery: "94% de capacidad original", storage: "512GB NVMe M.2 SSD", screen: "FHD IPS IPS 14 pulgadas" },
      serial: "EC-LT-840G8",
      co2Saved: 320,
    },
    {
      id: "phone",
      name: "iPhone 13 Pro Sostenible",
      type: "Smartphone Reacondicionado",
      specs: { cpu: "Apple A15 Bionic Hexa-Core", battery: "91% de capacidad original", storage: "128GB Flash NVMe", screen: "OLED Super Retina XDR" },
      serial: "EC-SP-I13P",
      co2Saved: 85,
    },
    {
      id: "tablet",
      name: "iPad Air 4 Eco-Certificada",
      type: "Tablet Reacondicionada",
      specs: { cpu: "Apple A14 Bionic Hexa-Core", battery: "92% de capacidad original", storage: "64GB Súper Flash", screen: "Liquid Retina de 10.9\"" },
      serial: "EC-TB-IPA4",
      co2Saved: 110,
    }
  ];

  const activeDeviceObj = DEVICES_TO_TEST.find((d) => d.id === selectedDevice) || DEVICES_TO_TEST[0];

  const startAutomatedDiagnostics = () => {
    setTestState("testing");
    setTestProgress(0);
    setTestLogs([]);
    
    const steps = [
      { prg: 10, log: "🔌 Iniciando calibración de energía y chequeo de voltaje...", label: "Batería" },
      { prg: 20, log: "🔋 Análisis electroquímico: Ciclos de batería verificados, salud al 92%+", label: "Batería" },
      { prg: 35, log: "🖥️ Inicializando barrido de píxeles y calibración cromática RGB...", label: "Pantalla" },
      { prg: 50, log: "✨ Escaneo táctil y digitalizador completo. Pantalla sin distorsiones.", label: "Pantalla" },
      { prg: 65, log: "💾 Test de lectura/escritura en celdas flash. Latencia óptima de acceso.", label: "Almacenamiento" },
      { prg: 80, log: "⚙️ Estrés de núcleos de procesador (CPU) y verificación térmica de pasta disipadora.", label: "Procesador" },
      { prg: 95, log: "🔒 Firmando digitalmente certificado de trazabilidad ecológico y enlace QR...", label: "Certificación" },
      { prg: 100, log: "✅ ¡Certificación completada con éxito! Dispositivo listo para re-circulación.", label: "Finalizado" }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        const current = steps[stepIdx];
        setTestProgress(current.prg);
        setCurrentTestStep(current.label);
        setTestLogs((prev) => [...prev, current.log]);
        stepIdx++;
      } else {
        clearInterval(interval);
        setTestState("completed");
        if (!hasClaimedBonus) {
          setHasClaimedBonus(true);
        }
      }
    }, 900);
  };

  return (
    <div className="space-y-12">
      {/* Upper header section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-full uppercase font-mono">
              <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Tecnología de Vanguardia</span>
            </span>
            <h1 className="font-display font-extrabold text-3xl text-slate-800 tracking-tight leading-none">
              EcoTech: Innovación y Certificación Digital
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              Combinamos automatización inteligente con un sistema exclusivo de diagnóstico y códigos QR de trazabilidad, asegurando que cada laptop, tablet y smartphone reacondicionado alcance los más altos estándares tecnológicos.
            </p>
          </div>
          <div className="shrink-0 p-4 bg-slate-900 text-white rounded-2xl flex items-center space-x-3.5">
            <QrCode className="w-8 h-8 text-emerald-400 stroke-[1.5]" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Trazabilidad</div>
              <p className="text-xs font-bold text-emerald-400">Verificado por Blockchain QR</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 1. Nuestra Solución (3 Columns) - Matching provided design perfectly */}
      <section className="space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="font-display font-extrabold text-xl text-slate-800">Nuestra Solución Tecnológica</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Solution Card 1 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                <Laptop className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">Plataforma Digital</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Un sistema tecnológico integral para la compra segura de dispositivos reacondicionados, diseñado para escalar en el mercado de manera eficiente.
              </p>
            </div>
            <div className="text-[10px] uppercase font-bold text-blue-600 font-mono tracking-wider pt-2 border-t border-slate-50 flex items-center">
              <span>Soporte Multi-dispositivo</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* Solution Card 2 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">Calidad Certificada</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cada dispositivo pasa por un diagnóstico automatizado exhaustivo, recibiendo una certificación digital exclusiva y total garantía de calidad técnica.
              </p>
            </div>
            <div className="text-[10px] uppercase font-bold text-indigo-600 font-mono tracking-wider pt-2 border-t border-slate-50 flex items-center">
              <span>Trazabilidad 100% transparente</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>

          {/* Solution Card 3 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <DollarSign className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800">Precios Accesibles</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Democratizamos el acceso a la tecnología premium ofreciendo equipos de alto rendimiento a una fracción del costo de un dispositivo nuevo.
              </p>
            </div>
            <div className="text-[10px] uppercase font-bold text-emerald-600 font-mono tracking-wider pt-2 border-t border-slate-50 flex items-center">
              <span>Ahorro del 60% vs Nuevo</span>
              <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Grid: 2. Modelo de Monetización - Matching provided images perfectly with custom accents */}
      <section className="space-y-6">
        <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h2 className="font-display font-extrabold text-xl text-slate-800">Modelo de Monetización</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Venta Directa - Blue border matching Image 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-t-4 border-t-blue-600 border border-slate-100 shadow-2xs space-y-6">
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-xl text-slate-800">Venta Directa</h3>
              <p className="text-sm text-slate-500">
                Comercialización de hardware reacondicionado de alta fidelidad con altos márgenes de ganancia y valor añadido sostenible.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                "Laptops, smartphones y tablets reacondicionados premium.",
                "Certificación técnica integral avalada por software de diagnóstico propio.",
                "Servicio técnico especializado y canales de atención post-venta.",
                "Venta cruzada de garantías extendidas y pólizas de protección premium."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-slate-700 text-sm">
                  <span className="text-blue-500 font-bold mt-0.5 font-mono select-none">❯</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Servicios Digitales - Green border matching Image 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-t-4 border-t-emerald-500 border border-slate-100 shadow-2xs space-y-6">
            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-xl text-slate-800">Servicios Digitales</h3>
              <p className="text-sm text-slate-500">
                Generación de ingresos recurrentes y escalabilidad a través del ecosistema tecnológico y software de certificación.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                "Marketplace digital circular que cobra comisiones por transacción.",
                "Suscripción mensual de mantenimiento preventivo y correctivo (Tech as a Service).",
                "Venta cruzada inteligente de accesorios biodegradables y complementos ecológicos.",
                "Licenciamiento de nuestro software exclusivo de certificación técnica a terceros."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-slate-700 text-sm">
                  <span className="text-emerald-500 font-bold mt-0.5 font-mono select-none">❯</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Tool: Simulador de Diagnóstico y Certificación QR */}
      <section className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg space-y-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-mono">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Simulador de Certificación en Vivo</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-white">Consola de Diagnóstico Inteligente</h3>
            <p className="text-slate-400 text-xs max-w-xl">
              Selecciona uno de nuestros equipos modelo y ejecuta el diagnóstico automatizado de 45 puntos críticos. Verás los logs de hardware en tiempo real y emitiremos el código QR de trazabilidad digital.
            </p>
          </div>

          {/* Quick Cert Tag */}
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 rounded-2xl flex items-center space-x-2 text-xs font-semibold self-start lg:self-auto">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse fill-blue-400/10" />
            <span>{hasClaimedBonus ? "Calibración Completada" : "Inicia la Calibración Técnica"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pick Device & Hardware details Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">1. Seleccionar Dispositivo Reacondicionado</label>
              <div className="space-y-2.5">
                {DEVICES_TO_TEST.map((dev) => {
                  const isSelected = selectedDevice === dev.id;
                  return (
                    <div
                      key={dev.id}
                      onClick={() => {
                        if (testState !== "testing") {
                          setSelectedDevice(dev.id);
                          setTestState("idle");
                          setTestProgress(0);
                          setTestLogs([]);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      } ${testState === "testing" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-500"}`}>
                          {dev.id === "laptop" ? <Laptop className="w-4 h-4" /> : dev.id === "phone" ? <Smartphone className="w-4 h-4" /> : <Tablet className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{dev.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium font-mono">{dev.type}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-sm font-mono text-emerald-400 font-bold">
                        -{dev.co2Saved}kg CO2
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hardware specifications details block */}
            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Componentes Analizados por el Software</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400 font-mono">
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                  <span className="text-[9px] text-slate-500 block font-bold">NÚCLEO CPU</span>
                  <span className="text-slate-200 block truncate">{activeDeviceObj.specs.cpu}</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                  <span className="text-[9px] text-slate-500 block font-bold">CAPACIDAD BATERÍA</span>
                  <span className="text-slate-200 block truncate">{activeDeviceObj.specs.battery}</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                  <span className="text-[9px] text-slate-500 block font-bold">ALMACENAMIENTO</span>
                  <span className="text-slate-200 block truncate">{activeDeviceObj.specs.storage}</span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                  <span className="text-[9px] text-slate-500 block font-bold">PANTALLA / PANEL</span>
                  <span className="text-slate-200 block truncate">{activeDeviceObj.specs.screen}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Console Logs & QR Code Generation Column */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-850 p-4 font-mono text-xs flex flex-col justify-between min-h-[220px]">
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-850 text-slate-500 text-[10px] font-bold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span className="text-slate-400">ECOTECH-DIAGNOSTIC-SHELL v2.4</span>
                </span>
                <span className="text-slate-500">SERIAL: {activeDeviceObj.serial}</span>
              </div>

              {/* Logs area */}
              <div className="flex-1 py-3 overflow-y-auto space-y-2 max-h-[140px] text-slate-300 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {testState === "idle" && (
                  <div className="text-slate-500 italic flex items-center justify-center h-full text-center">
                    Listo para comenzar el test de calibración automática. Haga clic en &quot;Ejecutar Diagnóstico&quot; abajo.
                  </div>
                )}
                
                {testLogs.map((log, index) => (
                  <div key={index} className="leading-tight animate-fade-in text-[11px]">
                    <span className="text-slate-600 select-none">[{index + 1}] </span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              {/* Testing progress bar */}
              {testState === "testing" && (
                <div className="pt-2 border-t border-slate-850 space-y-1.5 shrink-0">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                    <span>Módulo Evaluado: {currentTestStep}</span>
                    <span className="text-emerald-400 font-black animate-pulse">{testProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-350"
                      style={{ width: `${testProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Completed Certificate Details */}
              {testState === "completed" && (
                <div className="pt-3 border-t border-slate-850 shrink-0 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-bold flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1 shrink-0" />
                    <span>Dispositivo 100% Sostenible y Verificado</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Emitido: {new Date().toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Action panel triggers */}
            <div className="flex items-center space-x-3 shrink-0">
              {testState !== "testing" ? (
                <button
                  onClick={startAutomatedDiagnostics}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 animate-pulse" />
                  <span>{testState === "completed" ? "Re-ejecutar Diagnóstico" : "Ejecutar Diagnóstico"}</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 py-3 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center space-x-1.5"
                >
                  <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Analizando hardware de {activeDeviceObj.name}...</span>
                </button>
              )}

              {testState === "completed" && (
                <button
                  onClick={() => setActiveCertModal(true)}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-white" />
                  <span>Ver Certificado QR</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Digital Certificate Modal overlay */}
      <AnimatePresence>
        {activeCertModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setActiveCertModal(false)}
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white text-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-6"
            >
              {/* Ticket header */}
              <div className="text-center space-y-1 pb-4 border-b border-slate-100">
                <div className="inline-flex p-3 bg-emerald-50 text-emerald-700 rounded-full">
                  <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-display font-black text-xl text-slate-800">Certificado Digital de Calidad</h3>
                <p className="text-xs text-slate-400 font-mono">SERIE: {activeDeviceObj.serial}</p>
              </div>

              {/* QR and Carbon block */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Styled generated QR container */}
                <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center space-y-2 shrink-0 border border-slate-800 shadow-sm">
                  {/* Clean Mock QR Code Layout */}
                  <div className="relative w-28 h-28 bg-white p-2.5 rounded-xl flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=112x112&data=https://techreus.dev/cert/${activeDeviceObj.serial}`}
                      alt="EcoTech QR Cert"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[8px] font-mono font-bold tracking-widest text-emerald-400 uppercase">ESCANEAR VERIFICACIÓN</span>
                </div>

                {/* Device parameters verified logs */}
                <div className="flex-1 space-y-3 font-mono text-[11px] text-slate-600">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 font-sans block">Dispositivo</span>
                    <p className="text-slate-800 font-sans font-bold leading-tight">{activeDeviceObj.name}</p>
                    <span className="text-[9px] text-slate-400 block">{activeDeviceObj.type}</span>
                  </div>

                  <div className="border-t border-slate-100 pt-2 space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span>Salud Batería:</span>
                      <span className="font-bold text-emerald-600">{activeDeviceObj.specs.battery.split(" ")[0]} Original</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Procesador:</span>
                      <span className="font-bold text-slate-800">OK (Calibrado)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Almacenamiento:</span>
                      <span className="font-bold text-slate-800">OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha Certificado:</span>
                      <span className="font-bold text-slate-800">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Savings Statement */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start space-x-3 text-emerald-950">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs space-y-1 leading-normal">
                  <span className="font-extrabold text-emerald-900 block">Ahorro Ecológico Certificado:</span>
                  <p>
                    Comprar este dispositivo reacondicionado en lugar de uno nuevo evita la emisión de{" "}
                    <span className="font-black text-emerald-700">-{activeDeviceObj.co2Saved} kg de CO2</span> a la atmósfera y previene la minería intensiva de silicio, oro y cobalto.
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setActiveCertModal(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Cerrar Certificado
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
