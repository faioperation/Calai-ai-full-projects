import React, { useState, useEffect } from "react";
import InputField from "../../../components/Inputfield";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const BusinessInfo = () => {
  const axiosSecure = useAxiosSecure();

  // Settings State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  // Hours State
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [offDays, setOffDays] = useState([]);

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.trim().split(" ");
    if (parts.length < 2) return timeStr;
    let [hours, minutes] = parts[0].split(":");
    const modifier = parts[1].toUpperCase();
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const convertTo12Hour = (timeStr) => {
    if (!timeStr) return "";
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const modifier = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${modifier}`;
  };

  const toggleOffDay = (day) => {
    if (!isEditingHours) return;
    setOffDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Queries
  const {
    data: businessInfoResponse,
    isLoading: isInfoLoading,
    refetch: refetchInfo,
  } = useQuery({
    queryKey: ["ownerBusinessInfo"],
    queryFn: async () => {
      const response = await axiosSecure.get(
        "/business-owner/settings/business-info",
      );
      return response.data;
    },
  });

  const {
    data: businessHourResponse,
    isLoading: isHourLoading,
    refetch: refetchHour,
  } = useQuery({
    queryKey: ["ownerBusinessHour"],
    queryFn: async () => {
      const response = await axiosSecure.get("/business-owner/business-hour");
      return response.data;
    },
  });

  // Effects
  useEffect(() => {
    if (businessInfoResponse?.data && !isEditingInfo) {
      const biData = businessInfoResponse.data;
      setName(biData.name || "");
      setAddress(biData.address || "");
    }
  }, [businessInfoResponse, isEditingInfo]);

  useEffect(() => {
    if (businessHourResponse?.data && !isEditingHours) {
      const bhData = businessHourResponse.data;
      setOpeningTime(convertTo24Hour(bhData.openingTime || ""));
      setClosingTime(convertTo24Hour(bhData.closingTime || ""));

      let offDaysData = bhData.offDays;
      if (typeof offDaysData === "string") {
        try {
          offDaysData = JSON.parse(offDaysData);
        } catch (e) {
          offDaysData = offDaysData.split(",").map((d) => d.trim());
        }
      }
      setOffDays(Array.isArray(offDaysData) ? offDaysData : []);
    }
  }, [businessHourResponse, isEditingHours]);

  // Mutations
  const updateInfoMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.patch(
        "/business-owner/settings/update-business-info",
        payload,
      );
      return response.data;
    },
    onSuccess: (res) => {
      if (res?.success || res?.status === "success") {
        toast.success(res.message || "Business info updated successfully");
        setIsEditingInfo(false);
        refetchInfo();
      } else {
        toast.error(res?.message || "Failed to update business info");
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "An error occurred",
      );
    },
  });

  const updateHourMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.patch(
        "/business-owner/business-hour",
        payload,
      );
      return response.data;
    },
    onSuccess: (res) => {
      if (res?.success || res?.status === "success") {
        toast.success(res.message || "Business hours updated successfully");
        setIsEditingHours(false);
        refetchHour();
      } else {
        toast.error(res?.message || "Failed to update business hours");
      }
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "An error occurred",
      );
    },
  });

  // Handlers
  const handleSaveInfo = () => {
    updateInfoMutation.mutate({
      name,
      address,
    });
  };

  const handleCancelInfo = () => {
    setIsEditingInfo(false);
    if (businessInfoResponse?.data) {
      const biData = businessInfoResponse.data;
      setName(biData.name || "");
      setAddress(biData.address || "");
    }
  };

  const handleSaveHours = () => {
    updateHourMutation.mutate({
      openingTime: convertTo12Hour(openingTime),
      closingTime: convertTo12Hour(closingTime),
      offDays: offDays,
    });
  };

  const handleCancelHours = () => {
    setIsEditingHours(false);
    if (businessHourResponse?.data) {
      const bhData = businessHourResponse.data;
      setOpeningTime(convertTo24Hour(bhData.openingTime || ""));
      setClosingTime(convertTo24Hour(bhData.closingTime || ""));

      let offDaysData = bhData.offDays;
      if (typeof offDaysData === "string") {
        try {
          offDaysData = JSON.parse(offDaysData);
        } catch (e) {
          offDaysData = offDaysData.split(",").map((d) => d.trim());
        }
      }
      setOffDays(Array.isArray(offDaysData) ? offDaysData : []);
    }
  };

  if (isInfoLoading || isHourLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#2563EB] w-10 h-10" />
      </div>
    );
  }

  const isPendingInfo = updateInfoMutation.isPending;
  const isPendingHours = updateHourMutation.isPending;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Business Info Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Business Info</h2>
        <p className="text-sm text-gray-400 mb-6">
          Update your business details and company information.
        </p>

        <div className="bg-[#191919] p-6 rounded-xl border border-white/5">
          <div className="flex flex-col gap-6">
            <InputField
              label="Business Name"
              placeholder="e.g. AI Support"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={!isEditingInfo || isPendingInfo}
              labelClass="!text-sm !font-medium !text-gray-300"
              inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${
                !isEditingInfo || isPendingInfo
                  ? "!text-gray-500 cursor-default"
                  : "!text-white"
              } placeholder:!text-gray-600 focus:!outline-none focus:!border-blue-500/50`}
            />
            <InputField
              label="Business Address"
              type="text"
              placeholder="Enter business address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              readOnly={!isEditingInfo || isPendingInfo}
              labelClass="!text-sm !font-medium !text-gray-300"
              inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${
                !isEditingInfo || isPendingInfo
                  ? "!text-gray-500 cursor-default"
                  : "!text-white"
              } placeholder:!text-gray-600 focus:!outline-none focus:!border-blue-500/50`}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            {!isEditingInfo ? (
              <button
                onClick={() => setIsEditingInfo(true)}
                className="px-10 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelInfo}
                  disabled={isPendingInfo}
                  className="px-8 py-2.5 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInfo}
                  disabled={isPendingInfo}
                  className="px-8 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPendingInfo && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Business Hours Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Business Hours</h2>
        <p className="text-sm text-gray-400 mb-6">
          Update your operating hours and closed days.
        </p>

        <div className="bg-[#191919] p-6 rounded-xl border border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <InputField
              label="Opening Time"
              type="time"
              value={openingTime}
              onChange={(e) => setOpeningTime(e.target.value)}
              readOnly={!isEditingHours || isPendingHours}
              labelClass="!text-sm !font-medium !text-gray-300"
              inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${
                !isEditingHours || isPendingHours
                  ? "!text-gray-500 cursor-default"
                  : "!text-white"
              } focus:!outline-none focus:!border-blue-500/50 [color-scheme:dark]`}
            />
            <InputField
              label="Closing Time"
              type="time"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              readOnly={!isEditingHours || isPendingHours}
              labelClass="!text-sm !font-medium !text-gray-300"
              inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${
                !isEditingHours || isPendingHours
                  ? "!text-gray-500 cursor-default"
                  : "!text-white"
              } focus:!outline-none focus:!border-blue-500/50 [color-scheme:dark]`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-300">
              Off Days (Select closed days)
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <button
                  key={day}
                  onClick={() => toggleOffDay(day)}
                  disabled={!isEditingHours || isPendingHours}
                  className={`px-4 py-2 rounded-full text-[13px] transition-all font-medium border
                    ${
                      offDays.includes(day)
                        ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                        : "bg-[#111] border-white/10 text-gray-400 hover:border-white/20"
                    }
                    ${
                      !isEditingHours || isPendingHours
                        ? "cursor-default opacity-80"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
            {!isEditingHours ? (
              <button
                onClick={() => setIsEditingHours(true)}
                className="px-10 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelHours}
                  disabled={isPendingHours}
                  className="px-8 py-2.5 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHours}
                  disabled={isPendingHours}
                  className="px-8 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPendingHours && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfo;
