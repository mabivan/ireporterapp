import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportContext';
import { Incident } from '../../utils/types';
import './ReportForm.css';

interface ReportFormProps {
  report?: Incident;
  isEditing?: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({ report, isEditing = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addReport, updateReport } = useReports();

  const [formData, setFormData] = useState({
    type: 'red-flag' as 'red-flag' | 'intervention',
    title: '',
    location: '',
    latitude: '',
    longitude: '',
    comment: '',
    images: [] as string[],
    videos: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set initial type from URL params for new reports
    if (!isEditing) {
      const searchParams = new URLSearchParams(location.search);
      const typeParam = searchParams.get('type');
      if (typeParam === 'red-flag' || typeParam === 'intervention') {
        setFormData(prev => ({ ...prev, type: typeParam }));
      }
    }

    // Pre-fill form for editing
    if (isEditing && report) {
      const [lat, lng] = report.location.split(',').map(coord => coord.trim());
      setFormData({
        type: report.type,
        title: report.title,
        location: report.location,
        latitude: lat,
        longitude: lng,
        comment: report.comment,
        images: report.images,
        videos: report.videos,
      });
    }
  }, [isEditing, report, location.search]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Description is required';
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Location coordinates are required';
    } else {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
      
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeSelect = (type: 'red-flag' | 'intervention') => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'images' | 'videos') => {
    const files = e.target.files;
    if (!files) return;

    // In a real app, you would upload files to a server
    // For now, we'll simulate by creating object URLs
    const newMedia = Array.from(files).map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      [mediaType]: [...prev[mediaType], ...newMedia]
    }));

    // Reset file input
    e.target.value = '';
  };

  const removeMedia = (index: number, mediaType: 'images' | 'videos') => {
    setFormData(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const locationString = `${formData.latitude},${formData.longitude}`;

    if (isEditing && report) {
      // Update existing report
      updateReport(report.id, {
        type: formData.type,
        title: formData.title,
        location: locationString,
        comment: formData.comment,
        images: formData.images,
        videos: formData.videos,
      });
    } else {
      // Create new report
      addReport({
        type: formData.type,
        title: formData.title,
        location: locationString,
        comment: formData.comment,
        images: formData.images,
        videos: formData.videos,
        createdBy: user?.id || 0,
        status: 'draft',
      });
    }

    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="report-form">
      <div className="form-header">
        <h1 className="form-title">
          {isEditing ? 'Edit Report' : 'Create New Report'}
        </h1>
        <p className="form-subtitle">
          {isEditing 
            ? 'Update your report details' 
            : 'Report corruption or request government intervention'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Report Type Selection */}
        {!isEditing && (
          <div className="type-selector">
            <div
              className={`type-option ${formData.type === 'red-flag' ? 'selected' : ''}`}
              onClick={() => handleTypeSelect('red-flag')}
            >
              <div className="type-icon">🚩</div>
              <div className="type-label">Red Flag</div>
              <div className="type-description">Report corruption</div>
            </div>
            
            <div
              className={`type-option ${formData.type === 'intervention' ? 'selected' : ''}`}
              onClick={() => handleTypeSelect('intervention')}
            >
              <div className="type-icon">⚙️</div>
              <div className="type-label">Intervention</div>
              <div className="type-description">Request government action</div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="form-grid">
          <div className="form-group form-full-width">
            <label className="form-label">Report Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a clear, descriptive title"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group form-full-width">
            <label className="form-label">Description *</label>
            <textarea
              name="comment"
              className="form-textarea"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Provide detailed information about the incident or issue..."
              rows={4}
            />
            {errors.comment && <span className="error-text">{errors.comment}</span>}
          </div>
        </div>

        {/* Location Section */}
        <div className="location-section">
          <div className="location-header">
            <h3 className="location-title">Location Details</h3>
          </div>
          
          <div className="location-inputs">
            <div className="form-group">
              <label className="form-label">Latitude *</label>
              <input
                type="text"
                name="latitude"
                className="form-input"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 40.7128"
              />
              {errors.latitude && <span className="error-text">{errors.latitude}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Longitude *</label>
              <input
                type="text"
                name="longitude"
                className="form-input"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., -74.0060"
              />
              {errors.longitude && <span className="error-text">{errors.longitude}</span>}
            </div>
          </div>

          <div className="map-preview">
            {formData.latitude && formData.longitude ? (
              <div>
                📍 Location: {formData.latitude}, {formData.longitude}
                <br />
                <small>(Google Maps integration would show here)</small>
              </div>
            ) : (
              'Enter coordinates to view location on map'
            )}
          </div>
        </div>

        {/* Media Upload */}
        <div className="form-group form-full-width">
          <label className="form-label">Supporting Images</label>
          <label className="media-upload">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleMediaUpload(e, 'images')}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">📷</div>
            <div className="upload-text">Upload Images</div>
            <div className="upload-subtext">PNG, JPG, GIF up to 5MB</div>
          </label>

          {formData.images.length > 0 && (
            <div className="media-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="media-item">
                  <img src={image} alt={`Upload ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-media"
                    onClick={() => removeMedia(index, 'images')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group form-full-width">
          <label className="form-label">Supporting Videos</label>
          <label className="media-upload">
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={(e) => handleMediaUpload(e, 'videos')}
              style={{ display: 'none' }}
            />
            <div className="upload-icon">🎥</div>
            <div className="upload-text">Upload Videos</div>
            <div className="upload-subtext">MP4, MOV up to 20MB</div>
          </label>

          {formData.videos.length > 0 && (
            <div className="media-preview">
              {formData.videos.map((video, index) => (
                <div key={index} className="media-item">
                  <video src={video} />
                  <button
                    type="button"
                    className="remove-media"
                    onClick={() => removeMedia(index, 'videos')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {isEditing ? 'Update Report' : 'Create Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;