import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../services/api';
import { Send, Upload } from 'lucide-react';

function NewRequest() {
  const [formData, setFormData] = useState({
    service_address: '',
    cleaning_type: 'basic',
    num_rooms: 1,
    preferred_datetime: '',
    proposed_budget: '',
    special_notes: ''
  });
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      photos.forEach(photo => {
        formDataToSend.append('photos', photo);
      });

      await requestAPI.create(formDataToSend);
      setSuccess('Service request submitted successfully!');
      setTimeout(() => navigate('/my-requests'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <div className="card">
        <h2 style={{ marginBottom: '30px' }}>
          <Send size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          New Service Request
        </h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Service Address *</label>
            <input
              type="text"
              required
              value={formData.service_address}
              onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
              placeholder="123 Main St, City, State"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Cleaning Type *</label>
              <select
                value={formData.cleaning_type}
                onChange={(e) => setFormData({ ...formData, cleaning_type: e.target.value })}
              >
                <option value="basic">Basic Cleaning</option>
                <option value="deep cleaning">Deep Cleaning</option>
                <option value="move-out">Move-Out Cleaning</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Rooms *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.num_rooms}
                onChange={(e) => setFormData({ ...formData, num_rooms: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Preferred Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.preferred_datetime}
                onChange={(e) => setFormData({ ...formData, preferred_datetime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Proposed Budget ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.proposed_budget}
                onChange={(e) => setFormData({ ...formData, proposed_budget: e.target.value })}
                placeholder="100.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Special Notes</label>
            <textarea
              rows="4"
              value={formData.special_notes}
              onChange={(e) => setFormData({ ...formData, special_notes: e.target.value })}
              placeholder="e.g., pet-friendly products only, allergies, special instructions..."
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> Upload Photos (Max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={photos.length >= 5}
            />
            {photos.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  {photos.length} photo(s) selected
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {photos.map((photo, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <div style={{
                        width: '100px',
                        height: '100px',
                        background: '#f1f5f9',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        {photo.name.substring(0, 15)}...
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          fontSize: '12px'
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-requests')}
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
