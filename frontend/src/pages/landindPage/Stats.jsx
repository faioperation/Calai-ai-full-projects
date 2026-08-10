import React from "react";
import { motion } from "framer-motion";
import { PhoneOff, Users, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Container from "@/components/Container";

const problemsData = [
  {
    icon: <PhoneOff className="w-6 h-6 text-white" />,
    title: "Missed Opportunities",
    description:
      "Busy phone lines mean customers may give up and order somewhere else.",
    bg: "bg-[#9810FA]", // Purple
  },
  {
    icon: <Users className="w-6 h-6 text-white" />,
    title: "Staff Under Pressure",
    description:
      "Your team spends valuable time answering repetitive questions instead of focusing on service.",
    bg: "bg-[#3B82F6]", // Blue
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-white" />,
    title: "Rising Costs",
    description: "Hiring extra staff just to manage calls is expensive.",
    bg: "bg-[#06B6D4]", // Teal
  },
];

const ProblemCard = ({ problem, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-gradient-to-b from-[#B5B9FF]/30 to-[#2B2C49]/50 border border-[#0F42FF]/40 p-6 md:p-8 rounded-[24px] flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300 shadow-lg"
  >
    <div
      className={`${problem.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-md`}
    >
      {problem.icon}
    </div>
    <div className="flex flex-col gap-3">
      <h3 className="text-white font-inter text-2xl font-bold tracking-tight">
        {problem.title}
      </h3>
      <p className="text-[#B4B6C9] font-inter text-[16px] leading-relaxed">
        {problem.description}
      </p>
    </div>
  </motion.div>
);

const Stats = () => {
  return (
    <section
      id="feature"
      className="py-20 relative bg-linear-to-b from-[#59168B]/20 via-[#1C398E]/20 to-[#271436]/20"
    >
      <Container>
        <div className="mb-14">
          <Header
            titleText="Running a Busy Restaurant or Takeaway Isn't Easy"
            subtitleText="During peak hours, every second matters. Staff are preparing food, serving customers and managing delivery orders — while the phone keeps ringing."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mx-auto">
          {problemsData.map((problem, index) => (
            <ProblemCard key={index} problem={problem} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Stats;
