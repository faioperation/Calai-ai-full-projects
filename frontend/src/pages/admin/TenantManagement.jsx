import React, { useState } from "react";
import Table from "../../components/Table";
import { Icon } from "@iconify/react";
import InputField from "../../components/Inputfield";
import Dropdown from "../../components/Dropdown";
import Password from "../../components/Password";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

const TenantManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const {
    data: tenantsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await axiosSecure.get("/system-owner/tenants");
      return res.data;
    },
  });

  const tenants = tenantsResponse?.data || [];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTenant, setNewTenant] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    business_name: "",
    phone: "",
    business_type: "restaurent",
  });

  const addMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosSecure.post("/system-owner/tenants", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant added successfully");
      setIsAddModalOpen(false);
      setNewTenant({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        business_name: "",
        phone: "",
        business_type: "restaurent",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add tenant");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(`/system-owner/tenants/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant updated successfully");
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update tenant");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/system-owner/tenants/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingTenantId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete tenant");
    },
  });

  const handleEditClick = (tenant) => {
    setEditingTenant({
      id: tenant.id,
      name: tenant.name,
      status: tenant.status?.toLowerCase() || "active",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingTenant) {
      updateMutation.mutate({
        id: editingTenant.id,
        data: {
          name: editingTenant.name,
          status: editingTenant.status,
        },
      });
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingTenantId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingTenantId) {
      deleteMutation.mutate(deletingTenantId);
    }
  };

  const handleAddTenant = () => {
    if (newTenant.first_name && newTenant.email && newTenant.password) {
      addMutation.mutate(newTenant);
    } else {
      toast.error("Please fill all required fields");
    }
  };



  const columns = [
    {
      key: "name",
      Title: "Tenant Name",
      width: "25%",
      sortable: true,
      render: (row) => (
        <div className="text-left text-gray-200">{row.name}</div>
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
      key: "status",
      Title: "Status",
      width: "15%",
      sortable: true,
      render: (row) => {
        const statusLower = row.status?.toLowerCase();
        let bgClass = "bg-gray-500";
        if (statusLower === "active") bgClass = "bg-[#4285F4]";
        else if (statusLower === "suspended") bgClass = "bg-[#EA4335]";
        else if (statusLower === "expired") bgClass = "bg-[#7A8293]";

        return (
          <div className="text-left">
            <span
              className={`w-[85px] inline-block text-center px-2 py-1 text-[11px] font-medium text-white rounded-[4px] transition-colors duration-300 ${bgClass} capitalize`}
            >
              {row.status || "Unknown"}
            </span>
          </div>
        );
      },
    },
    {
      key: "expiry",
      Title: "Expiry Date",
      width: "20%",
      sortable: true,
      render: (row) => {
        const dateStr = row.expiry_date
          ? new Date(row.expiry_date).toLocaleDateString("en-GB")
          : "N/A";
        return <div className="text-left text-gray-200">{dateStr}</div>;
      },
    },
    {
      key: "actions",
      Title: "Action",
      width: "20%",
      sortable: false,
      render: (row) => {
        return (
          <div className="flex items-center justify-start gap-8">
            <Link to={`/admin/tenant-management/view/${row.id}`}>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                title="View"
              >
                <Icon icon="lucide:eye" className="text-lg" />
              </button>
            </Link>
            <button
              onClick={() => handleEditClick(row)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Edit"
            >
              <Icon icon="lucide:square-pen" className="text-lg" />
            </button>
            <button
              onClick={() => handleDeleteClick(row.id)}
              className="text-[#EA4335] hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Icon icon="lucide:trash-2" className="text-lg" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white px-5 py-3 rounded-full text-lg"
        >
          <Icon icon="lucide:plus" className="text-lg" />
          Add Tenant
        </button>
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
              "Failed to fetch tenants"}
          </div>
        ) : (
          <Table
            TableHeads={columns}
            TableRows={tenants}
            headClass="[&>div]:justify-start border-none text-left whitespace-nowrap"
            tableClass="border-none"
          />
        )}
      </div>

      {/* Edit Tenant Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[550px] p-8 relative shadow-2xl">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <Icon icon="lucide:x" className="text-xl" />
            </button>

            <h2 className="text-white text-xl font-semibold mb-1">
              Edit Tenant
            </h2>
            <p className="text-gray-400 text-[13px] mb-8">
              Update tenant information.
            </p>

            <div className="space-y-6">
              <InputField
                label="Tenant Name"
                value={editingTenant?.name || ""}
                onChange={(e) =>
                  setEditingTenant({ ...editingTenant, name: e.target.value })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />

              <Dropdown
                label="Status"
                options={["active", "suspended", "trial", "expired"]}
                value={editingTenant?.status || "active"}
                onSelect={(val) =>
                  setEditingTenant({ ...editingTenant, status: val })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm capitalize"
                optionClass="!bg-white !text-[#111] capitalize"
                icon="!text-gray-500"
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
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white px-8 py-2.5 rounded-full font-semibold border border-[#1e3a8a] shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all text-sm disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
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
              tenant account and remove all associated data from the platform.
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

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0E0E10] border border-gray-800 rounded-[20px] w-full max-w-[550px] p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] hide-scrollbar">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <Icon icon="lucide:x" className="text-xl" />
            </button>

            <h2 className="text-white text-xl font-semibold mb-1">
              Add Tenant
            </h2>
            <p className="text-gray-400 text-[13px] mb-8">
              Add tenant information.
            </p>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  placeholder="Enter first name"
                  value={newTenant.first_name}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, first_name: e.target.value })
                  }
                  labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                  inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
                />
                <InputField
                  label="Last Name"
                  placeholder="Enter last name"
                  value={newTenant.last_name}
                  onChange={(e) =>
                    setNewTenant({ ...newTenant, last_name: e.target.value })
                  }
                  labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                  inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
                />
              </div>

              <InputField
                label="Business Name"
                placeholder="Enter business name"
                value={newTenant.business_name}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, business_name: e.target.value })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />

              <Dropdown
                label="Business Type"
                options={[
                  { label: "Restaurant", value: "restaurent" },
                  { label: "Takeaway", value: "take_way" },
                ]}
                value={newTenant.business_type || "restaurent"}
                onSelect={(val) =>
                  setNewTenant({ ...newTenant, business_type: val })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
                optionClass="!bg-white !text-[#111]"
                icon="!text-gray-500"
              />

              <InputField
                label="Email"
                placeholder="Enter email"
                value={newTenant.email}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, email: e.target.value })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />

              <InputField
                label="Phone"
                placeholder="Enter phone number"
                value={newTenant.phone}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, phone: e.target.value })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
              />

              <Password
                label="Password"
                placeholder="Enter password"
                value={newTenant.password}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, password: e.target.value })
                }
                labelClass="!text-gray-200 !text-[13px] !mb-1 !font-medium"
                inputClass="!bg-[#F5F5F5] !border-none !text-[#111] !rounded-xl !py-3.5 !px-4 !font-medium !text-sm"
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
                onClick={handleAddTenant}
                disabled={addMutation.isPending}
                className="bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white px-8 py-2.5 rounded-full font-semibold border border-[#1e3a8a] shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)] transition-all text-sm disabled:opacity-50"
              >
                {addMutation.isPending ? "Adding..." : "Add Tenant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;
