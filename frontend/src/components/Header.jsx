"use client";
import React from 'react';
import { motion } from 'framer-motion';

const Header = ({ titleText, subtitleText }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className='text-center'
    >
        <h3 className='text-3xl  font-inter font-semibold inline-block bg-gradient-to-r from-[#E9D4FF] to-[#FFFFFF] bg-clip-text text-transparent'>
          {titleText}
        </h3>
        {subtitleText && (
          <p className='text-[#DBDBDB] mt-4 font-inter text-lg leading-relaxed'>
            {subtitleText}
          </p>
        )}
    </motion.div>
  )
}

export default Header;
