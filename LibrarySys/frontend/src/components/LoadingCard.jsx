import React from "react";
import "./Loading.css";

function LoadingCard() {
    return (
        <div className="card h-100 border-0 shadow-sm p-3 glass-panel d-flex flex-column">
            <div className="loading-shimmer loading-img"></div>

            <div className="d-flex flex-column flex-grow-1">
                <div className="loading-shimmer loading-title"></div>
                <div className="loading-shimmer loading-subtitle"></div>
                <div className="loading-shimmer loading-badge mt-2"></div>

                <div className="mt-auto pt-3">
                    <div className="loading-shimmer loading-btn"></div>
                </div>
            </div>
        </div>
    );
}

export default LoadingCard;