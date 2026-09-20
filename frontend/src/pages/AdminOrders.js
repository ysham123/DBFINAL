import { money, PageHeader, Notice, Table, EmptyState } from "../components/UI";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { orderAPI, billAPI } from "../services/api";
import Modal from "../components/Modal";
import { Eye, DollarSign } from "lucide-react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const closeModal = useCallback(() => setShowModal(false), []);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [billAmount, setBillAmount] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setError("");
    try {
      const response = await orderAPI.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Unable to load orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setMessageIsError(false);
    try {
      await orderAPI.updateStatus(orderId, status);
      setMessage(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      setMessageIsError(true);
      setMessage(error?.response?.data?.error || "Failed to update status");
    }
  };

  const handleGenerateBill = (order) => {
    setSelectedOrder(order);
    setBillAmount(order.final_price);
    setShowModal(true);
  };

  const submitBill = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessageIsError(false);
    try {
      await billAPI.create({
        order_id: selectedOrder.order_id,
        amount: billAmount,
      });
      setMessage("Bill generated.");
      setShowModal(false);
      fetchOrders();
    } catch (error) {
      setMessageIsError(true);
      setMessage(error?.response?.data?.error || "Failed to generate bill");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container">
      <PageHeader
        title="Orders"
        description="Manage your schedule and track each service."
      />
      <Notice message={error} error />
      <Notice message={message} error={messageIsError} />

      <div className="card">
        <h2 style={{ marginBottom: "20px" }}>All orders</h2>

        {orders.length === 0 ? (
          <EmptyState
            title={error ? "Records unavailable" : "No orders yet"}
            description={
              error
                ? "Refresh the page to try again."
                : "Accepted quotes will appear here as orders."
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client</th>
                <th>Address</th>
                <th>Type</th>
                <th>Price</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Bill</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>
                    {order.first_name} {order.last_name}
                    <br />
                    <small style={{ color: "#64748b" }}>{order.email}</small>
                  </td>
                  <td>{order.service_address}</td>
                  <td>{order.cleaning_type}</td>
                  <td>{money(order.final_price)}</td>
                  <td>
                    {new Date(order.scheduled_datetime).toLocaleDateString()}
                  </td>
                  <td>
                    <select
                      aria-label={`Status for order ${order.order_id}`}
                      value={order.completion_status}
                      onChange={(e) =>
                        updateOrderStatus(order.order_id, e.target.value)
                      }
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {order.has_bill > 0 ? (
                      <span className="badge badge-completed">Generated</span>
                    ) : (
                      <span className="badge badge-pending">Not Generated</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        to={`/order/${order.order_id}`}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        <Eye size={14} /> View
                      </Link>
                      {order.completion_status === "completed" &&
                        order.has_bill === 0 && (
                          <button
                            onClick={() => handleGenerateBill(order)}
                            className="btn btn-primary"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            <DollarSign size={14} /> Bill
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {showModal && (
        <Modal title="Generate bill" onClose={closeModal}>
          <form onSubmit={submitBill}>
            {messageIsError && <Notice message={message} error />}
            <h2>Generate Bill</h2>
            <p>
              <strong>Order ID:</strong> #{selectedOrder.order_id}
            </p>
            <p>
              <strong>Client:</strong> {selectedOrder.first_name}{" "}
              {selectedOrder.last_name}
            </p>
            <p>
              <strong>Address:</strong> {selectedOrder.service_address}
            </p>

            <div className="form-group">
              <label htmlFor="bill-amount">Bill Amount</label>
              <input
                id="bill-amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                Generate Bill
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default AdminOrders;
