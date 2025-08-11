import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, AlertTriangle, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function NotFound() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const iconFloatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="bg-tbackground min-h-screen">
      <Navbar />
      
      {/* Ana 404 İçeriği */}
      <motion.div 
        className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Büyük Sayı */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <motion.div
            variants={iconFloatVariants}
            initial="initial"
            animate="animate"
            className="inline-flex items-center justify-center w-32 h-32 mb-6 bg-primary rounded-full"
          >
            <AlertTriangle size={64} className="text-secondary" />
          </motion.div>
          
          <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-secondaryHover mb-4">
            404
          </h1>
        </motion.div>

        {/* Başlık ve Açıklama */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-textHeading mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-lg md:text-xl text-textPrimary mb-2 leading-relaxed">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <p className="text-base md:text-lg text-textPrimary opacity-75">
            Belki URL'yi yanlış yazdınız veya sayfa kaldırılmış olabilir.
          </p>
        </motion.div>

        {/* Aksiyon Butonları */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          variants={itemVariants}
        >
          <Link
            to="/"
            className="flex items-center gap-3 bg-secondary hover:bg-secondaryHover text-black font-bold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Home size={20} />
            Ana Sayfaya Dön
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 bg-primary hover:bg-primaryBG text-textPrimary font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft size={20} />
            Geri Git
          </button>

          <Link
            to="/haberler"
            className="flex items-center gap-3 bg-secondaryBG hover:bg-selectBox text-textHeading font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <BookOpen size={20} />
            Haberleri Görüntüle
          </Link>
        </motion.div>

        {/* Arama Önerisi */}
        <motion.div 
          className="bg-primary rounded-lg p-6 mb-8 border border-primaryBG"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-4">
            <Search size={24} className="text-secondary mr-2" />
            <h3 className="text-xl font-semibold text-textHeading">
              Aradığınızı Bulamadınız mı?
            </h3>
          </div>
          <p className="text-textPrimary mb-4">
            Aradığınız haberi bulmak için arama fonksiyonunu kullanabilirsiniz.
          </p>
          <Link
            to="/haberler?focus=search"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondaryHover text-black font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <Search size={18} />
            Haber Ara
          </Link>
        </motion.div>

        {/* Popüler Sayfalar */}
        <motion.div 
          className="bg-primary rounded-lg p-6 border border-primaryBG"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-textHeading mb-4">
            Popüler Sayfalar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/"
              className="p-4 bg-primaryBG hover:bg-blackSelectHover rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Home size={20} className="text-secondary group-hover:text-secondaryHover transition-colors" />
                <div className="text-left">
                  <h4 className="font-medium text-textHeading">Ana Sayfa</h4>
                  <p className="text-sm text-textPrimary">En son haberler</p>
                </div>
              </div>
            </Link>

            <Link
              to="/haberler"
              className="p-4 bg-primaryBG hover:bg-blackSelectHover rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-secondary group-hover:text-secondaryHover transition-colors" />
                <div className="text-left">
                  <h4 className="font-medium text-textHeading">Tüm Haberler</h4>
                  <p className="text-sm text-textPrimary">Kategorilere göre haberler</p>
                </div>
              </div>
            </Link>

            <Link
              to="/kaydettigim-haberler"
              className="p-4 bg-primaryBG hover:bg-blackSelectHover rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-secondary group-hover:text-secondaryHover transition-colors" />
                <div className="text-left">
                  <h4 className="font-medium text-textHeading">Kayıtlı Haberler</h4>
                  <p className="text-sm text-textPrimary">Favori haberleriniz</p>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}

export default NotFound;
