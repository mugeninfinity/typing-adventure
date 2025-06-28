import React, { useState } from 'react';
import { LogIn, UserPlus, User as UserIcon } from 'lucide-react';

export default function AuthScreen({ onLogin, mockApi }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGuestLogin = () => {
    onLogin({ name: 'Guest', isAdmin: false, isGuest: true, unlockedAchievements: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const response = await mockApi.login(identifier, password);
    if (response.success) {
      onLogin(response.user);
    } else {
      setError(response.message || 'Authentication failed.');
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-yellow-400">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email or Username"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-yellow-400 text-gray-900 font-bold rounded-md hover:bg-yellow-500 transition-colors">
            <LogIn size={20}/> Login
          </button>
        </form>
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        <button onClick={handleGuestLogin} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-500 transition-colors">
          <UserIcon size={20}/> Continue as Guest
        </button>
      </div>
    </div>
  );
};