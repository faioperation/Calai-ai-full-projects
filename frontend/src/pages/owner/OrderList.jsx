import React, { useState } from "react";
import { Eye, X, Printer, Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import toast from "react-hot-toast";

import Table from "../../components/Table";
import Breadcrumb from "../../components/Breadcrumb";

const OrderList = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["ordersList"],
    queryFn: async () => {
      const res = await axiosSecure.get("/business-owner/order");
      return res.data;
    },
  });

  const { data: orderDetailsResponse, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["orderDetail", selectedOrderId],
    enabled: !!selectedOrderId,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/business-owner/order/${selectedOrderId}`,
      );
      return res.data;
    },
  });

  const orders = ordersResponse?.data || [];
  const selectedOrder = orderDetailsResponse?.data;
  const orderProducts = selectedOrder?.items || [];

  const handleViewClick = (order) => {
    setSelectedOrderId(order.id);
  };

  const closeModal = () => {
    setSelectedOrderId(null);
  };

  const handleDownload = async () => {
    if (!selectedOrder) return;
    try {
      const toastId = toast.loading("Downloading receipt...");
      const res = await axiosSecure.get(
        `/business-owner/order/download/${selectedOrder.id}`,
        {
          responseType: "text",
        },
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/plain" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Receipt_${selectedOrder.id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Download complete", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to download receipt");
    }
  };

  const handlePrint = async () => {
    if (!selectedOrder) return;
    try {
      const toastId = toast.loading("Preparing print...");
      const res = await axiosSecure.get(
        `/business-owner/order/download/${selectedOrder.id}`,
        {
          responseType: "text",
        },
      );
      toast.dismiss(toastId);
      
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Receipt</title>
              <style>
                body {
                  font-family: monospace;
                  white-space: pre;
                  padding: 20px;
                  margin: 0;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>${res.data}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 100);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to prepare print");
    }
  };

  const columns = [
    { key: "number", Title: "Number", width: "25%" },
    { key: "customerName", Title: "Customer Name", width: "20%" },
    { key: "time", Title: "Time", width: "15%" },
    { key: "date", Title: "Date", width: "15%" },
    { key: "orderType", Title: "Order Type", width: "10%" },
    {
      key: "action",
      Title: "Action",
      width: "15%",
      sortable: false,
      render: (row) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleViewClick(row)}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <Breadcrumb text="You can see your order" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-[#2563EB] w-10 h-10" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb text="You can see your order" />

      <div className="bg-[#191919] border border-[#1A1A1A] rounded-2xl overflow-hidden shadow-sm">
        {orders.length > 0 ? (
          <Table
            TableHeads={columns}
            TableRows={orders}
            headClass=" border-b border-[#1A1A1A] text-gray-200 whitespace-nowrap last:[&>div]:justify-center"
            tableClass="border-none"
          />
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            No orders found.
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-white">
          <div className="bg-[#111111] border border-[#1A1A1A] rounded-[20px] w-full max-w-[700px] overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="px-8 py-6 border-b border-[#1A1A1A] flex justify-between items-center">
              <h2 className="text-[17px] text-gray-200">
                Order Summary{" "}
                {selectedOrder && (
                  <span className="text-gray-400">
                    ({selectedOrder.customerName})
                  </span>
                )}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDetailsLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="animate-spin text-[#2563EB] w-8 h-8" />
              </div>
            ) : (
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
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-[#1A2255] hover:bg-[#232D70] transition-colors text-white px-6 py-2.5 rounded-[10px] text-[13px] font-medium cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-[#1A2255] hover:bg-[#232D70] transition-colors text-white px-6 py-2.5 rounded-[10px] text-[13px] font-medium cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
