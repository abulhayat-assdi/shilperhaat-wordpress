"use client";

import { useState } from "react";
import { X, Loader2, Truck, CheckCircle2, Trash2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Order } from "@/types";
import {
  formatPriceEn,
  formatDateEn,
  ORDER_STATUS_COLOR,
} from "@/lib/utils";

const ORDER_STATUS_EN: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

interface CourierInfo {
  consignmentId: string;
  trackingCode: string;
  sentAt: string;
}

interface OrdersClientProps {
  orders: Order[];
}

// Statuses the admin can choose from. CONFIRMED/PROCESSING still exist in the
// DB enum and ORDER_STATUS_EN for display, but are no longer selectable.
const statusOptions = [
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function OrdersClient({ orders: initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Courier state
  const [courierDialog, setCourierDialog] = useState<Order | null>(null);
  const [sendingCourierId, setSendingCourierId] = useState<string | null>(null);
  const [courierMap, setCourierMap] = useState<Record<string, CourierInfo>>({});
  const [courierError, setCourierError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNote(order.adminNote || "");
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = newStatus as Order["status"];
      setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: updated, adminNote } : o)));
      setSelectedOrder((prev) => (prev ? { ...prev, status: updated, adminNote } : null));
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Inline status update straight from the table row
  const updateStatusInline = async (order: Order, status: string) => {
    setStatusUpdatingId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = status as Order["status"];
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: updated } : o)));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: updated } : null));
        setNewStatus(updated);
      }
    } catch {
      alert("Failed to update order status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openDeleteDialog = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setDeleteError(null);
    setDeleteDialog(order);
  };

  const deleteOrder = async (order: Order) => {
    setDeletingId(order.id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete order.");
        return;
      }
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (selectedOrder?.id === order.id) setSelectedOrder(null);
      setDeleteDialog(null);
      setSuccessToast(`✓ Order ${order.orderNumber} deleted.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch {
      setDeleteError("Failed to delete order.");
    } finally {
      setDeletingId(null);
    }
  };

  const openCourierDialog = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    setCourierError(null);
    setCourierDialog(order);
  };

  const sendToCourier = async (order: Order) => {
    setSendingCourierId(order.id);
    setCourierError(null);

    // Read credentials saved in localStorage by the Settings page
    const apiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("steadfast_api_key") || ""
        : "";
    const secretKey =
      typeof window !== "undefined"
        ? localStorage.getItem("steadfast_secret_key") || ""
        : "";

    try {
      const res = await fetch("/api/courier/steadfast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.phone,
          address: order.address,
          total: order.total,
          specialNotes: order.notes || "",
          apiKey,
          secretKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCourierError(data.error || "Failed to send to courier");
        return;
      }

      const info: CourierInfo = {
        consignmentId: data.consignmentId,
        trackingCode: data.trackingCode,
        sentAt: new Date().toISOString(),
      };

      setCourierMap((prev) => ({ ...prev, [order.id]: info }));

      // Persist status → SHIPPED and the courier tracking info to the DB
      try {
        await fetch(`/api/admin/orders/${order.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "SHIPPED",
            courierConsignmentId: String(info.consignmentId ?? ""),
            courierTrackingCode: String(info.trackingCode ?? ""),
            courierSentAt: info.sentAt,
          }),
        });
      } catch {
        // Courier order was created; status persistence is best-effort
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? { ...o, status: "SHIPPED" as Order["status"] }
            : o
        )
      );
      if (selectedOrder?.id === order.id) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "SHIPPED" as Order["status"] } : null
        );
        setNewStatus("SHIPPED");
      }

      setSuccessToast(
        `✓ Order sent to Steadfast! Tracking ID: ${data.trackingCode}`
      );
      setTimeout(() => setSuccessToast(null), 5000);
      setCourierDialog(null);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setCourierError(`Failed to connect to Steadfast API: ${detail}`);
    } finally {
      setSendingCourierId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Success toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[100] bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium max-w-sm"
          >
            <span className="flex-1">{successToast}</span>
            <button onClick={() => setSuccessToast(null)} className="hover:opacity-70 ml-1">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Orders</h2>
          <p className="text-gray-500 text-sm">{orders.length} orders total</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#800000]"
        >
          <option value="">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_EN[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Order #</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const courier = courierMap[order.id];
                return (
                  <tr
                    key={order.id}
                    onClick={() => openOrder(order)}
                    className="transition-colors cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9f9f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#800000]">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{order.customerName}</p>
                        <p className="text-xs text-gray-400">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">
                      {formatDateEn(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {formatPriceEn(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}
                      >
                        {ORDER_STATUS_EN[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {courier ? (
                          <div className="text-xs space-y-0.5">
                            <p className="text-green-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              Sent
                            </p>
                            <p className="text-gray-500 font-mono text-[11px] leading-tight">
                              {courier.consignmentId}
                            </p>
                            <button
                              onClick={(e) => openCourierDialog(e, order)}
                              className="text-gray-400 underline text-[11px] hover:text-gray-600 transition-colors"
                            >
                              Resend
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => openCourierDialog(e, order)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-xs font-semibold transition-colors whitespace-nowrap"
                            style={{ backgroundColor: "#1a3a6b" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#142d54")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "#1a3a6b")
                            }
                          >
                            <Truck size={12} />
                            Send to Courier
                          </button>
                        )}
                        <button
                          onClick={(e) => openDeleteDialog(e, order)}
                          title="Delete order"
                          aria-label={`Delete order ${order.orderNumber}`}
                          className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>

                        {/* Quick status update */}
                        <div className="relative flex items-center">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatusInline(order, e.target.value)}
                            disabled={statusUpdatingId === order.id}
                            title="Update status"
                            aria-label={`Update status for order ${order.orderNumber}`}
                            className="border border-gray-200 rounded-md pl-2.5 pr-7 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-[#800000] cursor-pointer bg-white appearance-none disabled:opacity-50 whitespace-nowrap"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_EN[s]}
                              </option>
                            ))}
                          </select>
                          {statusUpdatingId === order.id ? (
                            <Loader2
                              size={13}
                              className="animate-spin text-gray-400 absolute right-2 pointer-events-none"
                            />
                          ) : (
                            <ChevronDown
                              size={13}
                              className="text-gray-400 absolute right-2 pointer-events-none"
                            />
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>No orders found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Courier Confirmation Dialog */}
      <AnimatePresence>
        {courierDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70]"
              onClick={() => !sendingCourierId && setCourierDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto">
                <h3 className="font-bold text-gray-800 text-base mb-1">
                  Send to Steadfast Courier?
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Review the order before sending
                </p>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order #</span>
                    <span className="font-mono font-semibold text-[#800000]">
                      {courierDialog.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer</span>
                    <span className="font-medium">{courierDialog.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span>{courierDialog.phone}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-500">Address</span>
                    <p className="text-gray-700 text-xs">{courierDialog.address}</p>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                    <span>Total (COD)</span>
                    <span className="text-[#800000]">
                      {formatPriceEn(courierDialog.total)}
                    </span>
                  </div>
                </div>

                {courierError && (
                  <div className="text-red-600 text-xs mb-3 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {courierError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCourierDialog(null);
                      setCourierError(null);
                    }}
                    disabled={!!sendingCourierId}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => sendToCourier(courierDialog)}
                    disabled={!!sendingCourierId}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                    style={{ backgroundColor: "#1a3a6b" }}
                  >
                    {sendingCourierId === courierDialog.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Confirm & Send"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70]"
              onClick={() => !deletingId && setDeleteDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 flex-shrink-0">
                    <Trash2 size={18} />
                  </span>
                  <h3 className="font-bold text-gray-800 text-base">Delete this order?</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Order{" "}
                  <span className="font-mono font-semibold text-[#800000]">
                    {deleteDialog.orderNumber}
                  </span>{" "}
                  ({deleteDialog.customerName}) will be permanently deleted. This cannot be undone.
                </p>

                {deleteError && (
                  <div className="text-red-600 text-xs mb-3 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {deleteError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setDeleteDialog(null);
                      setDeleteError(null);
                    }}
                    disabled={!!deletingId}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteOrder(deleteDialog)}
                    disabled={!!deletingId}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-red-700 disabled:opacity-70"
                  >
                    {deletingId === deleteDialog.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Order"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Detail Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[60] w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-800">Order Details</h3>
                    <p className="font-mono text-[#800000] text-sm">
                      #{selectedOrder.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Status badge */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-5 ${ORDER_STATUS_COLOR[selectedOrder.status]}`}
                >
                  {ORDER_STATUS_EN[selectedOrder.status]}
                </span>

                {/* Customer info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-gray-700 text-sm mb-3">Customer</h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-gray-800">{selectedOrder.customerName}</p>
                    <p className="text-gray-600">📞 {selectedOrder.phone}</p>
                    <p className="text-gray-600">📍 {selectedOrder.address}</p>
                    {selectedOrder.notes && (
                      <p className="text-gray-500 italic">📝 {selectedOrder.notes}</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 text-sm mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {item.productTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {formatPriceEn(item.price)}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-800 ml-4">
                          {formatPriceEn(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPriceEn(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span>{formatPriceEn(selectedOrder.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-[#800000]">
                      {formatPriceEn(selectedOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Courier info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <h4 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                    <Truck size={14} />
                    Courier
                  </h4>
                  {courierMap[selectedOrder.id] ? (
                    <div className="space-y-1.5 text-sm">
                      <p className="text-gray-600">
                        Courier:{" "}
                        <span className="font-medium text-gray-800">Steadfast</span>
                      </p>
                      <p className="text-gray-600">
                        Consignment ID:{" "}
                        <span className="font-mono font-medium text-gray-800">
                          {courierMap[selectedOrder.id].consignmentId}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Tracking Code:{" "}
                        <span className="font-mono font-medium text-gray-800">
                          {courierMap[selectedOrder.id].trackingCode}
                        </span>
                      </p>
                      <a
                        href={`https://steadfast.com.bd/t/${courierMap[selectedOrder.id].trackingCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 text-xs hover:underline"
                      >
                        Track on Steadfast →
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Not sent to courier yet</p>
                  )}
                </div>

                {/* Update status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">Update Status</h4>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#800000]"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_EN[s]}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Internal admin note..."
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#800000] resize-none"
                  />

                  <button
                    onClick={updateOrderStatus}
                    disabled={updatingStatus}
                    className="w-full flex items-center justify-center gap-2 bg-[#800000] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-70"
                  >
                    {updatingStatus ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Order"
                    )}
                  </button>

                  <button
                    onClick={(e) => openDeleteDialog(e, selectedOrder)}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-3 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete Order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
