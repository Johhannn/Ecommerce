import React from 'react';
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-5">
                <div className="text-muted mb-3">
                    <i className="bi bi-chat-left-text" style={{ fontSize: '3rem' }}></i>
                </div>
                <h5>No reviews yet</h5>
                <p className="text-muted">Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-4">
            {reviews.map((review) => (
                <div key={review.id} className="border-bottom pb-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '18px'
                                }}
                            >
                                {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h6 className="mb-0 fw-bold">{review.user_name || 'User'}</h6>
                                <div className="d-flex align-items-center gap-2">
                                    <StarRating rating={review.rating} size="14px" />
                                    <small className="text-muted" style={{ fontSize: '12px' }}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    {review.subject && (
                        <h6 className="fw-bold mt-2">{review.subject}</h6>
                    )}
                    <p className="text-muted mb-0 mt-2" style={{ lineHeight: '1.6' }}>
                        {review.review}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
