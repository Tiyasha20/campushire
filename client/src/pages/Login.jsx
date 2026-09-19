import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);

      // Redirect based on user role
      if (res.data.user.role === 'STUDENT') navigate('/student');
      else if (res.data.user.role === 'RECRUITER') navigate('/recruiter');
      else if (res.data.user.role === 'TPC_ADMIN') navigate('/admin');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">

      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back! 👋
          </h1>

          <p className="text-slate-400">
            Sign in to <span className="text-emerald-400 font-semibold">CampusHire</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition"
          >
            Sign In
          </button>

        </form>

        {/* Registration */}
        <div className="mt-7 pt-6 border-t border-slate-700 text-center">

          <p className="text-slate-400 text-sm mb-4">
            Don't have an account?
          </p>

          <div className="space-y-3">

            {/* Candidate Registration */}
            <button
              type="button"
              onClick={() => navigate('/register/student')}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition"
            >
              Register as Candidate
            </button>

            {/* Recruiter Registration */}
            <button
              type="button"
              onClick={() => navigate('/register/recruiter')}
              className="w-full py-2.5 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 font-semibold rounded-lg transition"
            >
              Register as Recruiter
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}