import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { Play } from "lucide-react";

const Demo = () => {
  return (
    <section
      id="demo"
      className="py-20 relative bg-gradient-to-b from-transparent to-[#1C398E]/10"
    >
      <Container>
        <div className="mb-14 text-center max-w-4xl mx-auto">
          <Header
            titleText="Watch A Live Demo"
            subtitleText="Experience how Calai works with your restaurant to manage customer calls, orders and enquiries automatically."
          />
        </div>
      </Container>
    </section>
  );
};

export default Demo;
