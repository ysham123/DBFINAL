import { Status, money, Notice } from "../components/UI";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { billAPI } from "../services/api";
import { ArrowLeft } from "lucide-react";

function BillDetails() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [disputeNote, setDisputeNote] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchBill = useCallback(async () => {
    try {
      const response = await billAPI.getBill(id);
      setBill(response.data);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Unable to load these details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const handlePay = async () => {
    if (submitting) return;
    setMessageIsError(false);
    setSubmitting(true);
    try {
      await billAPI.payBill(id);
      setMessage("Payment recorded.");
      fetchBill();
    } catch (error) {
      setMessageIsError(true);
      setMessage(error.response?.data?.error || "Failed to pay bill");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispute = async () => {
    if (submitting) return;
    setMessageIsError(false);
    if (!disputeNote.trim()) {
      setMessageIsError(true);
      setMessage("Please enter a dispute note");
      return;
    }
    setSubmitting(true);
    try {
      await billAPI.disputeBill(id, { dispute_note: disputeNote });
      setMessage("Bill disputed successfully");
      fetchBill();
      setDisputeNote("");
    } catch (error) {
      setMessageIsError(true);
      setMessage(error.response?.data?.error || "Failed to dispute bill");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!bill) {
    return (
      <div className="container">
        <Notice message={error || "Bill not found"} error />
      </div>
    );
  }

  const canPay = !isAdmin && bill.bill_status !== "paid";
  const canDispute =
    bill.bill_status === "pending" || bill.bill_status === "revised";

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      <button
        disabled={submitting}
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: "20px" }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <Notice message={message} error={messageIsError} />
      <Notice message={error} error />

      <div className="card">
        <h2>Bill #{bill.bill_id}</h2>
        <Status value={bill.bill_status} />

        <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
          <h3>Bill Details</h3>
          <div>
            <strong>Amount:</strong>{" "}
            <span style={{ fontSize: "24px", color: "var(--accent)" }}>
              {money(bill.amount)}
            </span>
          </div>
          <div>
            <strong>Order ID:</strong> #{bill.order_id}
          </div>
          <div>
            <strong>Service Address:</strong> {bill.service_address}
          </div>
          <div>
            <strong>Cleaning Type:</strong> {bill.cleaning_type}
          </div>
          <div>
            <strong>Bill Created:</strong>{" "}
            {new Date(bill.created_at).toLocaleString()}
          </div>
          {bill.payment_datetime && (
            <div>
              <strong>Paid At:</strong>{" "}
              {new Date(bill.payment_datetime).toLocaleString()}
            </div>
          )}
          {bill.dispute_note && (
            <div>
              <strong>Dispute Note:</strong> {bill.dispute_note}
            </div>
          )}
        </div>

        {canPay && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              background: "#f8fafc",
              borderRadius: "8px",
            }}
          >
            <h3>Payment</h3>
            <p className="service-meta">
              Record a payment made outside this app. No card will be charged.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                disabled={submitting}
                onClick={handlePay}
                className="btn btn-success"
              >
                Mark as paid
              </button>
              {canDispute && (
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    aria-label="Reason for dispute"
                    placeholder="Explain the issue with this bill"
                    value={disputeNote}
                    onChange={(e) => setDisputeNote(e.target.value)}
                    style={{ width: "100%", marginBottom: "8px" }}
                  />
                  <button
                    disabled={submitting}
                    onClick={handleDispute}
                    className="btn btn-danger"
                  >
                    Dispute Bill
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {bill.revisions && bill.revisions.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h3>Revision History</h3>
            {bill.revisions.map((revision, index) => (
              <div
                key={revision.revision_id}
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "8px",
                  marginTop: "12px",
                }}
              >
                <div>
                  <strong>Revision #{index + 1}</strong>
                </div>
                <div>
                  <strong>Amount:</strong> {money(revision.revised_amount)}
                </div>
                <div>
                  <strong>By:</strong>{" "}
                  {revision.revised_by === "client"
                    ? "Client"
                    : "Administrator"}
                </div>
                <div>
                  <strong>Note:</strong> {revision.revision_note || "None"}
                </div>
                <div>
                  <strong>Date:</strong>{" "}
                  {new Date(revision.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BillDetails;
