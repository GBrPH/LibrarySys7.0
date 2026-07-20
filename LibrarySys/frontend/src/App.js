import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Users from "./pages/Users";
import BorrowingLog from "./pages/BorrowingLog";
import Login from "./pages/Login";
// import SignUp from "./pages/SignUp"; // 

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/users" element={<Users />} />
                <Route path="/borrowing-log" element={<BorrowingLog />} />
                <Route path="/login" element={<Login />} />
                {/* <Route path="/signup" element={<SignUp />} />  */}
            </Routes>
        </Router>
    );
}

export default App;
