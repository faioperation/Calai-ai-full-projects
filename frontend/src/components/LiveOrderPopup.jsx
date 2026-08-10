import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { X, BellRing, MapPin, Phone, User, ShoppingBag } from "lucide-react";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const LiveOrderPopup = () => {
  const [incomingOrder, setIncomingOrder] = useState(null);
  const { user } = useAuth();
  const audioRef = useRef(null);

  // Play a notification sound continuously until acknowledged
  useEffect(() => {
    if (incomingOrder) {
      try {
        const audio = new Audio('/notification.wav');
        audio.loop = true; // Loop the sound
        audioRef.current = audio;
        audio.play().catch(e => console.log("Audio play blocked by browser", e));
      } catch (e) {
        toast.error("Audio error:", e);
      }
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [incomingOrder]);

  useEffect(() => {
    // Determine socket URL from API URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const socketUrl = baseUrl.replace('/api', '');
    const token = Cookies.get('Access-Token');
    
    // Extract businessId from user context or token payload
    let businessId =  user?.businessId || null;
    if (!businessId && token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(jsonPayload);
        businessId = payload.id || payload._id || payload.businessId;
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }

    // Initialize socket connection (defaults to polling then upgrades to websocket)
    const socket = io(socketUrl, {
      auth: { token: token },
      query: { token: token }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully with ID:", socket.id);
      if (businessId) {
        console.log("Joining business room:", businessId);
        socket.emit("join-business-room", businessId);
      }
    });

    // Catch ALL events to see what the backend is actually sending
    socket.onAny((eventName, ...args) => {
      console.log(`[Socket.io Debug] Received event: '${eventName}'`, args);
    });

    // Listen for new order events
    // (Common event names: 'new-order', 'new_order', 'order')
    const handleNewOrder = (order) => {
      console.log("Live order received:", order);
      setIncomingOrder(order);
    };

    socket.on('order:confirmed', handleNewOrder);

    return () => {
      socket.off('order:confirmed', handleNewOrder);
      socket.offAny();
      socket.disconnect();
    };
  }, [user]);

  if (!incomingOrder) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#0E0E10] border border-[#272727] shadow-[0_0_40px_rgba(37,99,235,0.15)] rounded-2xl w-full max-w-[500px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full animate-pulse">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">New Order Received!</h2>
              {/* <p className="text-blue-100 text-sm">Order #{incomingOrder.id || 'N/A'}</p> */}
            </div>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="p-6 flex-1 max-h-[60vh] overflow-y-auto hide-scrollbar space-y-6">
          
          {/* Customer Info */}
          <div className="bg-[#151515] p-4 rounded-xl border border-white/5 space-y-3">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Customer Details</h3>
            
            <div className="flex items-start gap-3 text-sm">
              <User className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <span className="text-gray-200 font-medium">{incomingOrder.customerName || 'Unknown Customer'}</span>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <span className="text-gray-200">{incomingOrder.number || 'N/A'}</span>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <span className="text-gray-200">
                {incomingOrder.deliveryAddress || 'No Address Provided'}
                {incomingOrder.orderType && <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">{incomingOrder.orderType}</span>}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Ordered Items
            </h3>
            <div className="space-y-3">
              {(incomingOrder.items || []).length > 0 ? (
                incomingOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-gray-200 font-medium">{item.product_name || item.name || 'Unknown Item'}</p>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="text-white font-medium">£{Number(item.unit_prize || item.unit_price || item.price || 0).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">No items details available.</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-gray-400 font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-white">£{Number(incomingOrder.totalPrice || 0).toFixed(2)}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#272727] bg-[#111111]">
          <button
            onClick={() => setIncomingOrder(null)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
          >
            Acknowledge
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default LiveOrderPopup;
