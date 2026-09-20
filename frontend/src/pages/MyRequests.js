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
import { requestAPI } from "../services/api";
import { Eye } from "lucide-react";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestAPI.getMyRequests();
      setRequests(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Unable to load requests. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="container">
      <PageHeader
        title="Service requests"
        description="Review your requests, quotes, and updates."
      />
      <Notice message={error} error />
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2>All requests</h2>
          <Link to="/new-request" className="btn btn-primary">
            + New request
          </Link>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            title={error ? "Records unavailable" : "No requests yet"}
            description={
              error
                ? "Refresh the page to try again."
                : "New service requests will appear here."
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.request_id}>
                  <td>#{request.request_id}</td>
                  <td>{request.service_address}</td>
                  <td>{request.cleaning_type}</td>
                  <td>{request.num_rooms}</td>
                  <td>{money(request.proposed_budget)}</td>
                  <td>
                    <Status value={request.status} />
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link
                      to={`/request/${request.request_id}`}
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

export default MyRequests;
