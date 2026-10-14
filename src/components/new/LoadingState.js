import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import Footer from '../Footer';

function LoadingState() {
  // Shimmer animasyonu için variant'lar
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  };

  const shimmerTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  };

  // Skeleton item component - animasyon olmadan
  const SkeletonItem = ({ className }) => (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-primary to-primaryBG rounded-lg ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        transition={shimmerTransition}
      />
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        {/* Geri dön butonu skeleton */}
        <div className="mb-8">
          <SkeletonItem className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Ana içerik skeleton */}
          <div className="lg:col-span-2">
            {/* Başlık skeleton */}
            <div className="mb-6 md:mb-8 space-y-4">
              <SkeletonItem className="h-9 w-4/5" />
              <SkeletonItem className="h-6 w-3/5" />
              <div className="flex items-center space-x-4 mt-4">
                <SkeletonItem className="h-4 w-24" />
                <SkeletonItem className="h-4 w-20" />
                <SkeletonItem className="h-4 w-28" />
              </div>
            </div>

            {/* Manşet Görseli skeleton (Gerçek manşet görseli boyutunda max-h-[460px]) */}
            <div className="mb-8">
              <SkeletonItem className="w-full h-64 sm:h-96 md:h-[460px] rounded-2xl" />
            </div>

            {/* İçerik paragrafları skeleton */}
            <div className="mb-10 space-y-6">
              {/* Birinci paragraf */}
              <div className="space-y-3">
                <SkeletonItem className="h-4 w-full" />
                <SkeletonItem className="h-4 w-11/12" />
                <SkeletonItem className="h-4 w-5/6" />
                <SkeletonItem className="h-4 w-3/4" />
              </div>

              {/* İkinci paragraf */}
              <div className="space-y-3">
                <SkeletonItem className="h-4 w-full" />
                <SkeletonItem className="h-4 w-10/12" />
                <SkeletonItem className="h-4 w-4/5" />
              </div>

              {/* Üçüncü paragraf */}
              <div className="space-y-3">
                <SkeletonItem className="h-4 w-11/12" />
                <SkeletonItem className="h-4 w-full" />
                <SkeletonItem className="h-4 w-2/3" />
              </div>
            </div>

            {/* Etkileşim butonları skeleton */}
            <div className="mb-6 flex items-center space-x-4">
              <SkeletonItem className="h-10 w-24" />
              <SkeletonItem className="h-10 w-24" />
              <SkeletonItem className="h-10 w-28" />
            </div>

            {/* Yorum sistemi skeleton */}
            <div className="mb-8 space-y-6">
              <SkeletonItem className="h-6 w-32" />
              
              {/* Yorum yazma alanı */}
              <div className="space-y-3">
                <SkeletonItem className="h-20 w-full" />
                <SkeletonItem className="h-10 w-24" />
              </div>

              {/* Mevcut yorumlar */}
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="border border-gray-700/30 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <SkeletonItem className="h-8 w-8 rounded-full" />
                    <SkeletonItem className="h-4 w-24" />
                    <SkeletonItem className="h-3 w-16" />
                  </div>
                  <SkeletonItem className="h-4 w-11/12" />
                  <SkeletonItem className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Yan panel skeleton */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 1. Bilgiler kartı (~240px gerçek yükseklik) */}
              <div className="bg-primary p-5 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-24" />
                </div>

                {/* Like/Dislike ve Tarih */}
                <div className="space-y-4 text-center mb-6">
                  <div className="flex items-center justify-center gap-6">
                    <SkeletonItem className="h-5 w-20" />
                    <SkeletonItem className="h-5 w-24" />
                  </div>
                  <SkeletonItem className="h-5 w-32 mx-auto" />
                </div>

                {/* Etiketler (Dengeli 3 hap) */}
                <div className="flex flex-wrap justify-center gap-3">
                  {[1, 2, 3].map((index) => (
                    <SkeletonItem 
                      key={index}
                      className="h-9 w-24 rounded-full" 
                    />
                  ))}
                </div>
              </div>

              {/* 2. Özet kartı (~500px gerçek yükseklik) */}
              <div className="bg-primary p-5 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-20" />
                </div>
                
                {/* 3 blok halinde zengin özet satırları */}
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <SkeletonItem className="h-4 w-full" />
                    <SkeletonItem className="h-4 w-11/12" />
                    <SkeletonItem className="h-4 w-full" />
                    <SkeletonItem className="h-4 w-4/5" />
                  </div>
                  <div className="space-y-2.5">
                    <SkeletonItem className="h-4 w-full" />
                    <SkeletonItem className="h-4 w-10/12" />
                    <SkeletonItem className="h-4 w-full" />
                    <SkeletonItem className="h-4 w-3/4" />
                  </div>
                  <div className="space-y-2.5">
                    <SkeletonItem className="h-4 w-11/12" />
                    <SkeletonItem className="h-4 w-full" />
                    <SkeletonItem className="h-4 w-2/3" />
                  </div>
                </div>
              </div>

              {/* 3. Yazar Bilgisi kartı (~170px gerçek yükseklik) */}
              <div className="bg-primary p-5 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-20" />
                </div>
                
                <div className="flex items-center gap-4">
                  <SkeletonItem className="w-16 h-16 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <SkeletonItem className="h-5 w-24" />
                    <SkeletonItem className="h-4 w-36" />
                  </div>
                </div>
              </div>

              {/* 4. Benzer Haberler kartı (~420px gerçek yükseklik) */}
              <div className="bg-primary p-5 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-36" />
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <SkeletonItem className="w-16 h-16 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <SkeletonItem className="h-4 w-full" />
                        <SkeletonItem className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-12"></div>
      <Footer />
    </>
  );
}

export default LoadingState;
