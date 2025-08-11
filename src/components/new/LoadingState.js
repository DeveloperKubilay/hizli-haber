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
            <div className="mb-8 space-y-4">
              <SkeletonItem className="h-8 w-3/4" />
              <SkeletonItem className="h-6 w-1/2" />
              <div className="flex items-center space-x-4 mt-4">
                <SkeletonItem className="h-4 w-24" />
                <SkeletonItem className="h-4 w-20" />
                <SkeletonItem className="h-4 w-28" />
              </div>
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
              {/* Haber Resmi ve Bilgiler kartı */}
              <div className="bg-primary p-5 rounded-lg">
                {/* Ana resim alanı - h-56 */}
                <SkeletonItem className="w-full h-56 rounded-lg mb-6" />
                
                {/* Like/Dislike butonları */}
                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center gap-6">
                    <SkeletonItem className="h-5 w-20" />
                    <SkeletonItem className="h-5 w-24" />
                  </div>
                  
                  {/* Tarih */}
                  <SkeletonItem className="h-5 w-32 mx-auto" />
                </div>
              </div>

              {/* Reklam Alanı kartı */}
              <div className="bg-primary p-5 md:p-6 rounded-lg text-center w-full">
                {/* Başlık */}
                <div className="flex items-center gap-3 mb-4">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-24" />
                </div>
                
                {/* Reklam alanı - min-h-[280px] */}
                <SkeletonItem className="w-full min-h-[280px] rounded-lg" />
              </div>

              {/* Etiketler kartı */}
              <div className="bg-primary p-5 rounded-lg">
                {/* Başlık */}
                <div className="flex items-center gap-3 mb-6">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-20" />
                </div>
                
                {/* Etiket butonları */}
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4].map((index) => (
                    <SkeletonItem 
                      key={index}
                      className="h-10 w-20 rounded-full" 
                    />
                  ))}
                </div>
              </div>

              {/* Özet kartı */}
              <div className="bg-primary p-5 rounded-lg">
                {/* Başlık */}
                <div className="flex items-center gap-3 mb-6">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-16" />
                </div>
                
                {/* Özet paragrafları */}
                <div className="space-y-3">
                  <SkeletonItem className="h-4 w-full" />
                  <SkeletonItem className="h-4 w-11/12" />
                  <SkeletonItem className="h-4 w-4/5" />
                </div>
              </div>

              {/* Benzer Haberler kartı */}
              <div className="bg-primary p-5 rounded-lg">
                {/* Başlık */}
                <div className="flex items-center gap-3 mb-6">
                  <SkeletonItem className="h-6 w-6 rounded" />
                  <SkeletonItem className="h-6 w-28" />
                </div>
                
                {/* Benzer haberler listesi */}
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="space-y-2">
                      {/* Başlık ve tarih */}
                      <SkeletonItem className="h-4 w-full" />
                      <SkeletonItem className="h-3 w-1/2" />
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
