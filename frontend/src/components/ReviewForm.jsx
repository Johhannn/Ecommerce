import React, { useState } from 'react';
import StarRating from './StarRating';
import api from '../api/axios';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [subject, setSubject] = useState('');
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post(`shop/api/reviews/submit/${productId}/`, {
                rating,
                subject,
                review
            });

            // Reset form
            setRating(0);
            setSubject('');
            setReview('');

            // Notify parent to refresh reviews
            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
        } catch (err) {
            console.error("Review submission error:", err);
            setError(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '16px', background: '#f8f9fa' }}>
            <h5 className="fw-bold mb-4">Write a Review</h5>

            {error && (
                <div className="alert alert-danger py-2 mb-3" style={{ fontSize: '14px' }}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4 text-center">
                    <label className="form-label d-block text-muted mb-2">How would you rate this product?</label>
                    <div className="d-flex justify-content-center">
                        <StarRating rating={rating} setRating={setRating} hoverable={true} size="32px" />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-bold" style={{ fontSize: '14px' }}>Review Title <span className="text-muted fw-normal">(Optional)</span></label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Example: Great quality!"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        style={{ borderRadius: '8px', padding: '12px' }}
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label fw-bold" style={{ fontSize: '14px' }}>Your Review <span className="text-muted fw-normal">(Optional)</span></label>
                    <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Tell us what you liked or disliked..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        style={{ borderRadius: '8px', padding: '12px' }}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="btn w-100 py-3 fw-bold"
                    disabled={loading}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        transition: 'opacity 0.2s'
                    }}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Submitting...
                        </>
                    ) : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
