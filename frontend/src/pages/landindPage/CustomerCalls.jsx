import Container from "@/components/Container";
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CustomerCalls = () => {
  return (
    <div className="bg-linear-to-t from-[#59168B]/20 via-[#1C398E]/20 to-[#59168B]/20  text-white py-15">
      <Container className={`text-center lg:!w-[40%]`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="bg-gradient-to-r from-[#C27AFF] to-[#00D3F3] bg-clip-text text-transparent text-4xl md:text-6xl font-bold">
            Let AI Handle Your Customer Calls
          </h1>
          <p className="text-sm md:text-lg text-white my-6">
            Join thousands of businesses that have automated their customer
            service with AI. Start your free trial today, no credit card
            required.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button className="bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] rounded-full text-white font-bold text-base px-10 py-3  border border-[#0F42FF] ">
              Start Free Trial
            </button>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};

export default CustomerCalls;
