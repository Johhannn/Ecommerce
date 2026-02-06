import React, { useState } from 'react';

const StarRating = ({ rating, setRating, hoverable = false, size = '24px' }) => {
    const [hover, setHover] = useState(0);
    const [explodingStar, setExplodingStar] = useState(null);

    const handleClick = (value) => {
        if (hoverable && setRating) {
            setExplodingStar(value);
            setRating(value);
            // Reset explosion after animation
            setTimeout(() => setExplodingStar(null), 800);
        }
    };

    return (
        <div className="d-flex align-items-center position-relative">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                const isHovered = hoverable && ratingValue <= hover;
                const isExploding = explodingStar === ratingValue;

                return (
                    <div key={index} className="position-relative d-flex align-items-center">
                        <i
                            className={`bi ${ratingValue <= (hover || rating)
                                    ? 'bi-star-fill'
                                    : (ratingValue - 0.5 <= (hover || rating) && !hover)
                                        ? 'bi-star-half'
                                        : 'bi-star'
                                }`}
                            style={{
                                fontSize: size,
                                color: ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9',
                                marginRight: '8px',
                                cursor: hoverable ? 'pointer' : 'default',
                                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                transform: isExploding
                                    ? 'scale(1.6) rotate(15deg)'
                                    : isHovered
                                        ? 'scale(1.3)'
                                        : 'scale(1)',
                                textShadow: isHovered || isExploding ? '0 0 20px rgba(255, 193, 7, 0.8)' : 'none',
                                position: 'relative',
                                zIndex: 2
                            }}
                            onMouseEnter={() => hoverable && setHover(ratingValue)}
                            onMouseLeave={() => hoverable && setHover(0)}
                            onClick={() => handleClick(ratingValue)}
                        ></i>

                        {/* Explosion Particles */}
                        {isExploding && [...Array(12)].map((_, i) => {
                            const angle = (i * 360) / 12;
                            const distance = 100; // Increased distance
                            const particleSize = 10 + (i % 3) * 5; // Sizes: 10px, 15px, 20px
                            const tx = `${Math.cos(angle * Math.PI / 180) * distance}px`;
                            const ty = `${Math.sin(angle * Math.PI / 180) * distance}px`;
                            const color = i % 2 === 0 ? '#ffc107' : '#ff9800'; // Alternate colors

                            return (
                                <i
                                    key={`p-${i}`}
                                    className="bi bi-star-fill"
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        fontSize: `${particleSize}px`,
                                        color: color,
                                        opacity: 0,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 1,
                                        pointerEvents: 'none',
                                        animation: `explode-star-${i} 0.7s ease-out forwards`,
                                        filter: 'drop-shadow(0 0 4px rgba(255,193,7,0.5))'
                                    }}
                                >
                                    <style>
                                        {`
                                        @keyframes explode-star-${i} {
                                            0% { transform: translate(-50%, -50%) scale(0.4) rotate(0deg); opacity: 1; }
                                            50% { opacity: 1; }
                                            100% { transform: translate(calc(-50% + ${tx}), calc(-50% + ${ty})) scale(0) rotate(${angle + 180}deg); opacity: 0; }
                                        }
                                        `}
                                    </style>
                                </i>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default StarRating;
