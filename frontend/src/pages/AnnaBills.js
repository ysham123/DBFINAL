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
import { billAPI } from "../services/api";
import Modal from "../components/Modal";
import { Eye, Edit } from "lucide-react";

function AnnaBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const closeModal = useCallback(() => setShowModal(false), []);
  const [selectedBill, setSelectedBill] = useState(null);
  const [revisedAmount, setRevisedAmount] = useState("");
  const [revisionNote, setRevisionNote] = useState("");
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setError("");
    try {
      const response = await billAPI.getAllBills();
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

  const handleRevise = (bill) => {
    setSelectedBill(bill);
    setRevisedAmount(bill.amount);
    setRevisionNote("");
    setShowModal(true);
  };

  const submitRevision = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessageIsError(false);
    try {
      await billAPI.reviseBill(selectedBill.bill_id, {
        revised_amount: revisedAmount,
        revision_note: revisionNote,
      });
      setMessage("Bill revised.");
      setShowModal(false);
      fetchBills();
    } catch (error) {
      setMessageIsError(true);
      setMessage(error?.response?.data?.error || "Failed to revise bill");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading bills...</div>;
  }

  return (
    <div className="container">
      <PageHeader
        title="Billing"
        description="Manage bills, payments, and revisions."
      />
      <Notice message={error} error />
      <Notice message={message} error={messageIsError} />

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
                <th>Client</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Days Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.bill_id}>
                  <td>#{bill.bill_id}</td>
                  <td>#{bill.order_id}</td>
                  <td>
                    {bill.first_name} {bill.last_name}
                    <br />
                    <small style={{ color: "#64748b" }}>{bill.email}</small>
                  </td>
                  <td>{bill.service_address}</td>
                  <td>{money(bill.amount)}</td>
                  <td>
                    <Status value={bill.bill_status} />
                  </td>
                  <td>
                    {bill.days_since_generated > 7 &&
                    bill.bill_status !== "paid" ? (
                      <span style={{ color: "#ef4444", fontWeight: "600" }}>
                        {bill.days_since_generated} days
                      </span>
                    ) : (
                      `${bill.days_since_generated} days`
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        to={`/bill/${bill.bill_id}`}
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        <Eye size={14} /> View
                      </Link>
                      {bill.bill_status === "disputed" && (
                        <button
                          onClick={() => handleRevise(bill)}
                          className="btn btn-primary"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                        >
                          <Edit size={14} /> Revise
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
        <Modal title="Revise bill" onClose={closeModal}>
          <form onSubmit={submitRevision}>
            {messageIsError && <Notice message={message} error />}
            <h2>Revise Bill</h2>
            <p>
              <strong>Bill ID:</strong> #{selectedBill.bill_id}
            </p>
            <p>
              <strong>Client:</strong> {selectedBill.first_name}{" "}
              {selectedBill.last_name}
            </p>
            <p>
              <strong>Current Amount:</strong> ${selectedBill.amount}
            </p>
            {selectedBill.dispute_note && (
              <p>
                <strong>Dispute Reason:</strong> {selectedBill.dispute_note}
              </p>
            )}

            <div className="form-group">
              <label htmlFor="revised-amount">Revised Amount</label>
              <input
                id="revised-amount"
                type="number"
                step="0.01"
                min="0"
                required
                value={revisedAmount}
                onChange={(e) => setRevisedAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="revision-note">Revision Note</label>
              <textarea
                id="revision-note"
                rows="3"
                required
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Explain the revision (e.g., discount applied, error correction)"
              />
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                Submit Revision
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

export default AnnaBills;
