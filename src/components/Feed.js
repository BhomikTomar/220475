import { useEffect, useState } from "react";
import axios from "axios";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/posts?type=latest")
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Latest Feed</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id} className="py-2">{post.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Feed;
