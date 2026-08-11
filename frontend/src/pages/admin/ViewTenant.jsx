import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  FileText,
  X,
  Bot,
  User,
  Download,
  Loader2,
  Eye,
  Printer,
  Trash2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import Table from "../../components/Table";
import InputField from "../../components/Inputfield";
import Dropdown from "../../components/Dropdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const ViewTenant = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("agents");
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const [isEditingBusinessInfo, setIsEditingBusinessInfo] = useState(false);
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

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId) => {
      const res = await axiosSecure.delete(`/system-owner/agent/${agentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tenantAgents", id]);
      toast.success("Agent deleted successfully");
      setModalState({ isOpen: false, type: null, data: null });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete agent");
    },
  });

  const handleActionSelect = (option, row) => {
    setModalState({ isOpen: true, type: option, data: row });
  };

  const handleDownload = () => {
    if (!modalState.data?.id) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Call ${modalState.type}`, 20, 20);
      doc.setFontSize(12);

      let y = 30;
      if (modalState.type === "Call Summary") {
        const text = modalState.data.summary || "No summary available.";
        const lines = doc.splitTextToSize(text, 170);
        doc.text(lines, 20, y);
      } else {
        const parseTranscript = (str) => {
          if (!str) return [];
          return str
            .split("\n")
            .filter((l) => l.trim())
            .map((line) => {
              if (line.startsWith("User: "))
                return { role: "User", content: line.replace("User: ", "") };
              if (line.startsWith("AI: "))
                return { role: "AI", content: line.replace("AI: ", "") };
              return { role: "AI", content: line };
            });
        };
        const transcriptLines = parseTranscript(modalState.data.transcript);
        transcriptLines.forEach((msg) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const lines = doc.splitTextToSize(`${msg.role}: ${msg.content}`, 170);
          doc.text(lines, 20, y);
          y += lines.length * 7;
        });
      }
      doc.save(
        `Call_${modalState.type.replace(/\s+/g, "_")}_${modalState.data.id}.pdf`,
      );
      toast.success("Download complete");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF");
    }
  };

  const [selectedOrder, setSelectedOrder] = useState(null);
  const orderProducts = selectedOrder?.items || [];

  const handleViewOrder = (row) => {
    setSelectedOrder(row);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
  };

  const handlePrintOrder = async () => {
    if (!selectedOrder) return;
    try {
      const toastId = toast.loading("Preparing print...");
      const res = await axiosSecure.get(
        `/system-owner/individual-tenant/download/${selectedOrder.id}`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      toast.dismiss(toastId);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to prepare print");
    }
  };

  const handleDownloadOrder = async () => {
    if (!selectedOrder) return;
    try {
      const toastId = toast.loading("Downloading invoice...");
      const res = await axiosSecure.get(
        `/system-owner/individual-tenant/download/${selectedOrder.id}`,
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${selectedOrder.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Download complete", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice");
    }
  };



  const {
    data: tenantResponse,
    isLoading,
    isError,
    error,
    refetch: refetchTenant,
  } = useQuery({
    queryKey: ["tenant", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/system-owner/tenants/${id}`);
      return res.data;
    },
  });

  const { data: businessHourResponse, refetch: refetchBusinessHour } = useQuery({
    queryKey: ["businessHour", id],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/system-owner/business-hour/${id}`
      );
      return res.data;
    },
  });

  React.useEffect(() => {
    if (businessHourResponse?.data && !isEditingBusinessInfo) {
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
  }, [businessHourResponse, isEditingBusinessInfo]);

  const updateBusinessInfoMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.patch(
        `/system-owner/business-hour/${id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Business hours updated successfully");
      setIsEditingBusinessInfo(false);
      refetchBusinessHour();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || err?.message || "An error occurred"
      );
    },
  });

  const handleSaveBusinessInfo = () => {
    updateBusinessInfoMutation.mutate({
      openingTime: convertTo12Hour(openingTime),
      closingTime: convertTo12Hour(closingTime),
      offDays: offDays,
    });
  };

  const handleCancelBusinessInfo = () => {
    setIsEditingBusinessInfo(false);
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

  const toggleOffDay = (day) => {
    if (!isEditingBusinessInfo) return;
    setOffDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const { data: agentsResponse, isLoading: isAgentsLoading } = useQuery({
    queryKey: ["tenantAgents", id],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/system-owner/individual-tenant/${id}/agents`,
      );
      return res.data;
    },
  });



  const { data: billingResponse, isLoading: isBillingLoading } = useQuery({
    queryKey: ["tenantBilling", id],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/system-owner/individual-tenant/${id}/billing`,
      );
      return res.data;
    },
  });

  const { data: callsResponse, isLoading: isCallsLoading } = useQuery({
    queryKey: ["tenantCalls", id],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/system-owner/individual-tenant/${id}/calls`,
      );
      return res.data;
    },
  });

  const { data: ordersResponse, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["tenantOrders", id],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/system-owner/individual-tenant/${id}/orders`,
      );
      return res.data;
    },
  });

  const tenant = tenantResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-white">
        Loading...
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <h2 className="text-2xl font-bold mb-2">Tenant not found</h2>
        <p>
          {error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch tenant"}
        </p>
      </div>
    );
  }

  const billingData = billingResponse?.data || tenant.billing_history || [];
  const agentsData = agentsResponse?.data || tenant.agents || [];
  const callsData =
    callsResponse?.data || tenant.calls || tenant.callSummaries || [];
  const ordersData = ordersResponse?.data || tenant.orders || [];

  const usedMinutes = tenant.usage?.used !== undefined ? tenant.usage.used : 0;
  const remainingMinutes =
    tenant.usage?.remaining !== undefined ? tenant.usage.remaining : 0;

  // If total is 0 (even with explicit 0 from API), the pie chart won't render.
  // We can force it to render an empty state pie if we want, but since we used fallbacks above, it should show.
  const pieData = [
    { name: "Used", value: usedMinutes, color: "#4285F4" },
    { name: "Remaining", value: remainingMinutes, color: "#374151" },
  ];

  const billingColumns = [
    {
      key: "date",
      Title: "Date",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.date ? new Date(row.date).toLocaleDateString("en-GB") : "N/A"}
        </div>
      ),
    },
    {
      key: "plan",
      Title: "Plan",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">{row.plan}</div>
      ),
    },
    {
      key: "invoice",
      Title: "Invoice",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.invoice_no || row.invoice || "N/A"}
        </div>
      ),
    },
    {
      key: "amount",
      Title: "Amount",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">£{row.amount}</div>
      ),
    },
    {
      key: "status",
      Title: "Status",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left">
          <span className="w-[85px] inline-block text-center px-2 py-1 text-[11px] font-medium text-white rounded-[4px] bg-[#4285F4] capitalize">
            {row.status}
          </span>
        </div>
      ),
    },
  ];

  const agentColumns = [
    {
      key: "name",
      Title: "Agent Name",
      width: "25%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">{row.name || "Unknown"}</div>
      ),
    },
    {
      key: "vapi_id",
      Title: "Vapi Assistant ID",
      width: "35%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-400">
          {row.vapi_agent_id || row.vapi_assistant_id || row.id || "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      Title: "Status",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left">
          <span className="w-[85px] inline-block text-center px-2 py-1 text-[11px] font-medium text-white rounded-[4px] bg-[#4285F4] capitalize">
            {row.status || "Active"}
          </span>
        </div>
      ),
    },
    {
      key: "created",
      Title: "Created Date",
      width: "15%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.created_date && row.created_date !== "N/A"
            ? new Date(row.created_date).toLocaleDateString("en-GB")
            : row.created_at
              ? new Date(row.created_at).toLocaleDateString("en-GB")
              : "N/A"}
        </div>
      ),
    },
    {
      key: "action",
      Title: "Action",
      width: "10%",
      sortable: false,
      render: (row) => (
        <div className="flex justify-start">
          <button
            onClick={() => handleActionSelect("Delete Agent", row)}
            className="text-red-500/70 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const callColumns = [
    {
      key: "callerId",
      Title: "Caller ID",
      width: "20%",
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.callerId || row.caller_id || "N/A"}
        </div>
      ),
    },
    {
      key: "duration",
      Title: "Call Duration",
      width: "20%",
      render: (row) => (
        <div className="text-left text-gray-200">{row.duration || "N/A"}</div>
      ),
    },
    {
      key: "time",
      Title: "Time",
      width: "20%",
      render: (row) => (
        <div className="text-left text-gray-200">{row.time || "N/A"}</div>
      ),
    },
    {
      key: "date",
      Title: "Date",
      width: "20%",
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.date && row.date !== "N/A"
            ? new Date(row.date).toLocaleDateString("en-GB")
            : row.created_at
              ? new Date(row.created_at).toLocaleDateString("en-GB")
              : "N/A"}
        </div>
      ),
    },
    {
      key: "action",
      Title: "Summary",
      width: "20%",
      sortable: false,
      render: (row) => (
        <div className="relative w-[180px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <Dropdown
            placeholder="Summary"
            options={["Call Summary", "Call Transcript"]}
            onSelect={(val) => handleActionSelect(val, row)}
            inputClass="!bg-[#1A2255] !placeholder-white !border-none !text-white !rounded-[8px] !py-2.5 !pl-11 !pr-10 !font-medium !text-[13px] !shadow-none !cursor-pointer hover:!bg-[#232D70] transition-colors"
            optionClass="!bg-[#1A2255] !text-white !border border-[#2A3470] !rounded-[8px] !shadow-xl !mt-1.5"
            icon="!text-white !right-3"
          />
        </div>
      ),
    },
  ];

  const orderColumns = [
    {
      key: "callId",
      Title: "Number",
      width: "25%",
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.number || row.id || "N/A"}
        </div>
      ),
    },
    {
      key: "customerName",
      Title: "Customer Name",
      width: "20%",
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.customerName || "N/A"}
        </div>
      ),
    },
    {
      key: "time",
      Title: "Time",
      width: "15%",
      render: (row) => (
        <div className="text-left text-gray-200">{row.time || "N/A"}</div>
      ),
    },
    {
      key: "date",
      Title: "Date",
      width: "15%",
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.date && row.date !== "N/A"
            ? new Date(row.date).toLocaleDateString("en-GB")
            : row.created_at
              ? new Date(row.created_at).toLocaleDateString("en-GB")
              : "N/A"}
        </div>
      ),
    },
    {
      key: "totalPrice",
      Title: "Amount",
      width: "15%",
      render: (row) => (
        <div className="text-left text-gray-200">
          £{row.totalPrice || row.amount || 0}
        </div>
      ),
    },
    {
      key: "action",
      Title: "Action",
      width: "10%",
      sortable: false,
      render: (row) => (
        <div className="flex justify-start">
          <button
            onClick={() => handleViewOrder(row)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const statusLower = tenant.status?.toLowerCase();
  let statusBgClass = "bg-[#7A8293]";
  if (statusLower === "active") statusBgClass = "bg-[#4285F4]";
  else if (statusLower === "suspended") statusBgClass = "bg-[#EA4335]";

  const joinedDate = tenant.joined_date
    ? new Date(tenant.joined_date).toLocaleDateString("en-GB")
    : "N/A";

  return (
    <div className="space-y-8">
      {/* Top Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant Profile Card */}
        <div className="bg-[#191919] rounded-2xl p-6 relative shadow-sm border border-gray-800/50">
          <div className="absolute top-6 right-6">
            <span
              className={`px-4 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusLower === "active" ? "bg-[#4285F4]/20 text-[#4285F4]" : "bg-gray-800 text-gray-400"}`}
            >
              {tenant.status || "Unknown"}
            </span>
          </div>

          {tenant.image || tenant.profile_picture ? (
            <img
              src={tenant.image || tenant.profile_picture}
              alt={tenant.name}
              className="w-16 h-16 rounded-2xl object-cover mb-4 shadow-md border border-gray-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-[#4285F4] flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-md">
              {tenant.name ? tenant.name.charAt(0).toUpperCase() : "T"}
            </div>
          )}

          <h2 className="text-white text-2xl font-bold mb-1">
            {tenant.name || "Unknown Name"}
          </h2>
          <p className="text-gray-400 text-sm mb-6">Tenant Profile</p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <Icon icon="lucide:mail" className="text-lg text-[#4285F4]" />
              <span>{tenant.email || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <Icon icon="lucide:phone" className="text-lg text-[#4285F4]" />
              <span>{tenant.phone || "N/A"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <Icon icon="lucide:calendar" className="text-lg text-[#4285F4]" />
              <span>Joined {joinedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <Icon icon="lucide:bot" className="text-lg text-[#4285F4]" />
              <span>{agentsData.length} Active Agents</span>
            </div>
          </div>
        </div>

        {/* Usage Overview Card */}
        <div className="bg-[#191919] rounded-2xl p-6 shadow-sm border border-gray-800/50 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-white text-lg font-bold">Usage Overview</h2>
              <p className="text-gray-400 text-sm">
                Track monthly minute usage
              </p>
            </div>
          </div>

          <div className="flex-1 bg-[#111111] rounded-xl border border-gray-800/50 mt-4 relative flex items-center justify-center py-10 min-h-[280px]">
            <div className="flex w-full items-center justify-center gap-2 sm:gap-6 px-4">
              <div className="text-xs sm:text-sm font-medium text-gray-300 text-right flex-1">
                Used: {usedMinutes} min
              </div>

              <div className="w-[140px] sm:w-[180px] aspect-square shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius="0%"
                      outerRadius="100%"
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-xs sm:text-sm font-medium text-gray-300 text-left flex-1">
                Remaining: {remainingMinutes} min
              </div>
            </div>

            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-3 h-3 rounded-sm bg-[#4285F4]"></div>
                Used
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-3 h-3 rounded-sm bg-[#374151]"></div>
                Remaining
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours Section */}
      <div className="bg-[#191919] rounded-2xl p-6 border border-gray-800/50">
        <h2 className="text-xl font-semibold text-white mb-1">Business Hours</h2>
        <p className="text-sm text-gray-400 mb-6">
          Update the tenant's operating hours and closed days.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <InputField
            label="Opening Time"
            type="time"
            value={openingTime}
            onChange={(e) => setOpeningTime(e.target.value)}
            readOnly={!isEditingBusinessInfo || updateBusinessInfoMutation.isPending}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${
              !isEditingBusinessInfo || updateBusinessInfoMutation.isPending
                ? "!text-gray-500 cursor-default"
                : "!text-white"
            } focus:!outline-none focus:!border-blue-500/50 [color-scheme:dark]`}
          />
          <InputField
            label="Closing Time"
            type="time"
            value={closingTime}
            onChange={(e) => setClosingTime(e.target.value)}
            readOnly={!isEditingBusinessInfo || updateBusinessInfoMutation.isPending}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass={`!bg-[#111111] !border-white/5 !rounded-full !px-5 !py-3.5 !text-sm ${
              !isEditingBusinessInfo || updateBusinessInfoMutation.isPending
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
                disabled={!isEditingBusinessInfo || updateBusinessInfoMutation.isPending}
                className={`px-4 py-2 rounded-full text-[13px] transition-all font-medium border
                  ${
                    offDays.includes(day)
                      ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                      : "bg-[#111] border-white/10 text-gray-400 hover:border-white/20"
                  }
                  ${
                    !isEditingBusinessInfo || updateBusinessInfoMutation.isPending
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
          {!isEditingBusinessInfo ? (
            <button
              onClick={() => setIsEditingBusinessInfo(true)}
              className="px-10 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelBusinessInfo}
                disabled={updateBusinessInfoMutation.isPending}
                className="px-8 py-2.5 rounded-full border border-white/10 text-sm font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBusinessInfo}
                disabled={updateBusinessInfoMutation.isPending}
                className="px-8 py-2.5 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateBusinessInfoMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-[#191919] rounded-2xl border border-gray-800/50 overflow-visible w-full">
        <div className="flex border-b border-gray-800/50">
          <button
            onClick={() => setActiveTab("agents")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "agents" ? "text-white border-b-2 border-[#4285F4]" : "text-gray-400 hover:text-gray-200"}`}
          >
            AI Agents
          </button>
          <button
            onClick={() => setActiveTab("calls")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "calls" ? "text-white border-b-2 border-[#4285F4]" : "text-gray-400 hover:text-gray-200"}`}
          >
            Calls
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "orders" ? "text-white border-b-2 border-[#4285F4]" : "text-gray-400 hover:text-gray-200"}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === "billing" ? "text-white border-b-2 border-[#4285F4]" : "text-gray-400 hover:text-gray-200"}`}
          >
            Billing History
          </button>
        </div>

        <div className="p-4">
          {activeTab === "agents" && (
            <Table
              TableHeads={agentColumns}
              TableRows={agentsData}
              headClass="[&>div]:justify-start border-none text-left whitespace-nowrap"
              tableClass="border-none table-fixed min-w-[800px]"
              emptyState={
                <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center gap-3">
                  <Icon icon="lucide:bot" className="text-4xl text-gray-600" />
                  <p>No AI agents found.</p>
                </div>
              }
            />
          )}

          {activeTab === "calls" && (
            <Table
              TableHeads={callColumns}
              TableRows={callsData}
              headClass="[&>div]:justify-start border-none text-left whitespace-nowrap"
              tableClass="border-none table-fixed min-w-[800px]"
              wrapperClass="overflow-visible"
              emptyState={
                <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center gap-3">
                  <Icon
                    icon="lucide:phone"
                    className="text-4xl text-gray-600"
                  />
                  <p>No call history available.</p>
                </div>
              }
            />
          )}

          {activeTab === "orders" && (
            <Table
              TableHeads={orderColumns}
              TableRows={ordersData}
              headClass="[&>div]:justify-start border-none text-left whitespace-nowrap"
              tableClass="border-none table-fixed min-w-[800px]"
              emptyState={
                <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center gap-3">
                  <Icon
                    icon="lucide:shopping-cart"
                    className="text-4xl text-gray-600"
                  />
                  <p>No order history available.</p>
                </div>
              }
            />
          )}

          {activeTab === "billing" && (
            <Table
              TableHeads={billingColumns}
              TableRows={billingData}
              headClass="[&>div]:justify-start border-none text-left whitespace-nowrap"
              tableClass="border-none table-fixed min-w-[800px]"
              emptyState={
                <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center gap-3">
                  <Icon
                    icon="lucide:receipt"
                    className="text-4xl text-gray-600"
                  />
                  <p>No billing history available.</p>
                </div>
              }
            />
          )}
        </div>
      </div>

      {/* Dynamic Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-white">
          <div
            className={`bg-[#111111] border border-[#1A1A1A] rounded-[20px] w-full relative shadow-2xl flex flex-col ${modalState.type === "Call Transcript" ? "max-w-[550px]" : "max-w-[600px]"}`}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#1A1A1A] flex justify-between items-center">
              <h2 className="text-[17px] font-medium text-gray-200">
                {modalState.type}
              </h2>
              <button
                onClick={() =>
                  setModalState({ isOpen: false, type: null, data: null })
                }
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Call Transcript Content */}
            {modalState.type === "Call Transcript" && (
              <div className="p-8 max-h-[500px] overflow-y-auto space-y-6 custom-scrollbar">
                {modalState.data?.transcript?.length > 0 ? (
                  modalState.data.transcript
                    .split("\n")
                    .filter((l) => l.trim())
                    .map((line, idx) => {
                      const isUser = line.startsWith("User: ");
                      const content = line.replace(/^(User|AI):\s*/, "");
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : ""}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#1A2255] flex items-center justify-center shrink-0">
                            {!isUser ? (
                              <Bot className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <User className="w-5 h-5 text-blue-300" />
                            )}
                          </div>
                          <div
                            className={`bg-[#1A1A1A] text-gray-200 px-5 py-3.5 rounded-2xl text-[15px] max-w-[80%] ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                          >
                            {content}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center text-gray-400">
                    No transcript available.
                  </div>
                )}
              </div>
            )}

            {/* Call Summary Content */}
            {modalState.type === "Call Summary" && (
              <div className="flex flex-col">
                <div className="p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <p className="text-gray-300 text-[15px] leading-[1.8] whitespace-pre-wrap">
                    {modalState.data?.summary || "No summary available."}
                  </p>
                </div>
              </div>
            )}

            {/* Delete Agent Content */}
            {modalState.type === "Delete Agent" && (
              <div className="flex flex-col p-8">
                <p className="text-gray-300 text-[15px] leading-[1.8] whitespace-pre-wrap text-center mb-6">
                  Are you sure you want to delete the agent{" "}
                  <span className="font-bold text-white">
                    {modalState.data?.name}
                  </span>
                  ?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() =>
                      setModalState({ isOpen: false, type: null, data: null })
                    }
                    className="px-6 py-2.5 rounded-[10px] text-[14px] font-medium border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteAgentMutation.mutate(
                        modalState.data.id ||
                          modalState.data.vapi_agent_id ||
                          modalState.data.vapi_assistant_id,
                      );
                    }}
                    disabled={deleteAgentMutation.isPending}
                    className="flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors text-white px-6 py-2.5 rounded-[10px] text-[14px] font-medium min-w-[100px] cursor-pointer"
                  >
                    {deleteAgentMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            {modalState.type !== "Delete Agent" && (
              <div className="border-t border-[#1A1A1A] px-8 py-5 flex justify-end mt-auto">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-[#1A2255] hover:bg-[#232D70] transition-colors text-white px-6 py-2.5 rounded-[10px] text-[14px] font-medium cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}

     
      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-white">
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-[20px] w-full max-w-[700px] overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#1A1A1A] flex justify-between items-center">
              <h2 className="text-[17px] text-gray-200">
                Order Summary{" "}
                <span className="text-gray-400">
                  ({selectedOrder.customerName || "Customer"})
                </span>
              </h2>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <>
              {/* Table Content */}
              <div className="px-8 py-2 max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]">
                      <th className="py-4 text-[14px] font-semibold text-white">
                        Product name
                      </th>
                      <th className="py-4 text-[14px] font-semibold text-white text-center">
                        Order Quantity
                      </th>
                      <th className="py-4 text-[14px] font-semibold text-white">
                        Time
                      </th>
                      <th className="py-4 text-[14px] font-semibold text-white text-right">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderProducts.length > 0 ? (
                      orderProducts.map((product, idx) => (
                        <tr
                          key={product.id || idx}
                          className="border-b border-[#1A1A1A]"
                        >
                          <td className="py-5 text-[14px] text-gray-300">
                            {product.product_name || `Item ${idx + 1}`}
                          </td>
                          <td className="py-5 text-[14px] text-gray-300 text-center">
                            <span className="inline-block px-4">
                              {product.quantity}
                            </span>
                          </td>
                          <td className="py-5 text-[14px] text-gray-300">
                            {selectedOrder?.time || "-"}
                          </td>
                          <td className="py-5 text-[14px] text-gray-300 text-right">
                            £{product.unit_prize || 0}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="py-8 text-center text-gray-500 text-sm"
                        >
                          No items found for this order.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-6 flex justify-between items-center mt-2 border-t border-[#1A1A1A]">
                <div className="text-[15px] font-medium text-white">
                  Total:{" "}
                  <span className="text-[#2563EB]">
                    £{selectedOrder?.totalPrice || 0}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handlePrintOrder}
                    className="flex items-center gap-2 bg-[#1A2255] hover:bg-[#232D70] transition-colors text-white px-6 py-2.5 rounded-[10px] text-[13px] font-medium cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={handleDownloadOrder}
                    className="flex items-center gap-2 bg-[#1A2255] hover:bg-[#232D70] transition-colors text-white px-6 py-2.5 rounded-[10px] text-[13px] font-medium cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTenant;
