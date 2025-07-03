import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, Users, FileText, Eye, Cookie } from 'lucide-react';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Terms() {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const sectionVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-tbackground">
      <Navbar />
      
      <motion.div 
        className="max-w-4xl mx-auto px-6 py-12"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6 }}
      >
        {/* Başlık ve Geri Dönüş */}
        <motion.div 
          className="mb-8"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-secondary hover:text-secondaryHover transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Ana Sayfaya Dön
          </Link>
          
          <h1 className="text-4xl font-bold text-textHeading mb-4">
            Hizmet Şartları ve Kullanım Koşulları
          </h1>
          <p className="text-textPrimary text-lg">
            Son güncelleme: 3 Temmuz 2025
          </p>
        </motion.div>

        {/* Yapay Zeka İçerik Uyarısı */}
        <motion.div 
          className="bg-primaryBG border border-secondaryBG rounded-lg p-6 mb-8"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-secondary mt-1 flex-shrink-0" size={24} />
            <div>
              <h2 className="text-xl font-bold text-textHeading mb-3">
                Önemli: Yapay Zeka İçerik Uyarısı
              </h2>
              <p className="text-textPrimary leading-relaxed mb-3">
                Bu platformdaki haber içerikleri gerçek kaynaklardan alınmakta ancak yapay zeka teknolojileri tarafından işlenmekte ve düzenlenmektedir. 
                Bu işlem sırasında içeriklerde değişiklikler, eksiklikler veya yanlışlıklar oluşabilir.
              </p>
              <p className="text-textPrimary leading-relaxed">
                <strong className="text-textHeading">Önemli Not:</strong> Yapay zeka işleme sürecinde gerçeklikten sapma tesadüfidir. 
                Kritik kararlar alırken lütfen orijinal kaynaklardan doğrulama yapınız.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ana İçerik Bölümleri */}
        <div className="space-y-8">
          
          {/* Sorumluluk Reddi */}
          <motion.section 
            className="bg-primary rounded-lg p-6"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <Shield className="text-secondary mr-3" size={24} />
              <h2 className="text-2xl font-bold text-textHeading">1. Sorumluluk Reddi</h2>
            </div>
            <div className="space-y-4 text-textPrimary">
              <p>
                <strong className="text-textHeading">1.1.</strong> Hızlı Haber platformu, gerçek haber kaynaklarından alınan içerikleri yapay zeka teknolojileri kullanarak işlemektedir.
              </p>
              <p>
                <strong className="text-textHeading">1.2.</strong> Yapay zeka işleme sürecinde içeriklerde değişiklikler, çeviriler veya yorumlamalar yapılabilir ve bu değişikliklerden kaynaklanan yanlışlıklar tesadüfidir.
              </p>
              <p>
                <strong className="text-textHeading">1.3.</strong> Platform yöneticileri, yapay zeka işleme sürecinde oluşan değişiklikler veya hatalardan kaynaklanan herhangi bir zarar, maddi veya manevi hasardan sorumlu tutulamaz.
              </p>
              <p>
                <strong className="text-textHeading">1.4.</strong> İşlenmiş içeriklerin orijinal kaynak ile tam uyumu konusunda hiçbir garanti verilmez.
              </p>
            </div>
          </motion.section>

          {/* Kullanım Şartları */}
          <motion.section 
            className="bg-primary rounded-lg p-6"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-4">
              <FileText className="text-secondary mr-3" size={24} />
              <h2 className="text-2xl font-bold text-textHeading">2. Kullanım Şartları</h2>
            </div>
            <div className="space-y-4 text-textPrimary">
              <p>
                <strong className="text-textHeading">2.1.</strong> Bu platformu kullanarak, bu şartları kabul etmiş sayılırsınız.
              </p>
              <p>
                <strong className="text-textHeading">2.2.</strong> Platform sadece yasal amaçlarla kullanılmalıdır.
              </p>
              <p>
                <strong className="text-textHeading">2.3.</strong> İçerikleri paylaşırken, bunların yapay zeka tarafından işlendiğini ve orijinal kaynaktan farklılık gösterebileceğini belirtmeniz gerekmektedir.
              </p>
              <p>
                <strong className="text-textHeading">2.4.</strong> Platform üzerinden zararlı, yanıltıcı veya yasa dışı aktivitelerde bulunmak yasaktır.
              </p>
            </div>
          </motion.section>

          {/* Kullanıcı Sorumlulukları */}
          <motion.section 
            className="bg-primary rounded-lg p-6"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <Users className="text-secondary mr-3" size={24} />
              <h2 className="text-2xl font-bold text-textHeading">3. Kullanıcı Sorumlulukları</h2>
            </div>
            <div className="space-y-4 text-textPrimary">
              <p>
                <strong className="text-textHeading">3.1.</strong> Kullanıcılar, platformu kendi sorumluluklarında kullanır.
              </p>
              <p>
                <strong className="text-textHeading">3.2.</strong> İçeriklerin yapay zeka işleme sürecinden geçtiğini belirtmeden paylaşılması kullanıcının sorumluluğundadır.
              </p>
              <p>
                <strong className="text-textHeading">3.3.</strong> Üçüncü şahıslara verilecek zararlardan kullanıcı sorumludur.
              </p>
              <p>
                <strong className="text-textHeading">3.4.</strong> Hesap güvenliğinden kullanıcı sorumludur.
              </p>
            </div>
          </motion.section>

          {/* Gizlilik */}
          <motion.section 
            className="bg-primary rounded-lg p-6"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex items-center mb-4">
              <Eye className="text-secondary mr-3" size={24} />
              <h2 className="text-2xl font-bold text-textHeading">4. Gizlilik ve Veri Koruma</h2>
            </div>
            <div className="space-y-4 text-textPrimary">
              <p>
                <strong className="text-textHeading">4.1.</strong> Kullanıcı verilerinin korunması önceliğimizdir.
              </p>
              <p>
                <strong className="text-textHeading">4.2.</strong> Kişisel veriler KVKK kapsamında işlenir.
              </p>
              <p>
                <strong className="text-textHeading">4.3.</strong> Çerezler (cookies) kullanıcı deneyimini iyileştirmek için kullanılır.
              </p>
              <p>
                <strong className="text-textHeading">4.4.</strong> Üçüncü şahıslarla veri paylaşımı yapılmaz.
              </p>
            </div>
          </motion.section>

          {/* Telif Hakları */}
          <motion.section 
            className="bg-primary rounded-lg p-6"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center mb-4">
              <Cookie className="text-secondary mr-3" size={24} />
              <h2 className="text-2xl font-bold text-textHeading">5. Telif Hakları ve İçerik</h2>
            </div>
            <div className="space-y-4 text-textPrimary">
              <p>
                <strong className="text-textHeading">5.1.</strong> İçerikler gerçek kaynaklardan alınarak yapay zeka tarafından işlenmiştir.
              </p>
              <p>
                <strong className="text-textHeading">5.2.</strong> Platform tasarımı ve kodları telif hakkı koruması altındadır.
              </p>
              <p>
                <strong className="text-textHeading">5.3.</strong> İşlenmiş içeriklerin ticari amaçlı kullanımı önceden izin alınarak yapılmalıdır.
              </p>
              <p>
                <strong className="text-textHeading">5.4.</strong> Logo ve marka unsurları izinsiz kullanılamaz.
              </p>
            </div>
          </motion.section>

          {/* Değişiklikler */}
          <motion.section 
            className="bg-primaryBG rounded-lg p-6"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-textHeading mb-4">6. Şartların Değiştirilmesi</h2>
            <div className="space-y-4 text-textPrimary">
              <p>
                Bu şartlar önceden haber verilmeksizin değiştirilebilir. Değişiklikler sitede yayınlandığı anda yürürlüğe girer.
                Kullanıcıların düzenli olarak bu sayfayı kontrol etmesi önerilir.
              </p>
            </div>
          </motion.section>

          {/* İletişim */}
          <motion.section 
            className="bg-secondaryBG rounded-lg p-6"
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <h2 className="text-2xl font-bold text-textHeading mb-4">7. İletişim</h2>
            <div className="text-textPrimary">
              <p>
                Bu şartlar hakkında sorularınız için:{' '}
                <a 
                  href="mailto:info@hizlihaber.com" 
                  className="text-secondary hover:text-secondaryHover transition-colors underline"
                >
                  info@hizlihaber.com
                </a>
              </p>
            </div>
          </motion.section>

        </div>

        {/* Alt Bilgi */}
        <motion.div 
          className="mt-12 text-center text-textPrimary"
          variants={sectionVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p className="bg-primary rounded-lg p-4">
            <strong className="text-secondary">Unutmayın:</strong> Bu platform gerçek haberlerden yapay zeka ile işlenmiş içerik sunar. 
            İyi haber okumalar!
          </p>
        </motion.div>

      </motion.div>
      
      <Footer />
    </div>
  );
}

export default Terms;
