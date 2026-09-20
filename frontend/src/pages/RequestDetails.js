import { Status, money, Notice } from "../components/UI";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { requestAPI, quoteAPI, photoUrl } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Image as ImageIcon, MessageSquare } from "lucide-react";

function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAnna } = useAuth();
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [counterNote, setCounterNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const fetchDetails = useCallback(async () => {
    try {
      const [reqRes, quotesRes] = await Promise.all([
        requestAPI.getRequest(id),
        quoteAPI.getQuotesForRequest(id),
      ]);
      setRequest(reqRes.data);
      setQuotes(quotesRes.data);
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
    fetchDetails();
  }, [fetchDetails]);

  const handleAcceptQuote = async (quoteId) => {
    if (submitting) return;
    setMessageIsError(false);
    setSubmitting(true);
    try {
      await quoteAPI.respondToQuote(quoteId, { response: "accepted" });
      navigate("/my-orders");
    } catch (error) {
      setMessageIsError(true);
      setMessage(error.response?.data?.error || "Failed to accept quote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCounterQuote = async (quoteId) => {
    if (submitting) return;
    setMessageIsError(false);
    if (!counterNote.trim()) {
      setMessageIsError(true);
      setMessage("Please enter a counter note");
      return;
    }
    setSubmitting(true);
    try {
      await quoteAPI.respondToQuote(quoteId, {
        response: "countered",
        counter_note: counterNote,
      });
      setMessage("Counter offer submitted");
      fetchDetails();
      setCounterNote("");
    } catch (error) {
      setMessageIsError(true);
      setMessage(
        error.response?.data?.error || "Failed to submit counter offer",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!request) {
    return (
      <div className="container">
        <Notice message={error || "Request not found"} error />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
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
        <h2>Request #{request.request_id}</h2>
        <Status value={request.status} />

        <div style={{ marginTop: "24px", display: "grid", gap: "16px" }}>
          <div>
            <strong>Service Address:</strong> {request.service_address}
          </div>
          <div>
            <strong>Cleaning Type:</strong> {request.cleaning_type}
          </div>
          <div>
            <strong>Number of Rooms:</strong> {request.num_rooms}
          </div>
          <div>
            <strong>Preferred Date/Time:</strong>{" "}
            {new Date(request.preferred_datetime).toLocaleString()}
          </div>
          <div>
            <strong>Proposed Budget:</strong> {money(request.proposed_budget)}
          </div>
          {request.special_notes && (
            <div>
              <strong>Special Notes:</strong> {request.special_notes}
            </div>
          )}
          {isAnna && (
            <>
              <div>
                <strong>Client:</strong> {request.first_name}{" "}
                {request.last_name}
              </div>
              <div>
                <strong>Email:</strong> {request.email}
              </div>
              <div>
                <strong>Phone:</strong> {request.phone_number}
              </div>
            </>
          )}
        </div>

        {request.photos && request.photos.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <ImageIcon size={20} /> Photos
            </h3>
            <div className="photo-grid">
              {request.photos.map((photo) => (
                <img
                  key={photo.photo_id}
                  src={photoUrl(photo.photo_url)}
                  alt="Service location"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {quotes.length > 0 && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={20} /> Quotes & Negotiation History
          </h3>
          {quotes.map((quote) => (
            <div
              key={quote.quote_id}
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                marginTop: "16px",
              }}
            >
              <div style={{ display: "grid", gap: "12px" }}>
                <div>
                  <strong>Quote ID:</strong> #{quote.quote_id}
                </div>
                <div>
                  <strong>Quoted Price:</strong> {money(quote.quoted_price)}
                </div>
                <div>
                  <strong>Scheduled Time:</strong>{" "}
                  {new Date(quote.scheduled_datetime).toLocaleString()}
                </div>
                {quote.anna_notes && (
                  <div>
                    <strong>Anna's Notes:</strong> {quote.anna_notes}
                  </div>
                )}
                <div>
                  <strong>Status:</strong>{" "}
                  <Status value={quote.client_response} />
                </div>
                {quote.client_counter_note && (
                  <div>
                    <strong>Client Counter:</strong> {quote.client_counter_note}
                  </div>
                )}
              </div>

              {!isAnna && quote.client_response === "pending" && (
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    gap: "12px",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      disabled={submitting}
                      onClick={() => handleAcceptQuote(quote.quote_id)}
                      className="btn btn-success"
                    >
                      Accept Quote
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      aria-label="Requested quote changes"
                      placeholder="Describe your preferred price or time"
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                      style={{ width: "100%", marginBottom: "8px" }}
                    />
                    <button
                      disabled={submitting}
                      onClick={() => handleCounterQuote(quote.quote_id)}
                      className="btn btn-secondary"
                    >
                      Send Counter Offer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestDetails;
