import React from "react";
import { motion } from "framer-motion";

// IMPORTANT: WhatsApp requires full international format without "+" or leading zeros.
// Example: if your country code is +961 and your number is 70 898 080,
// the correct value would be "96170898080".
//
// You can override this via VITE_WHATSAPP_PHONE in your .env file.
const FALLBACK_WHATSAPP_NUMBER = "70898080"; // Local number from your request
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_PHONE || FALLBACK_WHATSAPP_NUMBER).replace(
  /\D/g,
  ""
);

const WhatsAppFloatingButton: React.FC = () => {
  // Cute, friendly default message
  const message =
    "Hi CURLEA team! I have a quick question about your products and offers.";

  const encodedMessage = encodeURIComponent(message);

  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1200] md:bottom-6 md:right-6 pointer-events-none">
      <motion.button
        type="button"
        onClick={handleClick}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-xl px-3 py-2 md:px-4 md:py-2.5 hover:bg-[#1ebe5a] transition-colors duration-200"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Chat with us on WhatsApp"
      >
        {/* WhatsApp icon (SVG) */}
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M16.01 3.2C9.57 3.2 4.36 8.41 4.36 14.85c0 2.58.9 4.95 2.4 6.84L4 28.8l7.39-2.68c1.8 1 3.87 1.55 6.06 1.55 6.44 0 11.65-5.21 11.65-11.65C29.1 8.41 22.85 3.2 16.41 3.2h-.4zm0 2.13h.35c5.3.14 9.52 4.48 9.52 9.82 0 5.42-4.4 9.82-9.82 9.82-1.9 0-3.7-.55-5.23-1.5l-.37-.23-4.38 1.58 1.58-4.38-.24-.37a9.76 9.76 0 0 1-1.57-5.12c0-5.42 4.4-9.82 9.82-9.82z" />
            <path d="M12.9 10.61c-.2-.46-.42-.47-.62-.48h-.53c-.18 0-.47.07-.72.35-.25.28-.95.92-.95 2.25 0 1.33.98 2.62 1.12 2.8.14.19 1.9 3.04 4.7 4.14 2.32.92 2.79.74 3.29.7.5-.04 1.62-.66 1.85-1.3.23-.65.23-1.2.16-1.31-.07-.11-.25-.18-.53-.32-.28-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.62.14-.19.28-.72.89-.88 1.07-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.66-1.56-1.94-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.61-1.5-.86-2.06z" />
          </svg>
        </span>
        {/* Cute helper text (hidden on very small screens) */}
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-[11px] font-semibold leading-tight">
            Need help?
          </span>
          <span className="text-[10px] leading-tight opacity-90">
            Chat with us on WhatsApp 💬
          </span>
        </div>
      </motion.button>
    </div>
  );
};

export default WhatsAppFloatingButton;


