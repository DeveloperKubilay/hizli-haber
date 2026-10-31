import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function AuthModal({ isOpen, onClose, onGoogleSignIn, isProcessing }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Logo & Başlık */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/15 text-secondary mb-3">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Hızlı Haber'e Giriş</h2>
            <p className="text-gray-400 text-sm">
              Haberleri kaydetmek, yorum yapmak ve etkileşimde bulunmak için giriş yapın.
            </p>
          </div>

          {/* Google Butonu */}
          <button
            onClick={onGoogleSignIn}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-5 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isProcessing ? 'Giriş yapılıyor...' : 'Google ile Devam Et'}</span>
          </button>

          {/* Açık Rıza ve KVKK Aydınlatma Kutusu */}
          <div className="bg-gray-800/60 border border-gray-800 rounded-xl p-4 text-xs leading-relaxed text-gray-400">
            <p className="mb-2">
              <strong className="text-gray-200">KVKK Aydınlatması:</strong> Google ile giriş yaptığınızda yalnızca adınız, e-posta adresiniz ve profil fotoğrafınız işlenir. Şifreniz asla sistemimizde tutulmaz.
            </p>
            <p>
              Giriş butonuna tıklayarak{' '}
              <Link
                to="/hizmet-sartlari"
                onClick={onClose}
                className="text-secondary hover:underline font-medium"
              >
                Hizmet Şartları
              </Link>
              'nı ve{' '}
              <Link
                to="/gizlilik-politikasi"
                onClick={onClose}
                className="text-secondary hover:underline font-medium"
              >
                KVKK Aydınlatma Metni
              </Link>
              'ni okuyup kabul ettiğinizi beyan etmiş olursunuz.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AuthModal;
