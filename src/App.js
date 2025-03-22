import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TopUsers from "./components/TopUsers";
import TrendingPosts from "./components/TrendingPosts";
import Feed from "./components/Feed";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4">
          <ul className="flex space-x-4 text-white">
            <li>
              <Link to="/" className="hover:underline">Top Users</Link>
            </li>
            <li>
              <Link to="/trending" className="hover:underline">Trending Posts</Link>
            </li>
            <li>
              <Link to="/feed" className="hover:underline">Feed</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<TopUsers />} />
          <Route path="/trending" element={<TrendingPosts />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
