/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Header from "./components/Header";
import EcoStore from "./components/EcoStore";
import EcoTechInnovation from "./components/EcoTechInnovation";
import EcoAsistente from "./components/EcoAsistente";
import CustomerCrud from "./components/CustomerCrud";
import ShoppingCartOverlay from "./components/ShoppingCartOverlay";
import EcoSellerPortal from "./components/EcoSellerPortal";
import { Product, CartItem, Customer } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Facebook, Instagram } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("store");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<Customer | null>(null);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
    // Open cart for immediate visual confirmation
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9f6] text-slate-800 font-sans">
      {/* Universal Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Main content grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === "store" && (
              <EcoStore
                onAddToCart={handleAddToCart}
              />
            )}

            {activeTab === "ecotech" && (
              <EcoTechInnovation />
            )}

            {activeTab === "sell" && (
              <EcoSellerPortal
                loggedInUser={loggedInUser}
                setLoggedInUser={setLoggedInUser}
              />
            )}

            {activeTab === "customers" && (
              <CustomerCrud />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} TechReus • Conectando la comunidad tecnológica por un planeta más limpio y sostenible.
          </p>
          <div className="flex justify-center items-center flex-wrap gap-x-3 gap-y-1.5 text-[10px] text-slate-400 font-medium">
            <span>Privacidad</span>
            <span>•</span>
            <span>Términos</span>
            <span>•</span>
            <span>Eco-Comercio</span>
            <span>•</span>
            <a
              href="https://www.facebook.com/profile.php?id=61591181774608"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 inline-flex align-middle"
              title="Siguenos en Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook</span>
            </a>
            <span>•</span>
            <a
              href="https://www.instagram.com/techreuse.ec/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 inline-flex align-middle"
              title="Siguenos en Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Cart Slider Overlay */}
      <ShoppingCartOverlay
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
      />

      {/* Floating AI Assistant Chatbot */}
      <EcoAsistente />
    </div>
  );
}
