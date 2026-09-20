import {
  Status,
  money,
  PageHeader,
  Notice,
  Table,
  EmptyState,
} from "../components/UI";
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { requestAPI, quoteAPI } from "../services/api";
import Modal from "../components/Modal";
import { Eye, Check } from "lucide-react";

const toLocalDateTime = (value) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const closeModal = useCallback(() => setShowModal(false), []);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quoteData, setQuoteData] = useState({
    quoted_price: "",
    scheduled_datetime: "",
    provider_notes: "",
  });
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setError("");
    try {
      const response = await requestAPI.getAllRequests();
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

  const handleQuote = (request) => {
    setSelectedRequest(request);
    setQuoteData({
      quoted_price: request.proposed_budget,
      scheduled_datetime: toLocalDateTime(request.preferred_datetime),
      provider_notes: "",
    });
    setShowModal(true);
  };

  const submitQuote = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessageIsError(false);
    try {
      await quoteAPI.create({
        request_id: selectedRequest.request_id,
        ...quoteData,
      });
      setMessage("Quote sent.");
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      setMessageIsError(true);
      setMessage(error?.response?.data?.error || "Failed to send quote");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="container">
      <PageHeader
        title="Service requests"
        description="Review incoming requests and prepare quotes."
      />
      <Notice message={error} error />
      <Notice message={message} error={messageIsError} />

      <div className="card">
        <h2 style={{ marginBottom: "20px" }}>All requests</h2>

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
                <th>Client</th>
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Photos</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.request_id}>
                  <td>#{request.request_id}</td>
                  <td>
                    {request.first_name} {request.last_name}
                    <br />
                    <small style={{ color: "#64748b" }}>{request.email}</small>
                  </td>
                  <td>{request.service_address}</td>
                  <td>{request.cleaning_type}</td>
                  <td>{request.num_rooms}</td>
                  <td>{money(request.proposed_budget)}</td>
                  <td>
                    <Status value={request.status} />
                  </td>
                  <td>{request.photo_count}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        to={`/request/${request.request_id}`}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        <Eye size={14} /> View
                      </Link>
                      {["pending", "negotiating"].includes(request.status) && (
                        <>
                          <button
                            onClick={() => handleQuote(request)}
                            className="btn btn-success"
                            style={{ padding: "4px 8px", fontSize: "12px" }}
                          >
                            <Check size={14} /> Quote
                          </button>
                        </>
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
        <Modal title="Create quote" onClose={closeModal}>
          <form onSubmit={submitQuote}>
            {messageIsError && <Notice message={message} error />}
            <h2>Create Quote</h2>
            <p>
              <strong>Client:</strong> {selectedRequest.first_name}{" "}
              {selectedRequest.last_name}
            </p>
            <p>
              <strong>Address:</strong> {selectedRequest.service_address}
            </p>

            <div className="form-group">
              <label htmlFor="quoted-price">Quoted Price</label>
              <input
                id="quoted-price"
                type="number"
                step="0.01"
                min="0"
                required
                value={quoteData.quoted_price}
                onChange={(e) =>
                  setQuoteData({ ...quoteData, quoted_price: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="scheduled-date-time">Scheduled Date/Time</label>
              <input
                id="scheduled-date-time"
                type="datetime-local"
                required
                value={quoteData.scheduled_datetime}
                onChange={(e) =>
                  setQuoteData({
                    ...quoteData,
                    scheduled_datetime: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows="3"
                value={quoteData.provider_notes}
                onChange={(e) =>
                  setQuoteData({ ...quoteData, provider_notes: e.target.value })
                }
                placeholder="Additional notes for the client"
              />
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                Send Quote
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

export default AdminRequests;
