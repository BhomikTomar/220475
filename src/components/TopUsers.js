import { useEffect, useState } from "react";
import axios from "axios";

const TopUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Top Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.userId} className="py-2">{user.name} - {user.postCount} Posts</li>
        ))}
      </ul>
    </div>
  );
};

export default TopUsers;
