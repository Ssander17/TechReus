import { Leaf, ShoppingBag, Trophy, Menu, X } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  cartCount,
  onCartClick,
}: HeaderProps) {
  const navItems = [
    { id: "store", label: "Tienda Sostenible" },
    { id: "ecotech", label: "EcoTech Innovación" },
    { id: "sell", label: "Vender mi Equipo" },
    { id: "customers", label: "Gestión Clientes" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={() => setActiveTab("store")}
          >
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl transition-all duration-300 group-hover:scale-110">
              <Leaf className="w-5 h-5 fill-emerald-600/20" />
            </div>
            <span className="font-display font-extrabold text-xl text-slate-800 tracking-tight">
              Tech<span className="text-emerald-600">Reus</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Section: Cart */}
          <div className="flex items-center space-x-3">
            {/* Shopping Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-600 rounded-xl transition-colors shadow-2xs"
              aria-label="Carrito de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
