import React, { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import InputField from './Inputfield';
import Dropdown from './Dropdown';

const EnterpriseContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    businessType: '',
    postcode: '',
    email: '',
    phone: '',
    callVolume: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_ENTERPRISE_TEMPLATE_ID,
        {
          fullName: formData.fullName,
          businessName: formData.businessName,
          businessPostcode: formData.postcode,
          businessType: formData.businessType,
          phoneNumber: formData.phone,
          email: formData.email,
          callVolume: formData.callVolume,
          message: formData.message,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      
      toast.success('Your request has been submitted successfully! We will contact you soon.');
      onClose();
      setFormData({
        fullName: '',
        businessName: '',
        businessType: '',
        postcode: '',
        email: '',
        phone: '',
        callVolume: '',
        message: ''
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0F111A] border border-[#272727] rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-[#272727] flex justify-between items-center bg-[#0B0D14] shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">Contact for Enterprise Plan</h3>
                <p className="text-sm text-gray-400 mt-1">Fill out the form below and our team will get in touch.</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField 
                    label="Full Name"
                    type="text" 
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    labelClass="!text-sm !font-medium !text-gray-300 !mb-0"
                    inputClass="!w-full !bg-[#1A1D24] !border-[#333] !rounded-lg !px-4 !py-2.5 !text-white !placeholder-gray-500 focus:!border-blue-500 !transition-colors"
                    className="!gap-1.5"
                  />
                  <InputField 
                    label="Email"
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    labelClass="!text-sm !font-medium !text-gray-300 !mb-0"
                    inputClass="!w-full !bg-[#1A1D24] !border-[#333] !rounded-lg !px-4 !py-2.5 !text-white !placeholder-gray-500 focus:!border-blue-500 !transition-colors"
                    className="!gap-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField 
                    label="Business Name"
                    type="text" 
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter business name"
                    labelClass="!text-sm !font-medium !text-gray-300 !mb-0"
                    inputClass="!w-full !bg-[#1A1D24] !border-[#333] !rounded-lg !px-4 !py-2.5 !text-white !placeholder-gray-500 focus:!border-blue-500 !transition-colors"
                    className="!gap-1.5"
                  />
                  <div className="w-full">
                    <Dropdown 
                      label="Business Type"
                      placeholder="Select type"
                      value={formData.businessType}
                      onSelect={(val) => handleDropdownSelect('businessType', val)}
                      options={[
                        "Restaurant",
                        "Takeaway",
                        "Other"
                      ]}
                      labelClass="!text-sm !font-medium !text-gray-300 !mb-0"
                      inputClass="!w-full !bg-[#1A1D24] !border !border-[#333] !rounded-lg !px-4 !py-2.5 !text-white !placeholder-gray-500 focus:!border-blue-500 !transition-colors"
                      className="!gap-1.5"
                      optionClass="!bg-[#1A1D24] !text-white !border-[#333]"
                      icon="!text-gray-400"
                    />
                    <input type="hidden" required value={formData.businessType} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputField 
                    label="Phone Number"
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    labelClass="!text-sm !font-medium !text-gray-300 !mb-0"
                    inputClass="!w-full !bg-[#1A1D24] !border-[#333] !rounded-lg !px-4 !py-2.5 !text-white !placeholder-gray-500 focus:!border-blue-500 !transition-colors"
                    className="!gap-1.5"
                  />
                  <InputField 
                    label="Postcode"
                    type="text" 
                    name="postcode"
                    required
                    value={formData.postcode}
                    onChange={handleChange}
                    placeholder="12345"
                    labelClass="!text-sm !font-medium !text-gray-300 !mb-0"
                    inputClass="!w-full !bg-[#1A1D24] !border-[#333] !rounded-lg !px-4 !py-2.5 !text-white !placeholder-gray-500 focus:!border-blue-500 !transition-colors"
                    className="!gap-1.5"
                  />
                </div>

                <div className="w-full">
                  <Dropdown 
                    label="Expected Monthly Call Volume"
                    placeholder="Select call volume"
                    value={formData.callVolume}
                    onSelect={(val) => handleDropdownSelect('callVolume', val)}
                    options={[
                      "5,000 - 10,000 minutes",
                      "10,000 - 50,000 minutes",
                      "50,000 - 100,000 minutes",
                      "100,000+ minutes"
                    ]}
                    labelClass="!text-sm !font-medium !text-gray-300 !mb-0"
                    inputClass="!w-full !bg-[#1A1D24] !border !border-[#333] !rounded-lg !px-4 !py-2.5 !text-white !placeholder-gray-500 focus:!border-blue-500 !transition-colors"
                    className="!gap-1.5"
                    optionClass="!bg-[#1A1D24] !text-white !border-[#333]"
                    icon="!text-gray-400"
                  />
                  {/* Hidden required input for form validation to work with Dropdown */}
                  <input type="hidden" required value={formData.callVolume} />
                </div>

                <div className="space-y-1.5 flex flex-col w-full">
                  <label className="text-sm font-medium text-gray-300">Specific Requirements (Optional)</label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your specific needs or integrations..."
                    rows={4}
                    className="w-full bg-[#1A1D24] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EnterpriseContactModal;
