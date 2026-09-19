import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function StudentRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    batch: '',
    cgpa: '',
    activeBacklogs: '0',
    qualification: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10) {
      setError('CGPA must be between 0 and 10.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
  email: formData.email,
  password: formData.password,
  role: 'STUDENT',
  collegeId: 'COLLEGE-TECH-01',
  profileData: {
    fullName: formData.fullName,
    department: formData.department,
    batch: formData.batch,
    cgpa: formData.cgpa,
    activeBacklogs: formData.activeBacklogs,
    qualification: formData.qualification,
  },

      });

      setSuccess('Account created successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">

      <div className="max-w-lg w-full bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create your account
          </h1>

          <p className="text-slate-400">
            Join <span className="text-emerald-400 font-semibold">CampusHire</span> as a candidate
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg mb-5 text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-lg mb-5 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Department + Batch */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-slate-300 text-sm mb-1">
                Department
              </label>

              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. CSE"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-1">
                Batch
              </label>

              <input
                type="number"
                name="batch"
                required
                value={formData.batch}
                onChange={handleChange}
                placeholder="2026"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* CGPA + Backlogs */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-slate-300 text-sm mb-1">
                CGPA
              </label>

              <input
                type="number"
                name="cgpa"
                required
                min="0"
                max="10"
                step="0.01"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="e.g. 8.5"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-1">
                Active Backlogs
              </label>

              <input
                type="number"
                name="activeBacklogs"
                required
                min="0"
                value={formData.activeBacklogs}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {/* Qualification */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Qualification
            </label>

            <input
              type="text"
              name="qualification"
              required
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. B.Tech Computer Science & Engineering"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg transition"
          >
            {loading ? 'Creating Account...' : 'Create Candidate Account'}
          </button>

        </form>

        {/* Login */}
        <div className="mt-6 pt-5 border-t border-slate-700 text-center">

          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Sign In
            </button>
          </p>

        </div>

      </div>
    </div>
  );
}