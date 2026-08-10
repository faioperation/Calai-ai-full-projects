import React, { useState } from "react";
import { Trash2, Edit2, X, Loader2, Plus, Printer, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Table from "../../components/Table";
import Breadcrumb from "../../components/Breadcrumb";
import InputField from "../../components/Inputfield";
import useAxiosSecure from "@/hooks/useAxiosSecure";

const PrinterManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedPrinter, setSelectedPrinter] = useState(null);

  // Form states
  const [deviceName, setDeviceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  const { data: printersResponse, isLoading } = useQuery({
    queryKey: ["printers"],
    queryFn: async () => {
      const res = await axiosSecure.get("/business-owner/printer");
      return res.data;
    },
  });

  const printers = printersResponse?.data || [];

  // Mutations
  const addPrinterMutation = useMutation({
    mutationFn: async (newPrinter) => {
      const res = await axiosSecure.post("/business-owner/printer", newPrinter);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["printers"]);
      toast.success("Printer added successfully");
      closeModals();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to add printer");
    },
  });

  const editPrinterMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(
        `/business-owner/printer/${id}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["printers"]);
      toast.success("Printer updated successfully");
      closeModals();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update printer");
    },
  });

  const deletePrinterMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/business-owner/printer/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["printers"]);
      toast.success("Printer deleted successfully");
      closeModals();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete printer");
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedPrinter(null);
    setDeviceName("");
    setSerialNumber("");
    setIpAddress("");
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!deviceName || !serialNumber || !ipAddress) {
      toast.error("Please fill in all fields");
      return;
    }
    addPrinterMutation.mutate({
      device_name: deviceName,
      serial_number: serialNumber,
      ip_address: ipAddress,
    });
  };

  const handleEditClick = (printer) => {
    setSelectedPrinter(printer);
    setDeviceName(printer.deviceName || printer.device_name || "");
    setSerialNumber(printer.serialNumber || printer.serial_number || "");
    setIpAddress(printer.ipAddress || printer.ip_address || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!deviceName || !serialNumber || !ipAddress) {
      toast.error("Please fill in all fields");
      return;
    }
    editPrinterMutation.mutate({
      id: selectedPrinter.id,
      data: { device_name: deviceName, serial_number: serialNumber, ip_address: ipAddress },
    });
  };

  const handleDeleteClick = (printer) => {
    setSelectedPrinter(printer);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedPrinter?.id) {
      deletePrinterMutation.mutate(selectedPrinter.id);
    }
  };

  const handleDownloadBridge = async (printer) => {
    const mac = printer.serialNumber || printer.serial_number;
    const ip = printer.ipAddress || printer.ip_address;

    if (!mac || !ip) {
      toast.error("Printer must have a MAC address and IP address to download the bridge.");
      return;
    }

    const toastId = toast.loading("Downloading bridge...");

    try {
      const res = await axiosSecure.get(
        `/business-owner/printer/download-bridge?mac=${mac}&ip=${ip}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      
      const contentDisposition = res.headers["content-disposition"];
      let filename = "printer-bridge.zip";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          let extractedFilename = filenameMatch[1];
          if (!extractedFilename.endsWith('.zip')) {
            extractedFilename += '.zip';
          }
          filename = extractedFilename;
        }
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download complete", { id: toastId });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download bridge", { id: toastId });
    }
  };

  const columns = [
    {
      key: "deviceName",
      Title: "Device Name",
      width: "20%",
      render: (row) => (
        <div className="text-left text-gray-200 font-medium">
          {row.deviceName || row.device_name || "N/A"}
        </div>
      ),
    },
    {
      key: "serialNumber",
      Title: "MAC Address",
      width: "20%",
      render: (row) => (
        <div className="text-left text-gray-400 font-mono text-sm">
          {row.serialNumber || row.serial_number || "N/A"}
        </div>
      ),
    },
    {
      key: "ipAddress",
      Title: "IP Address",
      width: "15%",
      render: (row) => (
        <div className="text-left text-gray-400 font-mono text-sm">
          {row.ipAddress || row.ip_address || "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      Title: "Status",
      width: "10%",
      render: (row) => (
        <div className="text-left">
          <span
            className={`inline-block text-center px-3 py-1 text-[11px] font-medium text-white rounded-full capitalize ${row.status?.toLowerCase() === "online" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}
          >
            {row.status || "Offline"}
          </span>
        </div>
      ),
    },
    {
      key: "lastSeen",
      Title: "Last Seen",
      width: "15%",
      render: (row) => (
        <div className="text-left text-gray-400 text-sm">
          {row.lastSeen
            ? new Date(row.lastSeen).toLocaleString("en-GB")
            : "Never"}
        </div>
      ),
    },
    {
      key: "action",
      Title: "Action",
      width: "10%",
      sortable: false,
      render: (row) => (
        <div className="flex justify-start gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-500/10 rounded-lg"
            title="Edit Printer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-red-500/70 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
            title="Delete Printer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      key: "download",
      Title: "",
      width: "10%",
      sortable: false,
      render: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleDownloadBridge(row)}
            className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors px-3 py-2 hover:bg-green-500/10 rounded-lg text-sm font-medium"
            title="Download Bridge"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <Breadcrumb text="Printer Management" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-[#2563EB] w-10 h-10" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb text="Manage your kitchen and receipt printers" />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors text-white px-5 py-2.5 rounded-[10px] text-[14px] font-medium shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Printer
        </button>
      </div>

      <div className="bg-[#191919] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-sm">
        {printers.length > 0 ? (
          <Table
            TableHeads={columns}
            TableRows={printers}
            headClass="border-b border-[#1A1A1A] text-gray-200 whitespace-nowrap [&>div]:justify-start"
            tableClass="border-none"
          />
        ) : (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center border border-gray-800">
              <Printer className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-gray-200 text-lg font-medium mb-1">
                No printers configured
              </h3>
              <p className="text-sm">
                Add a printer to start sending orders to your kitchen.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Printer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-white">
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-[20px] w-full max-w-[500px] relative shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-[#1A1A1A] flex justify-between items-center">
              <h2 className="text-[17px] font-medium text-gray-200">
                Add New Printer
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-8 space-y-5">
              <InputField
                label="Device Name"
                type="text"
                placeholder="Enter printer name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                labelClass="!text-sm !font-medium !text-gray-300"
                inputClass="!w-full !bg-[#1A1A1A] !border !border-gray-800 !rounded-xl !px-4 !py-3 !text-white !placeholder-gray-500 focus:!outline-none focus:!border-[#2563EB] !transition-colors !text-sm"
              />
              <InputField
                label="MAC Address"
                type="text"
                placeholder="e.g. 00:11:62:AA:BB:CC"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                labelClass="!text-sm !font-medium !text-gray-300"
                inputClass="!w-full !bg-[#1A1A1A] !border !border-gray-800 !rounded-xl !px-4 !py-3 !text-white !placeholder-gray-500 focus:!outline-none focus:!border-[#2563EB] !transition-colors !text-sm !font-mono"
              />
              <InputField
                label="IP Address"
                type="text"
                placeholder="e.g. 192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                labelClass="!text-sm !font-medium !text-gray-300"
                inputClass="!w-full !bg-[#1A1A1A] !border !border-gray-800 !rounded-xl !px-4 !py-3 !text-white !placeholder-gray-500 focus:!outline-none focus:!border-[#2563EB] !transition-colors !text-sm !font-mono"
              />
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addPrinterMutation.isPending}
                  className="flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-white px-6 py-2.5 rounded-xl text-sm font-medium min-w-[120px]"
                >
                  {addPrinterMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Add Printer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Printer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-white">
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-[20px] w-full max-w-[500px] relative shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-[#1A1A1A] flex justify-between items-center">
              <h2 className="text-[17px] font-medium text-gray-200">
                Edit Printer Name
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-8 space-y-5">
              <InputField
                label="Device Name"
                type="text"
                placeholder="e.g. Kitchen Printer 1"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                labelClass="!text-sm !font-medium !text-gray-300"
                inputClass="!w-full !bg-[#1A1A1A] !border !border-gray-800 !rounded-xl !px-4 !py-3 !text-white !placeholder-gray-500 focus:!outline-none focus:!border-[#2563EB] !transition-colors !text-sm"
              />
              <InputField
                label="MAC Address"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                labelClass="!text-sm !font-medium !text-gray-300"
                inputClass="!w-full !bg-[#1A1A1A] !border !border-gray-800 !rounded-xl !px-4 !py-3 !text-white !placeholder-gray-500 focus:!outline-none focus:!border-[#2563EB] !transition-colors !text-sm !font-mono"
              />
              <InputField
                label="IP Address"
                type="text"
                placeholder="e.g. 192.168.1.100"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                labelClass="!text-sm !font-medium !text-gray-300"
                inputClass="!w-full !bg-[#1A1A1A] !border !border-gray-800 !rounded-xl !px-4 !py-3 !text-white !placeholder-gray-500 focus:!outline-none focus:!border-[#2563EB] !transition-colors !text-sm !font-mono"
              />
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editPrinterMutation.isPending}
                  className="flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-white px-6 py-2.5 rounded-xl text-sm font-medium min-w-[120px]"
                >
                  {editPrinterMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[450px] p-8 relative shadow-2xl">
            <button
              onClick={closeModals}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-white text-xl font-bold mb-3 text-center">
              Delete Printer?
            </h2>
            <p className="text-gray-400 text-[14px] leading-relaxed mb-8 text-center">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">
                {selectedPrinter?.deviceName || selectedPrinter?.device_name}
              </span>
              ? This printer will no longer receive orders.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={closeModals}
                className="bg-transparent text-gray-300 border border-gray-700 font-medium px-8 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletePrinterMutation.isPending}
                className="flex items-center justify-center bg-[#ef4444] text-white px-8 py-2.5 rounded-xl font-medium hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors text-sm cursor-pointer min-w-[100px]"
              >
                {deletePrinterMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterManagement;
