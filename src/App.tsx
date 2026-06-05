import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Sections from "@/pages/Sections";
import Bonds from "@/pages/Bonds";
import Results from "@/pages/Results";
import Refunds from "@/pages/Refunds";
import Vouchers from "@/pages/Vouchers";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sections" element={<Sections />} />
          <Route path="/bonds" element={<Bonds />} />
          <Route path="/results" element={<Results />} />
          <Route path="/refunds" element={<Refunds />} />
          <Route path="/vouchers" element={<Vouchers />} />
        </Route>
      </Routes>
    </Router>
  );
}
