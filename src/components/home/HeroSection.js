import React from 'react';
import { motion } from 'framer-motion';

function HeroSection({ currentMsgIndex, msgs }) {
  return (
    <div className="flex flex-col justify-center items-center w-full my-6">
      <motion.img
        src="/imgs/logo.png"
        alt="News Header"
        className="rounded-xl max-h-72 object-cover mb-6"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.h1
        className="text-center mt-3 text-textHeading text-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="font-bold">Burası aradığın haberin</span>
        <br />  
        <span
          className={`${msgs[currentMsgIndex].color} transition-colors duration-700 ease-in-out text-6xl font-bold`}
        >
          {msgs[currentMsgIndex].text}
        </span>
        <br />
        <span className="text-textPrimary text-xl mt-2 block">
          İnsanların en hızlı şekilde haberi aldığı platformumuz ile <span className="text-red-500 font-bold">1000+</span> fazla içeriğe göz atın
        </span>
      </motion.h1>
    </div>
  );
}

export default HeroSection;
