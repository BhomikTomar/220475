import { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usersResponse, postsResponse] = await Promise.all([
          fetch('http://localhost:3000/api/users'),
          fetch('http://localhost:3000/api/posts'),
        ]);

        if (!usersResponse.ok || !postsResponse.ok) {
          throw new Error('Failed to fetch initial data');
        }

        const usersData = await usersResponse.json();
        const postsData = await postsResponse.json();

        setUsers(usersData);
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); 

  const fetchNewPosts = async () => {
    try {
      const response = await fetch('http://20.244.56.144/api/posts/new');
      if (!response.ok) {
        throw new Error('Failed to fetch new posts');
      }
      const newPosts = await response.json();
      if (newPosts.length > 0) {
        setPosts(prevPosts => [...newPosts, ...prevPosts]);
      }
    } catch (err) {
      console.error('Error fetching new posts:', err);
      setError('Failed to fetch new posts.');
    }
  };

  const contextValue = {
    users,
    posts,
    setPosts, 
    loading,
    error,
    fetchNewPosts, 
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};