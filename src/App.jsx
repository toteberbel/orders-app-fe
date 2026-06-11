import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Profit from "./pages/Profit";

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ganancias" element={<Profit />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
