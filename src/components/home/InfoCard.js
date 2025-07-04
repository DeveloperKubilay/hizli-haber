import React from 'react';
import { motion } from 'framer-motion';

// Normal kart - Sol yazı, sağ fotoğraf
export function InfoCard({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex items-stretch bg-transparent rounded-xl mb-36 mx-4 overflow-hidden h-[500px] gap-6"
      initial={{ opacity: 0, x: -100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Sol taraf - Yazı (50%) */}
      <motion.div 
        className="w-1/2 p-8 flex flex-col justify-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: (index * 0.2) + 0.3 }}
        viewport={{ once: true }}
      >
        <h3 className="text-6xl font-bold text-white mb-4 leading-tight">{title}</h3>
        <p className="text-white text-xl leading-relaxed">
          {index === 0 && (
            <>
              Haberleri baştan sona okumak zorunda değilsiniz. Yan tarafta sunduğumuz <span className="text-secondary font-semibold">özetleri tercih edin</span> ve zamandan tasarruf edin ve sadece önemli bilgilere odaklanın!
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
      
      {/* Sağ taraf - Fotoğraf (45%) */}
      <motion.div 
        className="w-[45%]"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: (index * 0.2) + 0.4 }}
        viewport={{ once: true }}
      >
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-contain rounded-lg bg-transparent"
        />
      </motion.div>
    </motion.div>
  );
}

// Ters kart - Sol fotoğraf, sağ yazı
export function InfoCardReverse({ title, description, image, index }) {
  return (
    <motion.div 
      className="flex items-stretch bg-transparent rounded-xl mb-36 mx-4 overflow-hidden h-[500px] gap-6"
      initial={{ opacity: 0, x: 100 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Sol taraf - Fotoğraf (45%) */}
      <motion.div 
        className="w-[45%]"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: (index * 0.2) + 0.4 }}
        viewport={{ once: true }}
      >
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-contain rounded-lg bg-transparent"
        />
      </motion.div>
      
      {/* Sağ taraf - Yazı (50%) */}
      <motion.div 
        className="w-1/2 p-8 flex flex-col justify-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: (index * 0.2) + 0.3 }}
        viewport={{ once: true }}
      >
        <h3 className="text-6xl font-bold text-white mb-4 leading-tight">{title}</h3>
        <p className="text-white text-xl leading-relaxed">
          {index === 0 && (
            <>
              Haberleri baştan sona okumak zorunda değilsiniz. Yan tarafta sunduğumuz <span className="text-textPrimary font-semibold">özetleri tercih edin</span> ve zamandan tasarruf edin ve sadece önemli bilgilere odaklanın!
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
