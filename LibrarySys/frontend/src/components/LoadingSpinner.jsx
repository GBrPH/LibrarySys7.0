// src/components/LoadingSpinner.jsx
import React from "react";
import "./Loading.css";

function LoadingSpinner() {
    return (
        <div className="spinning-dots-container">
            <div className="spinning-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
        </div>
    );
}

export default LoadingSpinner;