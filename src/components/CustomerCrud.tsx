import React, { useState, useEffect } from "react";
import { 
  User, Mail, Phone, MapPin, Trash2, Edit2, Search, Plus, 
  PhoneCall, FileText, Check, HelpCircle, AlertCircle, RefreshCw, X, Copy
} from "lucide-react";
import { Customer } from "../types";

export default function CustomerCrud() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Form State for Create/Edit
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    trackingNumber: ""
  });
  
  // Notification State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let apiCustomers: Customer[] = [];
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          apiCustomers = await res.json();
        }
      } catch (err) {
        console.warn("No se pudo conectar al servidor, se usarán los datos locales únicamente:", err);
      }

      // Load local modifications/creations
      const localStr = localStorage.getItem("techreus_local_customers");
      const localCustomers: Customer[] = localStr ? JSON.parse(localStr) : [];

      // Load deleted list
      const deletedStr = localStorage.getItem("techreus_deleted_customers");
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];

      // Merge: API customers first, then apply/add local ones, and filter out deleted ones
      const mergedMap = new Map<string, Customer>();
      
      apiCustomers.forEach(c => {
        if (!deletedIds.includes(c.id)) {
          mergedMap.set(c.id, c);
        }
      });

      localCustomers.forEach(c => {
        if (!deletedIds.includes(c.id)) {
          mergedMap.set(c.id, c);
        }
      });

      const mergedList = Array.from(mergedMap.values());
      setCustomers(mergedList);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al procesar la lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      trackingNumber: `TR-2026-${Math.floor(10000 + Math.random() * 90000)}`
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address || "",
      trackingNumber: customer.trackingNumber || ""
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Por favor rellena los campos obligatorios (Nombre y Correo).");
      return;
    }

    try {
      let savedCustomer: Customer | null = null;
      let apiSucceeded = false;

      if (editingId) {
        // UPDATE Client
        try {
          const res = await fetch(`/api/customers/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
          if (res.ok) {
            savedCustomer = await res.json();
            apiSucceeded = true;
          }
        } catch (err) {
          console.warn("API update failed, updating locally:", err);
        }

        if (!savedCustomer) {
          const original = customers.find(c => c.id === editingId);
          savedCustomer = {
            id: editingId,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            trackingNumber: formData.trackingNumber || original?.trackingNumber || "",
            hasAccount: original?.hasAccount ?? false,
            password: original?.password ?? "",
            ecoPoints: original?.ecoPoints ?? 0,
            createdAt: original?.createdAt ?? new Date().toISOString()
          };
        }
      } else {
        // CREATE Client
        try {
          const res = await fetch("/api/customers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
          if (res.ok) {
            savedCustomer = await res.json();
            apiSucceeded = true;
          }
        } catch (err) {
          console.warn("API create failed, creating locally:", err);
        }

        if (!savedCustomer) {
          savedCustomer = {
            id: `c-${Date.now()}`,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            trackingNumber: formData.trackingNumber || `TR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            hasAccount: false,
            password: "",
            ecoPoints: 0,
            createdAt: new Date().toISOString()
          };
        }
      }

      if (savedCustomer) {
        // Save to localStorage list
        const localStr = localStorage.getItem("techreus_local_customers");
        const localCustomers: Customer[] = localStr ? JSON.parse(localStr) : [];
        const filtered = localCustomers.filter(c => c.id !== savedCustomer!.id && c.email.toLowerCase() !== savedCustomer!.email.toLowerCase());
        filtered.push(savedCustomer);
        localStorage.setItem("techreus_local_customers", JSON.stringify(filtered));

        // Remove from deleted list if it was there
        const deletedStr = localStorage.getItem("techreus_deleted_customers");
        let deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        deletedIds = deletedIds.filter(id => id !== savedCustomer!.id);
        localStorage.setItem("techreus_deleted_customers", JSON.stringify(deletedIds));
      }

      setSuccessMsg(editingId ? "Cliente actualizado exitosamente." : "Nuevo cliente registrado exitosamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
      
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || "Hubo un error al procesar la solicitud.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente permanentemente?")) return;
    
    try {
      try {
        await fetch(`/api/customers/${id}`, { method: "DELETE" });
      } catch (err) {
        console.warn("API delete failed, deleting locally:", err);
      }

      // Add to deleted IDs list so we filter it out of API results
      const deletedStr = localStorage.getItem("techreus_deleted_customers");
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem("techreus_deleted_customers", JSON.stringify(deletedIds));
      }

      // Remove from localStorage local list as well
      const localStr = localStorage.getItem("techreus_local_customers");
      let localCustomers: Customer[] = localStr ? JSON.parse(localStr) : [];
      localCustomers = localCustomers.filter(c => c.id !== id);
      localStorage.setItem("techreus_local_customers", JSON.stringify(localCustomers));
      
      setSuccessMsg("Cliente eliminado correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || "Error al eliminar.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic
  const filteredCustomers = customers.filter(c => {
    const term = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term)) ||
      (c.trackingNumber && c.trackingNumber.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner de Bienvenida y Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-800 tracking-tight">
            Gestión de Clientes y Pedidos
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Registra, edita, busca y administra el directorio de clientes concienciados de TechReus. Consulta guías de seguimiento y números de soporte.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchCustomers}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
            title="Refrescar Lista"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Cliente</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Left Column (CRUD) | Right Column (Support Contacts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CLIENT CRUD CONTAINER */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="relative bg-white p-2 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, teléfono o número de guía..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 outline-hidden py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg text-[10px]"
              >
                Limpiar
              </button>
            )}
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-2xs flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">Cargando base de datos de clientes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-xs font-semibold text-red-700">{error}</p>
              <button 
                onClick={fetchCustomers}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors"
              >
                Reintentar Conexión
              </button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-slate-700 font-bold text-sm">No se encontraron clientes</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                {searchQuery 
                  ? "Prueba refinando los términos de búsqueda o borrando el filtro actual." 
                  : "Aún no hay clientes registrados. Rellena los datos en la tienda al comprar o añade un registro manualmente."}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Ver todos los clientes
                </button>
              ) : (
                <button
                  onClick={handleOpenCreate}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Registrar Primer Cliente
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredCustomers.map((customer) => (
                <div 
                  key={customer.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 shadow-3xs transition-all duration-200 hover:shadow-2xs flex flex-col md:flex-row md:items-start md:justify-between gap-4"
                >
                  <div className="space-y-3 flex-1">
                    {/* Customer Identity Banner */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{customer.name}</h3>
                          {customer.hasAccount ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-[9px] font-bold text-indigo-700">
                              <span className="h-1 w-1 bg-indigo-500 rounded-full"></span>
                              Miembro ({customer.ecoPoints || 0} EcoPoints)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-full text-[9px] font-bold text-amber-700">
                              Compra Rápida (Sin Cuenta)
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono font-medium">ID: {customer.id}</span>
                      </div>
                    </div>

                    {/* Detailed info lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{customer.phone || <em className="text-slate-300">No especificado</em>}</span>
                      </div>
                      <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="leading-tight">{customer.address || <em className="text-slate-300">No especificada</em>}</span>
                      </div>
                    </div>

                    {/* Generated generic guide numbers */}
                    {customer.trackingNumber && (
                      <div className="pt-2 border-t border-slate-50 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Nº de Guía:</span>
                          <span className="text-xs font-mono font-bold text-emerald-700">{customer.trackingNumber}</span>
                          <button 
                            onClick={() => copyToClipboard(customer.trackingNumber || "", customer.id)}
                            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-sm transition-colors cursor-pointer"
                            title="Copiar Número de Guía"
                          >
                            {copiedId === customer.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Registro: {new Date(customer.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center md:flex-col gap-1.5 shrink-0 self-end md:self-start">
                    <button
                      onClick={() => handleOpenEdit(customer)}
                      className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg transition-all cursor-pointer flex-1 md:w-8 md:h-8 flex items-center justify-center"
                      title="Editar Cliente"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all cursor-pointer flex-1 md:w-8 md:h-8 flex items-center justify-center"
                      title="Eliminar Cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HELP AND SUPPORT HOTLINES COLUMNS (Números de ayudas) */}
        <div className="space-y-6">
          
          {/* Help Lines Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-sm border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400">
              <PhoneCall className="w-5 h-5" />
              <h2 className="font-display font-bold text-sm tracking-tight uppercase">Líneas de Ayuda y Soporte</h2>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Tienes problemas con tu compra, necesitas verificar la garantía de tus productos reacondicionados, o quieres reportar un incidente? Utiliza cualquiera de nuestros canales oficiales:
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Soporte Central España (Toll Free)</span>
                  <a href="tel:9008007387" className="text-xs font-bold font-mono hover:underline text-white block">
                    900 800 REUS (7387)
                  </a>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Correo de Atención Sostenible</span>
                  <a href="mailto:soporte@techreus.dev" className="text-xs font-bold font-mono hover:underline text-white block truncate">
                    soporte@techreus.dev
                  </a>
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">WhatsApp de Mensajería y Despachos</span>
                  <a href="https://wa.me/34611223344" target="_blank" rel="noopener noreferrer" className="text-xs font-bold font-mono hover:underline text-white block">
                    +34 611 223 344
                  </a>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/55 flex items-start gap-2.5">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-300 leading-normal">
                <strong>Horario de Atención:</strong> Lunes a Viernes de 9:00 a 18:00 (hora peninsular). El tiempo medio de respuesta en WhatsApp es de 10 minutos.
              </p>
            </div>
          </div>

          {/* Quick Stats or Tips */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 space-y-3">
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 font-mono block">¿Por qué usar el Nº de Guía?</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las guías de TechReus se asocian a transportistas certificados de emisiones de carbono compensadas neutras. Puedes rastrear el viaje ecológico de tu dispositivo en la sección de soporte.
            </p>
          </div>
        </div>

      </div>

      {/* FORM MODAL (CREATE / EDIT CLIENT) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={handleCloseForm}></div>
          
          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 z-10 animate-fade-in">
            {/* Form Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-display font-bold text-sm">
                {editingId ? "Editar Datos del Cliente" : "Registrar Nuevo Cliente"}
              </h3>
              <button 
                onClick={handleCloseForm}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Nombre Completo <span className="text-red-500">*</span></label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
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

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Correo Electrónico <span className="text-red-500">*</span></label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ej. correo@ejemplo.com"
                    required
                    className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Teléfono de Contacto</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
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

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Dirección de Despacho</label>
                <div className="relative flex items-start bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mr-2 mt-0.5 shrink-0" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej. Calle Mayor 12, Piso 3A, Madrid"
                    rows={2}
                    className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Número de Guía</label>
                <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <FileText className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    name="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={handleInputChange}
                    placeholder="Ej. TR-2026-94821"
                    className="w-full bg-transparent border-0 outline-hidden text-xs text-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Action Triggers */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {editingId ? "Guardar Cambios" : "Registrar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
