import React, { useState } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

function UserSearch({ token, onUserSelected }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:3000/search-users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { query: searchQuery }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error searching users: ', err.response ? err.response.data : err.message);
      setError('Error searching users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    onUserSelected(user);
    setUsers([]);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Search users..."
          className="bg-background/50"
        />
        <Button type="submit" size="icon" variant="secondary" disabled={loading}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {users.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
          <ScrollArea className="max-h-60">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar ? `http://localhost:3000${user.avatar}` : undefined} />
                  <AvatarFallback className="text-xs">{user.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.username}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

UserSearch.propTypes = {
  token: PropTypes.string.isRequired,
  onUserSelected: PropTypes.func.isRequired,
};

export default UserSearch;