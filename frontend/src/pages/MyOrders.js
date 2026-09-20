import {
  Status,
  money,
  PageHeader,
  Notice,
  Table,
  EmptyState,
} from "../components/UI";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import { Eye } from "lucide-react";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
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

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="container">
      <PageHeader
        title="Your orders"
        description="Upcoming bookings and completed services."
      />
      <Notice message={error} error />
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
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Price</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>{order.service_address}</td>
                  <td>{order.cleaning_type}</td>
                  <td>{order.num_rooms}</td>
                  <td>{money(order.final_price)}</td>
                  <td>
                    {new Date(order.scheduled_datetime).toLocaleDateString()}
                  </td>
                  <td>
                    <Status value={order.completion_status} />
                  </td>
                  <td>
                    <Link
                      to={`/order/${order.order_id}`}
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px" }}
                    >
                      <Eye size={16} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
