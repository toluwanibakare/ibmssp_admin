import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { user, logout } = useAuth();
  const { users } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof users>([]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      const q = val.toLowerCase();
      setSearchResults(users.filter(u =>
        u.publicId.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      ).slice(0, 5));
      setShowSearch(true);
    } else {
      setShowSearch(false);
      setSearchResults([]);
    }
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-4 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          placeholder="Search by name, ID or email..."
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-card transition-all"
        />
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-dropdown overflow-hidden z-50">
            {searchResults.map(u => (
              <button
                key={u.id}
                onClick={() => { navigate(`/users/${u.id}`); setQuery(''); setShowSearch(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-accent/50 flex items-center gap-3 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  {u.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">{u.publicId} · {u.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {showSearch && searchResults.length === 0 && query.length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-dropdown p-4 text-center text-sm text-muted-foreground z-50">
            No results found
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell size={16} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(d => !d)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
              {user?.avatar}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown size={13} className="text-muted-foreground" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-dropdown py-1 z-50">
              <button
                onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent/50 transition-colors"
              >
                <User size={14} className="text-muted-foreground" />
                Profile & Settings
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
