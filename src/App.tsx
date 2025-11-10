import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/HomeReal";
import ExploreReal from "@/pages/ExploreReal";
import MovieDetailReal from "@/pages/MovieDetailReal";
import TestTmdbIntegration from "@/pages/TestTmdbIntegration";
import { SkipToContent } from "@/utils/a11y";

export default function App() {
  return (
    <Router>
      <SkipToContent />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExploreReal />} />
        <Route path="/movie/:id" element={<MovieDetailReal />} />
        <Route path="/test-tmdb" element={<TestTmdbIntegration />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
