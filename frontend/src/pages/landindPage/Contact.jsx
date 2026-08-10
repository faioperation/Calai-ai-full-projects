import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import InputField from "@/components/Inputfield";
import Dropdown from "@/components/Dropdown";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

const Contact = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    businessPostcode: "",
    businessType: "",
    phoneNumber: "",
    email: "",
    dailyOrders: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          fullName: formData.fullName,
          businessName: formData.businessName,
          businessPostcode: formData.businessPostcode,
          businessType: formData.businessType,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          dailyOrders: formData.dailyOrders,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      );

      // Redirect to the success page
      navigate("/thank-you-contact");
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 relative bg-linear-to-t from-[#59168B]/10 via-[#1C398E]/10 to-transparent text-white"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto bg-[#02060F]/80 backdrop-blur-xl border border-[#1C398E]/40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row relative overflow-hidden justify-between"
        >
          {/* Left Dark Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-[#59168B]/20 to-[#1C398E]/20 border border-[#59168B]/30 relative overflow-hidden rounded-[1.5rem] p-8 md:p-10 w-full lg:w-[40%] flex flex-col"
          >
            <div className="relative z-10">
              <h3 className="bg-gradient-to-r from-[#C27AFF] to-[#00D3F3] bg-clip-text text-transparent tracking-wider text-3xl font-bold mb-3 ">
                Contact Us
              </h3>
              <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-[#E9D4FF] to-[#FFFFFF] bg-clip-text text-transparent">
                Get Started With Calai
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-12">
                Tell us about your restaurant and our team will help you
                discover how Calai can improve customer service, save time and
                support your business.
              </p>

              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4 text-gray-200">
                  <div className="w-10 h-10 rounded-full bg-[#59168B]/30 flex items-center justify-center shrink-0 border border-[#C27AFF]/30">
                    <FiPhone className="text-lg text-[#00D3F3]" />
                  </div>
                  <span className="text-sm font-medium">+447719436543</span>
                </div>
                <div className="flex items-center gap-4 text-gray-200">
                  <div className="w-10 h-10 rounded-full bg-[#59168B]/30 flex items-center justify-center shrink-0 border border-[#C27AFF]/30">
                    <FiMail className="text-lg text-[#00D3F3]" />
                  </div>
                  <span className="text-sm font-medium">
                    Enquiries@calai.info
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Background Circles */}
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#00D3F3]/10 rounded-full pointer-events-none blur-2xl"></div>
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#C27AFF]/10 rounded-full pointer-events-none blur-2xl"></div>
          </motion.div>

          {/* Right Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full lg:w-[60%] p-8 md:p-10 rounded-[1.5rem] bg-transparent relative z-10"
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mb-6">
                <InputField
                  label="Full Name*"
                  type="text"
                  required
                  labelClass="!text-gray-300 !font-medium mb-1 text-sm"
                  inputClass="!bg-[#0A0F24] !text-white !border-[#1C398E]/50 !placeholder-gray-500 focus:!border-[#C27AFF] !py-3 !text-sm transition-colors shadow-inner "
                  className="sm:col-span-2"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />

                <InputField
                  label="Business Name*"
                  type="text"
                  required
                  className=""
                  labelClass="!text-gray-300 !font-medium mb-1 text-sm"
                  inputClass="!bg-[#0A0F24] !text-white !border-[#1C398E]/50 !placeholder-gray-500 focus:!border-[#C27AFF] !py-3 !text-sm transition-colors shadow-inner"
                  placeholder="Enter business name"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                />

                <Dropdown
                  label="Business Type*"
                  placeholder="Select type"
                  options={["Restaurant", "Takeaway", "Other"]}
                  labelClass="!text-gray-300 !font-medium mb-1 text-sm"
                  inputClass="!bg-[#0A0F24] !text-white !border-[#1C398E]/50 !placeholder-gray-500 focus:!border-[#C27AFF] !py-3 !text-sm transition-colors shadow-inner"
                  optionClass="!bg-[#0A0F24] !text-white border border-[#1C398E]/50"
                  icon="!text-gray-400"
                  value={formData.businessType}
                  onSelect={(val) =>
                    setFormData({ ...formData, businessType: val })
                  }
                />
                <InputField
                  label="Business Postcode*"
                  type="text"
                  required
                  labelClass="!text-gray-300 !font-medium mb-1 text-sm"
                  inputClass="!bg-[#0A0F24] !text-white !border-[#1C398E]/50 !placeholder-gray-500 focus:!border-[#C27AFF] !py-3 !text-sm transition-colors shadow-inner"
                  placeholder="Enter business postcode"
                  value={formData.businessPostcode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessPostcode: e.target.value,
                    })
                  }
                />

                <InputField
                  label="Phone Number*"
                  type="tel"
                  required
                  labelClass="!text-gray-300 !font-medium mb-1 text-sm"
                  inputClass="!bg-[#0A0F24] !text-white !border-[#1C398E]/50 !placeholder-gray-500 focus:!border-[#C27AFF] !py-3 !text-sm transition-colors shadow-inner"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />

                <InputField
                  label="Email Address*"
                  type="email"
                  required
                  labelClass="!text-gray-300 !font-medium mb-1 text-sm"
                  inputClass="!bg-[#0A0F24] !text-white !border-[#1C398E]/50 !placeholder-gray-500 focus:!border-[#C27AFF] !py-3 !text-sm transition-colors shadow-inner"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <Dropdown
                  label="Daily Phone Orders (optional)"
                  placeholder="Select call volume"
                  options={["Less than 20", "20–50", "50–100", "100+"]}
                  labelClass="!text-gray-300 !font-medium mb-1 text-sm"
                  inputClass="!bg-[#0A0F24] !text-white !border-[#1C398E]/50 !placeholder-gray-500 focus:!border-[#C27AFF] !py-3 !text-sm transition-colors shadow-inner"
                  optionClass="!bg-[#0A0F24] !text-white border border-[#1C398E]/50"
                  icon="!text-gray-400"
                  value={formData.dailyOrders}
                  onSelect={(val) =>
                    setFormData({ ...formData, dailyOrders: val })
                  }
                />
              </div>

              <div className="flex flex-col gap-2 mb-8 flex-grow">
                <label className="font-medium text-gray-300 text-sm">
                  Message
                </label>
                <textarea
                  className="w-full h-full border border-[#1C398E]/50 outline-none p-4 text-white bg-[#0A0F24] placeholder-gray-500 rounded-xl min-h-[120px] focus:border-[#C27AFF] transition-colors text-sm shadow-inner resize-none"
                  placeholder="Tell us about your specific needs or questions..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="flex justify-end mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] hover:from-[#001c80] hover:to-[#001870] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 border border-[#0F42FF] shadow-[0_0_15px_rgba(15,66,255,0.3)] hover:shadow-[0_0_20px_rgba(15,66,255,0.6)] ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? "Submiting..." : "Submit"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default Contact;
