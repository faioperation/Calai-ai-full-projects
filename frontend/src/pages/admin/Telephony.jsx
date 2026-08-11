import Breadcrumb from "@/components/Breadcrumb";
import { Icon } from "@iconify/react";
import InputField from "@/components/Inputfield";
import Dropdown from "@/components/Dropdown";
import Table from "@/components/Table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import toast from "react-hot-toast";

import React, { useState } from "react";

const Telephony = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingNumber, setEditingNumber] = useState(null);
  const [deletingNumberId, setDeletingNumberId] = useState(null);

  const [newNumber, setNewNumber] = useState({
    businessId: "",
    twilioNumber: "",
    managerNumber: "",
    vapiAgentId: "",
  });

  const { data: tenantsResponse } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await axiosSecure.get("/system-owner/tenants");
      return res.data;
    },
  });
  const tenants = tenantsResponse?.data || [];
  const tenantNames = tenants.map(
    (t) => t.name || t.business_name || "Unknown",
  );

  const { data: agentsResponse } = useQuery({
    queryKey: ["unconnected-agents", newNumber.businessId],
    queryFn: async () => {
      if (!newNumber.businessId) return { data: [] };
      try {
        const res = await axiosSecure.get(
          `/system-owner/telephony/unconnected-agents/${newNumber.businessId}`,
        );
        return res.data;
      } catch (err) {
        return { data: [] };
      }
    },
    enabled: !!newNumber.businessId,
  });
  const unconnectedAgents = agentsResponse?.data || [];
  const agentNames = unconnectedAgents.map(
    (a) => a.name || a.agentName || a.agent_name || "Unnamed Agent",
  );

  const {
    data: telephonyResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["telephony"],
    queryFn: async () => {
      const res = await axiosSecure.get("/system-owner/telephony");
      return res.data;
    },
  });

  const numbers = telephonyResponse?.data || [];

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosSecure.post("/system-owner/telephony", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telephony"] });
      toast.success("Number added successfully");
      setIsAddModalOpen(false);
      setNewNumber({
        businessId: "",
        twilioNumber: "",
        managerNumber: "",
        vapiAgentId: "",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add number");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(
        `/system-owner/telephony/${id}`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telephony"] });
      toast.success("Number updated successfully");
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update number");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/system-owner/telephony/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telephony"] });
      toast.success("Number deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingNumberId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete number");
    },
  });

  const handleAddNumber = () => {
    addMutation.mutate({
      businessId: newNumber.businessId,
      twilio_number: newNumber.twilioNumber,
      manager_number: newNumber.managerNumber,
      assistant_id: newNumber.vapiAgentId,
    });
  };

  const handleEditClick = (number) => {
    setEditingNumber({ ...number });
    setIsEditModalOpen(true);
  };

  const handleUpdateNumber = () => {
    if (editingNumber) {
      updateMutation.mutate({
        id: editingNumber.id,
        data: {
          twilio_number: editingNumber.twilioNumber,
          manager_number: editingNumber.managerNumber,
        },
      });
    }
  };

  const handleDeleteNumber = (id) => {
    setDeletingNumberId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingNumberId) {
      deleteMutation.mutate(deletingNumberId);
    }
  };

  const columns = [
    {
      key: "business",
      Title: "Business",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.business?.name || "N/A"}
        </div>
      ),
    },
    {
      key: "phoneNumber",
      Title: "Twilio Number",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.twilioNumber || "N/A"}
        </div>
      ),
    },
    {
      key: "managerNumber",
      Title: "Manager Number",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">
          {row.managerNumber || "N/A"}
        </div>
      ),
    },
    {
      key: "agentName",
      Title: "Agent Name",
      width: "30%",
      sortable: true,
      render: (row) => {
        const name = row.agentName || "N/A";
        return (
          <div className="text-left text-gray-200 truncate pr-4" title={name}>
            {name}
          </div>
        );
      },
    },
    {
      key: "actions",
      Title: "Action",
      width: "10%",
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-start gap-3">
          <button
            onClick={() => handleEditClick(row)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Edit"
          >
            <Icon icon="lucide:square-pen" className="text-lg" />
          </button>
          <button
            onClick={() => handleDeleteNumber(row.id)}
            className="text-[#EA4335] hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Icon icon="lucide:trash-2" className="text-lg" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <Breadcrumb
            text={`Import and manage Twilio phone numbers linked to businesses and AI Agents.`}
          />
        </div>

        <div className="mb-6 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 whitespace-nowrap bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white px-5 py-2 rounded-full text-lg cursor-pointer"
          >
            <Icon icon="lucide:plus" className="text-lg shrink-0" />
            Import Number
          </button>
        </div>
      </div>

      <div className="bg-[#191919] rounded-2xl border border-gray-800/50 overflow-hidden w-full relative min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-white">
            Loading...
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-red-500">
            Error:{" "}
            {error?.response?.data?.message ||
              error?.message ||
              "Failed to fetch telephony config"}
          </div>
        ) : (
          <Table
            TableHeads={columns}
            TableRows={numbers}
            headClass="[&>div]:justify-start border-none text-left whitespace-nowrap"
            tableClass="border-none"
          />
        )}
      </div>

      {/* Add Number Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[550px] px-8 py-12 relative shadow-2xl overflow-y-auto hide-scrollbar">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <Icon icon="lucide:x" className="text-xl" />
            </button>

            <h2 className="text-white text-xl font-semibold mb-1">
              Add Number
            </h2>
            <p className="text-gray-400 text-[13px] mb-8">
              Import Twilio Number
            </p>

            <div className="space-y-6">
              <Dropdown
                label="Business Name"
                options={tenantNames}
                placeholder="Select business"
                value={
                  tenants.find((t) => t.id === newNumber.businessId)?.name ||
                  tenants.find((t) => t.id === newNumber.businessId)
                    ?.business_name ||
                  ""
                }
                onSelect={(val) => {
                  const t = tenants.find(
                    (t) => (t.name || t.business_name) === val,
                  );
                  if (t) setNewNumber({ ...newNumber, businessId: t.id });
                }}
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
                optionClass="!bg-white !text-[#111]"
                icon="!text-gray-500"
              />

              <InputField
                label="Twilio Number"
                placeholder="+1 (555) 000-0000"
                value={newNumber.twilioNumber}
                onChange={(e) =>
                  setNewNumber({ ...newNumber, twilioNumber: e.target.value })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />

              <InputField
                label="Manager Number"
                placeholder="+1 (555) 000-0000"
                value={newNumber.managerNumber}
                onChange={(e) =>
                  setNewNumber({ ...newNumber, managerNumber: e.target.value })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />

              <Dropdown
                label="Unconnected Agent"
                options={agentNames}
                placeholder="Select agent"
                value={(() => {
                  const a = unconnectedAgents.find(
                    (agent) =>
                      (agent.vapiAgentId || agent.id) === newNumber.vapiAgentId,
                  );
                  return a
                    ? a.name || a.agentName || a.agent_name || "Unnamed Agent"
                    : "";
                })()}
                onSelect={(val) => {
                  const a = unconnectedAgents.find(
                    (agent) =>
                      (agent.name ||
                        agent.agentName ||
                        agent.agent_name ||
                        "Unnamed Agent") === val,
                  );
                  if (a)
                    setNewNumber({
                      ...newNumber,
                      vapiAgentId: a.vapiAgentId || a.id,
                    });
                }}
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
                optionClass="!bg-white !text-[#111]"
                icon="!text-gray-500"
              />
            </div>

            <div className="flex items-center justify-center gap-5 mt-10">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-white text-black font-semibold px-8 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNumber}
                disabled={addMutation.isPending}
                className="bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white px-8 py-2.5 rounded-full font-semibold border border-[#1e3a8a] shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all text-sm disabled:opacity-50"
              >
                {addMutation.isPending ? "Adding..." : "Add Number"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Number Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[550px] px-8 py-12 relative shadow-2xl overflow-y-auto hide-scrollbar">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <Icon icon="lucide:x" className="text-xl" />
            </button>

            <h2 className="text-white text-xl font-semibold mb-1">
              Edit Number
            </h2>
            <p className="text-gray-400 text-[13px] mb-8">
              Update imported number details
            </p>

            <div className="space-y-6">
              <InputField
                label="Twilio Number"
                placeholder="+1 (555) 000-0000"
                value={editingNumber?.twilioNumber || ""}
                onChange={(e) =>
                  setEditingNumber({
                    ...editingNumber,
                    twilioNumber: e.target.value,
                  })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />

              <InputField
                label="Manager Number"
                placeholder="+1 (555) 000-0000"
                value={editingNumber?.managerNumber || ""}
                onChange={(e) =>
                  setEditingNumber({
                    ...editingNumber,
                    managerNumber: e.target.value,
                  })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />
            </div>

            <div className="flex items-center justify-center gap-5 mt-10">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-white text-black font-semibold px-8 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateNumber}
                disabled={updateMutation.isPending}
                className="bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white px-8 py-2.5 rounded-full font-semibold border border-[#1e3a8a] shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all text-sm disabled:opacity-50"
              >
                {updateMutation.isPending ? "Updating..." : "Update Number"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[500px] p-8 relative shadow-2xl">
            <h2 className="text-white text-xl font-bold mb-3">
              Are you absolutely sure?
            </h2>
            <p className="text-gray-400 text-[14px] leading-relaxed mb-10 pr-4">
              This action cannot be undone. This will permanently delete the
              telephony configuration from the platform.
            </p>

            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-white text-black font-semibold px-10 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-[#ef4444] text-white px-10 py-2.5 rounded-full font-semibold hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telephony;
