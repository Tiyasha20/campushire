import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function RecruiterRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyWebsite: '',
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

    setLoading(true);

    try {
      const res = await api.post('/auth/register/recruiter', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
      });

      setSuccess(
        res.data.message ||
          'Registration submitted successfully. Awaiting approval.'
      );

      setTimeout(() => {
        navigate('/login');
      }, 2000);

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
            Join <span className="text-emerald-400">CampusHire</span>
          </h1>

          <p className="text-slate-400">
            Create your recruiter account
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
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Work Email
            </label>

            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
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
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
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
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Company Name
            </label>

            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Company Website */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">
              Company Website
              <span className="text-slate-500"> (optional)</span>
            </label>

            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg transition"
          >
            {loading ? 'Submitting...' : 'Register as Recruiter'}
          </button>
        </form>

        {/* Approval message */}
        <div className="mt-5 p-3 bg-slate-950 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-xs text-center">
            Recruiter accounts require TPC Admin approval before
            you can access the recruiter portal.
          </p>
        </div>

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