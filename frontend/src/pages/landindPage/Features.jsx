import React from "react";
import { motion } from "framer-motion";
import { Bot, FileText, BarChart2, Mail, Lock, Clock } from "lucide-react";
import Header from "@/components/Header";
import Container from "@/components/Container";

const featuresData = [
  {
    icon: <Bot className="w-6 h-6 text-white" />,
    title: "AI Call Handling",
    description: "Answers calls instantly using AI voice agents.",
    bg: "bg-[#9810FA]",
  },
  {
    icon: <FileText className="w-6 h-6 text-white" />,
    title: "Smart Order Processing",
    description: "Automatically generates structured order summaries.",
    bg: "bg-[#3B82F6]",
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-white" />,
    title: "AI Usage Analytics",
    description: "Monitor call duration and usage in real-time.",
    bg: "bg-[#06B6D4]",
  },
  {
    icon: <Mail className="w-6 h-6 text-white" />,
    title: "Automated Email Confirm",
    description: "Sent instant order confirmation emails to customers.",
    bg: "bg-[#6366F1]",
  },
  {
    icon: <Lock className="w-6 h-6 text-white" />,
    title: "Kitchen Printing",
    description: "Orders confirmed arrive to your printer instantly",
    bg: "bg-[#8B5CF6]",
  },
  {
    icon: <Clock className="w-6 h-6 text-white" />,
    title: "24/7 Availability",
    description: "Never miss a customer inquiry again.",
    bg: "bg-[#D946EF]",
  },
];

const FeatureCard = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, margin: "-50px" }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-gradient-to-t from-[#9810FA]/20 to-[#155DFC]/20 border border-[#0F42FF]/20 p-8 rounded-[24px] flex flex-col gap-4 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
  >
    <div
      className={`${feature.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-lg`}
    >
      {feature.icon}
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-white font-inter text-xl font-semibold tracking-tight">
        {feature.title}
      </h3>
      <p className="text-[#99A1AF] font-inter text-[15px] leading-relaxed">
        {feature.description}
      </p>
    </div>
  </motion.div>
);

const Features = () => {
  return (
    <section className="py-20 relative">
      <Container>
        <div className="mb-14">
          <Header
            titleText="Everything You Need To Automate Customer Calls"
            subtitleText="Powerful features designed for modern businesses"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Features;
