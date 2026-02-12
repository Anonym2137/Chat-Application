/**
 * UserSearch Component
 * Search and select users to start a chat
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { userApi } from '../services/api';
import { getAssetUrl } from '../config/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { SearchIcon } from './ui/icons';
import { getInitials } from '../utils/formatters';

const UserSearch = ({ token, onUserSelected }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await userApi.searchUsers(searchQuery, token);
      setUsers(results);
    } catch (err) {
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
          <SearchIcon />
        </Button>
      </form>

      {/* Blurred backdrop overlay when search results are visible */}
      {users.length > 0 && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={() => {
            setUsers([]);
            setSearchQuery('');
          }}
        />
      )}

      {/* Search Results Dropdown */}
      {users.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden animate-slide-up">
          <ScrollArea className="max-h-60">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="flex items-center gap-3 p-3 hover:bg-purple-500/10 cursor-pointer transition-all duration-200 border-b border-white/5 last:border-b-0"
              >
                <Avatar className="h-9 w-9 ring-2 ring-purple-500/20">
                  <AvatarImage src={getAssetUrl(user.avatar)} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-purple-600 to-indigo-600 text-white">{getInitials(user)}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground/90">{user.username}</span>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

UserSearch.propTypes = {
  token: PropTypes.string.isRequired,
  onUserSelected: PropTypes.func.isRequired,
};

export default UserSearch;