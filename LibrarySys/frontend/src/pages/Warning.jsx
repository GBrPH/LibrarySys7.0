import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function ClassProjectNotice() {
    return (
        <div
            className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
            style={{ background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)" }}
        >
            <div className="card shadow-lg border-0 p-5 text-center" style={{ borderRadius: "20px", maxWidth: "650px" }}>

                {/* Icon Header */}
                <div className="mb-4">
                    <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-sm"
                        style={{ width: "90px", height: "90px", fontSize: "2.5rem" }}
                    >
                        🎓
                    </div>
                </div>

                {/* Main Titles */}
                <h2 className="fw-bold text-dark mb-2" style={{ letterSpacing: "-0.5px" }}>Academic Project Notice</h2>
                <h6 className="text-primary fw-bold text-uppercase mb-4" style={{ letterSpacing: "1px" }}>
                    DMC College Foundation, Inc. (DMCCFI)
                </h6>

                {/* Description */}
                <p className="text-muted fs-5 mb-4" style={{ lineHeight: "1.6" }}>
                    Welcome to the <strong>LibrarySys</strong> prototype. Please note that this web application is a class project submitted for academic compliance and is currently in its active development phase. All data presented is for demonstration purposes.
                </p>

                <hr className="text-muted opacity-25 mb-4" />

                {/* Proceed Button */}
                <div>
                    <Link to="/dashboard" className="btn btn-primary btn-lg fw-bold px-5 shadow-sm" style={{ borderRadius: "12px" }}>
                        Acknowledge & Proceed
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default ClassProjectNotice;