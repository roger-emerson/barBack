import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        await loadUsers();
        setShowAddModal(false);
        setFormData({ username: '', password: '', email: '' });
        setSuccess(`User "${data.user.username}" created successfully!`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Failed to add user');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/users/${editingUser.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: formData.password || undefined,
          email: formData.email
        })
      });

      const data = await response.json();

      if (response.ok) {
        await loadUsers();
        setEditingUser(null);
        setFormData({ username: '', password: '', email: '' });
        setSuccess(`User "${data.user.username}" updated successfully!`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleDeleteUser = async (username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/users/${username}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadUsers();
        setSuccess(`User "${username}" deleted successfully!`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const openAddModal = () => {
    setFormData({ username: '', password: '', email: '' });
    setShowAddModal(true);
    setError('');
  };

  const openEditModal = (user) => {
    setFormData({ username: user.username, password: '', email: user.email });
    setEditingUser(user);
    setError('');
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', email: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">User Management</h3>
        </div>
        <p className="text-slate-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">User Management</h3>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {success && (
        <div className="mb-4 bg-green-900/30 border border-green-700 rounded-lg p-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-green-200 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{user.username}</p>
              <p className="text-slate-400 text-sm">{user.email || 'No email'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(user)}
                className="text-blue-400 hover:text-blue-300 p-2 rounded transition-colors"
                title="Edit user"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {user.username !== 'admin' && (
                <button
                  onClick={() => handleDeleteUser(user.username)}
                  className="text-red-400 hover:text-red-300 p-2 rounded transition-colors"
                  title="Delete user"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={closeModals}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                  required={!editingUser}
                  disabled={editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {editingUser ? 'Update' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
