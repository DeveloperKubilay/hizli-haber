import React from 'react';
import { motion } from 'framer-motion';

function HeroSection({ currentMsgIndex, msgs }) {
  return (
    <div className="flex flex-col justify-center items-center w-full my-4 md:my-6 px-4">
      <motion.img
        src="/imgs/logo.png"
        alt="News Header"
        className="rounded-xl max-h-40 sm:max-h-56 md:max-h-72 object-cover mb-4 md:mb-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.h1
        className="text-center mt-2 md:mt-3 text-textHeading text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.4 }}
      >
        <span className="font-bold">Burası aradığın haberin</span>
        <br />  
        <span
          className={`${msgs[currentMsgIndex].color} transition-colors duration-1000 ease-in-out text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold`}
        >
          {msgs[currentMsgIndex].text}
        </span>
        <br />
        <span className="text-textPrimary text-sm sm:text-base md:text-lg lg:text-xl mt-2 block">
          İnsanların en hızlı şekilde haberi aldığı platformumuz ile <span className="text-red-500 font-bold">1000+</span> fazla içeriğe göz atın
        </span>
      </motion.h1>
    </div>
  );
}

export default HeroSection;
