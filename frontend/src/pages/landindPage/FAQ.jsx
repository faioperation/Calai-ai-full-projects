"use client";
import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import Container from "@/components/Container";
import FAQdropdown from "@/components/FAQdropdown";
import Header from "@/components/Header";

const faqs = [
  {
    question: "What is Calai?",
    answer:
      "Calai is an AI phone assistant built for restaurants and takeaways. It answers customer calls, takes orders, answers questions and helps your team deliver a faster service.",
  },
  {
    question: "Will customers know they are speaking to AI?",
    answer:
      "Yes. Calai is designed to be transparent while still providing a natural and helpful customer experience. Your AI assistant will introduce itself clearly, for example:",
    details:
      "Hi, you're through to [Business Name]. I'm the virtual assistant. Would you like to place an order?",
  },
  {
    question: "Does Calai replace my staff?",
    answer:
      "No. Calai works alongside your team by handling phone calls and repetitive questions, giving your staff more time to focus on preparing food and serving customers.",
  },
  {
    question: "How does Calai learn about my restaurant?",
    answer:
      "Calai is trained using your restaurant information including your menu, prices, opening hours, special offers and frequently asked questions.",
  },
  {
    question: "Can Calai take food orders?",
    answer:
      "Yes. Calai can understand customer orders, handle changes or special requests, confirm details and send the completed order to your restaurant.",
  },
  {
    question: "What happens if a customer changes their order?",
    answer:
      "Customers can speak naturally. Calai understands changes during the conversation and updates the order before confirming it.",
  },
  {
    question: "How do I receive orders from Calai?",
    answer:
      "Orders are sent clearly to your restaurant dashboard and can be printed directly to your kitchen printer for your team to prepare.",
  },
  {
    question: "Do my customers need to download an app?",
    answer:
      "No. Customers simply call your restaurant like they normally do — Calai handles the conversation in the background.",
  },
  {
    question: "Do I need to change my phone number?",
    answer:
      "No. Calai can connect with your existing phone setup, allowing customers to continue calling the number they already know.",
  },
  {
    question: "Can I update my menu and prices?",
    answer:
      "Yes. You can update your menu, pricing, offers and business information whenever changes are needed.",
  },
  {
    question: "What happens during busy periods?",
    answer:
      "Unlike a traditional phone line, Calai can help handle multiple customer conversations, reducing waiting times during your busiest hours.",
  },
  {
    question: "Can Calai recommend extras to customers?",
    answer:
      "Yes. Calai can suggest relevant items such as drinks, sides and special offers to help improve the customer experience and increase order value.",
  },
  {
    question: "How long does setup take?",
    answer: (
      <div className="flex flex-col gap-4">
        <p>
          You can start your free trial and test your AI agent instantly using your Calai dashboard.
        </p>
        <p>
          To connect Calai to your existing business phone number, setup typically takes 3–7 working days, depending on your phone provider.
        </p>
        <div>
          <p className="mb-2">During this time we'll:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Configure your AI assistant</li>
            <li>Upload your menu and business information</li>
            <li>Test your AI agent</li>
            <li>Configure your call routing</li>
            <li>Liaise with your phone provider where required</li>
            <li>Ensure everything is working before your business goes live</li>
          </ul>
        </div>
        <p>
          We'll keep you updated throughout the setup process and let you know as soon as your business is ready to start taking live customer calls.
        </p>
      </div>
    ),
  },
  {
    question: "Do I need to sign a long-term contract?",
    answer:
      "No. Calai is designed to be flexible for restaurants and takeaways. There are no long-term contracts—you can use Calai on a monthly basis and cancel with 30 days’ notice.",
    details:
      "A one-time setup fee applies to cover AI assistant configuration, menu training, call setup, and system preparation. Once your assistant is live, your monthly subscription continues for as long as you choose to use Calai.",
  },
  {
    question: "What are AI minutes?",
    answer:
      "AI minutes are the time Calai spends speaking with your customers, answering questions, taking orders and assisting callers.",
  },
  {
    question: "What are forwarded minutes?",
    answer:
      "Forwarded minutes are used whenever Calai transfers a caller to your restaurant, for example if a customer requests to speak with a member of staff or the AI is unable to complete their request.",
  },
  {
    question: "What happens if I exceed my monthly allowance?",
    answer:
      "If you exceed your included AI or forwarded minutes, additional usage will be charged at the standard overage rate. We'll notify you when you're approaching your monthly allowance.",
  },
  {
    question: "Do unused minutes roll over?",
    answer:
      "No. Your included AI and forwarded minutes reset at the beginning of each monthly billing cycle.",
  },
  {
    question: "Why do I need a Calai SIM handset?",
    answer:
      "If your business only has one business phone number, we'll provide a dedicated Calai SIM handset for a one-time £50 charge. This allows us to connect your existing business number to Calai while keeping your current number for customers.",
    details:
      "If your business already has two business phone numbers, no additional SIM handset is required.",
  },
  {
    question: "Is there a setup fee?",
    answer:
      "Starter and Growth plans include a one-time £79 onboarding fee, which covers AI configuration, menu setup, testing and deployment.",
    details: "The Pro plan includes onboarding at no additional cost.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes. You can change your plan at any time. Any changes will take effect from your next billing cycle.",
  },
  {
    question: "Can Calai answer multiple calls at the same time?",
    answer:
      "Yes. Unlike a traditional phone line, Calai can answer multiple customer calls simultaneously, helping you avoid missed orders during busy periods.",
  },
  {
    question: "Can Calai take card payments over the phone?",
    answer:
      "No. For your security and your customers' privacy, Calai does not process or store card payment details.",
    details:
      "If a customer wishes to pay by card over the phone, Calai will automatically transfer the call to your restaurant so a member of your team can securely take the payment. Cash and card payments made in person at collection or delivery remain unchanged.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 11);
  };

  return (
    <section id="faq" className="py-10 bg-black">
      <Container>
        <div className="flex flex-col items-center">
          <Header
            titleText="FAQ"
            subtitleText="Everything you need to know about Calai"
          />

          <div className="mt-8 w-full flex flex-col gap-2">
            {Array.from({ length: visibleCount <= 12 ? 1 : Math.ceil((visibleCount - 12) / 11) + 1 }).map((_, chunkIndex) => {
              const startIndex = chunkIndex === 0 ? 0 : 12 + (chunkIndex - 1) * 11;
              const endIndex = chunkIndex === 0 ? 12 : 12 + chunkIndex * 11;
              
              return (
                <motion.div
                  key={chunkIndex}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.15 },
                    },
                  }}
                  className="w-full flex flex-col gap-2"
                >
                  {faqs.slice(startIndex, Math.min(endIndex, visibleCount)).map((faq, i) => {
                    const actualIndex = startIndex + i;
                    return (
                      <FAQdropdown
                        key={actualIndex}
                        question={faq.question}
                        answer={faq.answer}
                        details={faq.details}
                        isOpen={openIndex === actualIndex}
                        onClick={() => handleToggle(actualIndex)}
                      />
                    );
                  })}
                </motion.div>
              );
            })}
          </div>

          {visibleCount < faqs.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-center"
            >
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] rounded-full text-white font-bold text-sm md:text-base px-8 py-3 border border-[#0F42FF] hover:scale-105 transition-transform"
              >
                Load More Questions ({faqs.length - visibleCount} More)
                <FiChevronDown className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-center"
            >
              <button
                onClick={() => setVisibleCount(12)}
                className="flex items-center gap-2 bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] rounded-full text-white font-bold text-sm md:text-base px-8 py-3 border border-[#0F42FF] hover:scale-105 transition-transform"
              >
                Show Less
                <FiChevronDown className="w-5 h-5 rotate-180" />
              </button>
            </motion.div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
