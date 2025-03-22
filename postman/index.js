import express from "express";
import axios from "axios";
import NodeCache from "node-cache";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 300 });
const BASE_URL = "http://20.244.56.144/test";
const AUTH_TOKEN = process.env.AUTH_TOKEN;

console.log("Auth Token Loaded:", AUTH_TOKEN ? "Loaded" : "Missing");

app.use(express.json());

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

app.get("/users", async (req, res) => {
  try {
    const cachedUsers = cache.get("top_users");
    if (cachedUsers) return res.json(cachedUsers);

    const { data: { users } } = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: AUTH_TOKEN },
    });

    const userPostCounts = await Promise.all(
      Object.entries(users).map(async ([id, name]) => {
        try {
          const { data: { posts } } = await axios.get(`${BASE_URL}/users/${id}/posts`, {
            headers: { Authorization: AUTH_TOKEN },
          });
          return { userId: id, name, postCount: posts.length };
        } catch (error) {
          console.error(`Error fetching posts for user ${id}:`, error.message);
          return { userId: id, name, postCount: 0 };
        }
      })
    );

    const topUsers = userPostCounts.sort((a, b) => b.postCount - a.postCount).slice(0, 5);

    cache.set("top_users", topUsers);
    res.json(topUsers);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Failed to fetch users data" });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const { type } = req.query;
    if (!["popular", "latest"].includes(type)) {
      return res.status(400).json({ error: "Invalid type. Use 'popular' or 'latest'." });
    }

    const cacheKey = `posts_${type}`;
    const cachedPosts = cache.get(cacheKey);
    if (cachedPosts) return res.json(cachedPosts);

    const { data: { users } } = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: AUTH_TOKEN },
    });

    const userIds = Object.keys(users);

    const allPosts = (
      await Promise.all(
        userIds.map(async (userId) => {
          try {
            const { data: { posts } } = await axios.get(`${BASE_URL}/users/${userId}/posts`, {
              headers: { Authorization: AUTH_TOKEN },
            });
            return posts;
          } catch (error) {
            console.error(`Error fetching posts for user ${userId}:`, error.message);
            return [];
          }
        })
      )
    ).flat();

    if (type === "popular") {
      const postsWithComments = await Promise.all(
        allPosts.map(async (post) => {
          try {
            const { data: { comments } } = await axios.get(`${BASE_URL}/posts/${post.id}/comments`, {
              headers: { Authorization: AUTH_TOKEN },
            });
            return { ...post, commentCount: comments.length };
          } catch (error) {
            console.error(`Error fetching comments for post ${post.id}:`, error.message);
            return { ...post, commentCount: 0 };
          }
        })
      );

      const maxComments = Math.max(...postsWithComments.map(p => p.commentCount), 0);
      const popularPosts = postsWithComments.filter(p => p.commentCount === maxComments);

      cache.set(cacheKey, popularPosts);
      return res.json(popularPosts);
    }

    if (type === "latest") {
      const latestPosts = allPosts.sort((a, b) => b.id - a.id).slice(0, 5);
      cache.set(cacheKey, latestPosts);
      return res.json(latestPosts);
    }
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ error: "Failed to fetch posts data" });
  }
});

app.get("/users/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `user_${id}_posts`;

    const cachedPosts = cache.get(cacheKey);
    if (cachedPosts) return res.json(cachedPosts);

    const { data: { posts } } = await axios.get(`${BASE_URL}/users/${id}/posts`, {
      headers: { Authorization: AUTH_TOKEN },
    });

    cache.set(cacheKey, posts);
    res.json(posts);
  } catch (error) {
    console.error(`Error fetching posts for user ${req.params.id}:`, error.message);
    res.status(500).json({ error: "Failed to fetch user's posts" });
  }
});
