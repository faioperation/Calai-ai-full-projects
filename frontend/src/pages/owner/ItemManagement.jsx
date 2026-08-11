import React, { useState, useRef } from "react";
import { Trash2, X, Loader2, UploadCloud, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import Table from "../../components/Table";
import Breadcrumb from "../../components/Breadcrumb";
import Dropdown from "../../components/Dropdown";

const ItemManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadAgentId, setUploadAgentId] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { data: agentsResponse } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const res = await axiosSecure.get("/business-owner/agent");
      return res.data;
    },
  });
  const agents = agentsResponse?.data || [];

  React.useEffect(() => {
    if (agents.length > 0) {
      const agent = agents[0];
      const vapiId = agent.agentId || agent.vapiAgentId || agent.vapi_agent_id || agent.id;
      if (!selectedAgentId) setSelectedAgentId(vapiId);
      if (!uploadAgentId) setUploadAgentId(vapiId);
    }
  }, [agents, selectedAgentId, uploadAgentId]);

  const { data: itemsResponse, isLoading } = useQuery({
    queryKey: ["itemManagement", selectedAgentId],
    queryFn: async () => {
      const url = selectedAgentId
        ? `/business-owner/item-management?vapiAgentId=${selectedAgentId}`
        : "/business-owner/item-management";
      const res = await axiosSecure.get(url);
      return res.data;
    },
  });

  const items = itemsResponse?.data || [];

  const uploadMenuMutation = useMutation({
    mutationFn: async ({ agentId, formData }) => {
      const res = await axiosSecure.patch(
        `/business-owner/item-management/update-menu?vapiAgentId=${agentId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Menu updated successfully");
      setIsUploadModalOpen(false);
      setUploadAgentId("");
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ["itemManagement"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update menu");
    },
  });

  const handleUploadSubmit = () => {
    if (!uploadAgentId) {
      toast.error("Please select an agent");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("menu_file", file);
    });

    uploadMenuMutation.mutate({ agentId: uploadAgentId, formData });
  };

  const handleModalFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // Logic to delete the item (mock for now)
    console.log("Deleting item:", deletingItem);
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const columns = [
    { key: "category", Title: "Category", width: "20%" },
    { key: "name", Title: "Name", width: "20%" },
    { key: "unit", Title: "Unit", width: "20%" },
    { key: "price", Title: "Price", width: "10%" },
    {
      key: "action",
      Title: "Action",
      width: "15%",
      sortable: false,
      render: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleDeleteClick(row)}
            className="text-red-500/70 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <Breadcrumb text="You can see your item management" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-[#2563EB] w-10 h-10" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb text="You can see your item management" />

      <div className="mb-6"></div>

      <div className="bg-[#191919] border border-[#1A1A1A] rounded-2xl overflow-visible shadow-sm relative z-0">
        {items.length > 0 ? (
          <Table
            TableHeads={columns}
            TableRows={items}
            headClass=" border-b border-[#1A1A1A] text-gray-200 whitespace-nowrap last:[&>div]:justify-center"
            tableClass="border-none"
          />
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No items found in your inventory.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[600px] p-8 relative shadow-2xl">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadAgentId("");
                setSelectedFiles([]);
              }}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-white text-xl font-bold mb-6">
              Upload Menu File
            </h2>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl p-8 text-center transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  onChange={handleModalFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.csv,.xlsx"
                />
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-500 text-xs">
                      PDF, CSV, or Excel files
                    </p>
                  </div>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto pr-1">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#111111] border border-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="text-gray-300 text-sm truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadAgentId("");
                  setSelectedFiles([]);
                }}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#111111] border border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploadMenuMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {uploadMenuMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[500px] p-8 relative shadow-2xl">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-white text-xl font-bold mb-3 text-center">
              Are you absolutely sure?
            </h2>
            <p className="text-gray-400 text-[14px] leading-relaxed mb-10 text-center px-4">
              This action cannot be undone. This will permanently delete the
              item{" "}
              <span className="text-white font-semibold">
                {deletingItem?.name}
              </span>{" "}
              and remove it from your inventory.
            </p>

            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-white text-black font-semibold px-10 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-[#ef4444] text-white px-10 py-2.5 rounded-full font-semibold hover:bg-red-600 transition-colors text-sm cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManagement;
