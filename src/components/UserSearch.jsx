import React, { useState } from "react";
import axios from "axios";

function UserSearch({ token, onUserSelected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('http://localhost:3000/search-users', { headers: { Authorization: `Bearer ${token}` }, params: { query: searchQuery } });
      setUsers(response.data);
      setError(null);
    }
    catch (err) {
      console.error('Error searching users: ', err.response || err.message);
      setError('Error searching users');
    }
  };

  return (
    <div className="user-search-container">
      <h2>Search users</h2>
      <form onSubmit={handleSearch}>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Seatch for users ..." />
        <button type="submit">Search</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="users-list">
        {users.map((user) => (
          <div key={user.id}>
            <span>{user.username}</span>
            <button onClick={() => onUserSelected(user)}>Message</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserSearch;