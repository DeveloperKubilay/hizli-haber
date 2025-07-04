import React from 'react';
import { motion } from 'framer-motion';

// Normal kart - Sol yazı, sağ fotoğraf (mobil cihazlarda üst-alt düzen)
export function InfoCard({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex flex-col md:flex-row items-center md:items-stretch bg-transparent rounded-xl mb-16 sm:mb-20 md:mb-36 mx-2 sm:mx-4 overflow-hidden min-h-[300px] md:h-[500px] gap-4 md:gap-6"
      initial={{ opacity: 0, x: -50, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Yazı (mobilde 100%, desktop'ta 50%) */}
      <motion.div 
        className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-center order-2 md:order-1"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: (index * 0.2) + 0.3 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4 leading-tight">{title}</h3>
        <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
          {index === 0 && (
            <>
              Haberleri baştan sona okumak zorunda değilsiniz. Sunduğumuz <span className="text-secondary font-semibold">özetleri tercih edin</span> ve zamandan tasarruf edin ve sadece önemli bilgilere odaklanın!
            </>
          )}
          {index === 1 && (
            <>
              Tüm içeriğimiz <span className="text-secondary font-semibold">kolay okunabilir ve anlaşılır</span> şekilde hazırlanmıştır. Önemli noktaları özel olarak vurguluyoruz, böylece haberleri daha hızlı kavrayabilirsiniz.
            </>
          )}
          {index === 2 && (
            <>
              Aklınıza takılan sorular mı var? <span className="text-secondary font-semibold">Yapay zeka destekli haberlerimizle</span> sorularınıza anında yanıt alın ve güncel gelişmeleri kesintisiz takip edin!
            </>
          )}
        </p>
      </motion.div>
      
      {/* Fotoğraf (mobilde 100%, desktop'ta 45%) */}
      <motion.div 
        className="w-full md:w-[45%] order-1 md:order-2 mb-4 md:mb-0"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: (index * 0.2) + 0.4 }}
        viewport={{ once: true }}
      >
        <img 
          src={image} 
          alt={title}
          className="w-full h-auto max-h-[200px] sm:max-h-[250px] md:max-h-full object-contain rounded-lg bg-transparent mx-auto"
        />
      </motion.div>
    </motion.div>
  );
}

// Ters kart - Sol fotoğraf, sağ yazı (mobil cihazlarda üst-alt düzen)
export function InfoCardReverse({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex flex-col md:flex-row items-center md:items-stretch bg-transparent rounded-xl mb-16 sm:mb-20 md:mb-36 mx-2 sm:mx-4 overflow-hidden min-h-[300px] md:h-[500px] gap-4 md:gap-6"
      initial={{ opacity: 0, x: 50, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Fotoğraf (mobilde 100%, desktop'ta 45%) */}
      <motion.div 
        className="w-full md:w-[45%] order-1 mb-4 md:mb-0"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: (index * 0.2) + 0.4 }}
        viewport={{ once: true }}
      >
        <img 
          src={image} 
          alt={title}
          className="w-full h-auto max-h-[200px] sm:max-h-[250px] md:max-h-full object-contain rounded-lg bg-transparent mx-auto"
        />
      </motion.div>
      
      {/* Yazı (mobilde 100%, desktop'ta 50%) */}
      <motion.div 
        className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-center order-2"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: (index * 0.2) + 0.3 }}
        viewport={{ once: true }}
      >
        <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4 leading-tight">{title}</h3>
        <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
          {index === 0 && (
            <>
              Haberleri baştan sona okumak zorunda değilsiniz. Sunduğumuz <span className="text-textPrimary font-semibold">özetleri tercih edin</span> ve zamandan tasarruf edin ve sadece önemli bilgilere odaklanın!
            </>
          )}
          {index === 1 && (
            <>
              Tüm içeriğimiz <span className="text-textPrimary font-semibold">kolay okunabilir ve anlaşılır</span> şekilde hazırlanmıştır. Önemli noktaları özel olarak vurguluyoruz, böylece haberleri daha hızlı kavrayabilirsiniz.
            </>
          )}
          {index === 2 && (
            <>
              Aklınıza takılan sorular mı var? <span className="text-textPrimary font-semibold">Yapay zeka destekli haberlerimizle</span> sorularınıza anında yanıt alın ve güncel gelişmeleri kesintisiz takip edin!
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
