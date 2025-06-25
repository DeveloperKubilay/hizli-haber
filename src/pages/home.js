import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { Compass, Newspaper } from "lucide-react";
import { motion } from "motion/react";
import { ProductTicker } from '../components/home/showCase';

function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogsCollection = collection(db, 'blogs');
        const blogsSnapshot = await getDocs(blogsCollection);
        setBlogs(blogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const msgs = [{
    text: "en hızlısı",
    color: "text-orange-400"
  },
  {
    text: "en güveniliri",
    color: "text-blue-400"
  },
  {
    text: "en çok okunanı",
    color: "text-green-400"
  }];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsgIndex(prev => (prev + 1) % msgs.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [msgs.length]);

  return (
    <>
      <Navbar />
      <div className="Welcome_container"></div>
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8 relative"> {/* 🔥 Container'ı daralttım ama padding'i arttırdım */}
        <div className="space-y-10"> {/* 🔥 Space artırıldı */}
          <div>
            <div className="flex flex-col justify-center items-center w-full my-6"> {/* 🔥 Margin artırıldı */}
              <motion.img
                src="/imgs/logo.png"
                alt="Blog Header"
                className="rounded-xl shadow-xl max-h-72 object-cover mb-6" // 🔥 Logo daha büyük ve daha belirgin
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.h1
                className="text-center mt-3 text-textHeading text-6xl" // 🔥 Başlık daha büyük
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              >
                Burası aradığın haberin
                <br />
                <motion.span
                  className={`${msgs[currentMsgIndex].color} transition-all duration-500 ease-in-out transform text-6xl font-bold`} // 🔥 Değişen metin vurgusu artırıldı
                  key={currentMsgIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {msgs[currentMsgIndex].text}
                </motion.span>
                <br />
                <motion.span className="text-textPrimary text-xl mt-2 block"> {/* 🔥 Alt metin büyütüldü */}
                  İnsanların en hızlı şekilde haberi aldığı platformumuz ile <span className="text-red-500 font-bold animate-pulse">1000+</span> fazla içeriğe göz atın
                </motion.span>

                <div className='flex flex-wrap justify-center gap-5 mt-10'> {/* Buton alanı daha geniş */}
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='text-black cursor-pointer text-lg bg-secondary hover:bg-secondaryHover hover:font-extrabold px-7 py-4 rounded-full font-bold flex items-center gap-3 shadow-xl'
                  >
                    <Compass className="h-6 w-6 mr-1" />
                    Son haber
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='border-2 cursor-pointer text-base border-textPrimary hover:border-textHeading px-5 py-3 rounded-full flex items-center gap-2 shadow-lg'
                  >
                    <Newspaper className="h-5 w-5 mr-1" />
                    Tüm Haberler
                  </motion.a>
                </div>
              </motion.h1>
            </div>
          </div>
        </div>
      </div>
      <ProductTicker />
    </>
  );
}

export default Home;