import { useEffect, useState } from "react";
import axios from "axios";

const TrendingPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/posts?type=popular")
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Trending Posts</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id} className="py-2">{post.title} - {post.commentCount} Comments</li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingPosts;
