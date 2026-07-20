import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Users from "./pages/Users";
import BorrowingLog from "./pages/BorrowingLog";
import Login from "./pages/Login";   
import "./assets/theme.css";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/users" element={<Users />} />
                <Route path="/borrowing-log" element={<BorrowingLog />} />
                <Route path="/login" element={<Login />} /> 
            </Routes>
        </Router>
    );
}

export default App;
