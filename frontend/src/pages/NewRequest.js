import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAPI } from "../services/api";
import { PageHeader, Notice } from "../components/UI";
import { Upload } from "lucide-react";

function NewRequest() {
  const [formData, setFormData] = useState({
    service_address: "",
    cleaning_type: "basic",
    num_rooms: 1,
    preferred_datetime: "",
    proposed_budget: "",
    special_notes: "",
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      photos.forEach((photo) => {
        formDataToSend.append("photos", photo);
      });

      await requestAPI.create(formDataToSend);
      navigate("/my-requests");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setError("Maximum 5 photos allowed");
      return;
    }
    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/gif"].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setError("Choose JPG, PNG, or GIF images under 5 MB each.");
      e.target.value = "";
      return;
    }
    setError("");
    setPhotos([...photos, ...files]);
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="container" style={{ maxWidth: "700px" }}>
      <PageHeader
        title="New service request"
        description="Tell us about your space. Your service provider will follow up with a quote."
      />
      <div className="card">
        <Notice message={error} error />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="service-address">Service Address</label>
            <input
              id="service-address"
              type="text"
              required
              value={formData.service_address}
              onChange={(e) =>
                setFormData({ ...formData, service_address: e.target.value })
              }
              placeholder="123 Main St, City, State"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="cleaning-type">Cleaning Type</label>
              <select
                id="cleaning-type"
                value={formData.cleaning_type}
                onChange={(e) =>
                  setFormData({ ...formData, cleaning_type: e.target.value })
                }
              >
                <option value="basic">Basic Cleaning</option>
                <option value="deep cleaning">Deep Cleaning</option>
                <option value="move-out">Move-Out Cleaning</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="number-of-rooms">Number of Rooms</label>
              <input
                id="number-of-rooms"
                type="number"
                min="1"
                required
                value={formData.num_rooms}
                onChange={(e) =>
                  setFormData({ ...formData, num_rooms: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="preferred-date-time">Preferred Date & Time</label>
              <input
                id="preferred-date-time"
                type="datetime-local"
                required
                value={formData.preferred_datetime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferred_datetime: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="proposed-budget">Proposed Budget ($)</label>
              <input
                id="proposed-budget"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.proposed_budget}
                onChange={(e) =>
                  setFormData({ ...formData, proposed_budget: e.target.value })
                }
                placeholder="100.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="special-notes">Special Notes</label>
            <textarea
              id="special-notes"
              rows="4"
              value={formData.special_notes}
              onChange={(e) =>
                setFormData({ ...formData, special_notes: e.target.value })
              }
              placeholder="e.g., pet-friendly products only, allergies, special instructions..."
            />
          </div>

          <div className="form-group">
            <label
              htmlFor="photos"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Upload size={18} /> Upload Photos (Max 5)
            </label>
            <input
              type="file"
              id="photos"
              accept="image/jpeg,image/png,image/gif"
              multiple
              onChange={handleFileChange}
              disabled={photos.length >= 5}
            />
            {photos.length > 0 && (
              <div style={{ marginTop: "12px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    marginBottom: "8px",
                  }}
                >
                  {photos.length} photo(s) selected
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {photos.map((photo, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          background: "#f1f5f9",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        {photo.name.substring(0, 15)}...
                      </div>
                      <button
                        aria-label={`Remove ${photo.name}`}
                        type="button"
                        onClick={() => removePhoto(index)}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/my-requests")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewRequest;
