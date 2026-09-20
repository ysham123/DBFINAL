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
import { billAPI } from "../services/api";
import { Eye } from "lucide-react";

function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await billAPI.getMyBills();
      setBills(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Unable to load bills. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading bills...</div>;
  }

  return (
    <div className="container">
      <PageHeader
        title="Billing"
        description="Review your bills and payment history."
      />
      <Notice message={error} error />
      <div className="card">
        <h2 style={{ marginBottom: "20px" }}>All bills</h2>

        {bills.length === 0 ? (
          <EmptyState
            title={error ? "Records unavailable" : "No bills yet"}
            description={
              error
                ? "Refresh the page to try again."
                : "Bills will appear here when a service is completed."
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Order ID</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.bill_id}>
                  <td>#{bill.bill_id}</td>
                  <td>#{bill.order_id}</td>
                  <td>{bill.service_address}</td>
                  <td>{money(bill.amount)}</td>
                  <td>
                    <Status value={bill.bill_status} />
                  </td>
                  <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link
                      to={`/bill/${bill.bill_id}`}
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

export default MyBills;
