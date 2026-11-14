import React from "react";
import "./Loading.css";

function LoadingCard() {
    return (
        <div className="card h-100 border-0 shadow-sm p-3 glass-panel d-flex flex-column">
            {/* Image Placeholder */}
            <div className="skeleton skeleton-img"></div>

            <div className="d-flex flex-column flex-grow-1">
                {/* Title and Subtitle Placeholders */}
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-subtitle"></div>

                {/* Badge Placeholder */}
                <div className="skeleton skeleton-badge mt-2"></div>

                {/* Action Button Placeholder pushed to bottom */}
                <div className="mt-auto pt-3">
                    <div className="skeleton skeleton-btn"></div>
                </div>
            </div>
        </div>
    );
}

export default LoadingCard;