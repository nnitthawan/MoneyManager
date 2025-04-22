import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // ใช้ BrowserRouter แทน Router
import Navbar from "./Navbar"; 
import Home from "./MoneyManager";
import Records from "./Records";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
  
          <Route path="/records" element={<Records />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
