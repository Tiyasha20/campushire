import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MyApplications() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      APPLIED: 'bg-slate-700 text-slate-200 border-slate-600',
      SHORTLISTED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      INTERVIEW_SCHEDULED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      INTERVIEW_COMPLETED: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      OFFER_EXTENDED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      ACCEPTED: 'bg-emerald-600/30 text-emerald-300 border-emerald-500',
      REJECTED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
    return badges[status] || 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">My Applications</h1>
          <p className="text-sm text-slate-400">Track current status and drive snapshots</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/student"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition"
          >
            ← Back to Drives
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs rounded border border-rose-500/30 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading applications...</p>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm mb-4">You haven't submitted any applications yet.</p>
          <Link
            to="/student"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-semibold rounded transition"
          >
            Explore Drives
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="p-5 bg-slate-800/60 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{app.drive.job.title}</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    Match: {app.matchScore}%
                  </span>
                </div>
                <p className="text-sm text-emerald-400 mt-0.5">{app.drive.job.company.name}</p>
                <div className="flex gap-4 text-xs text-slate-400 mt-2">
                  <span>Resume: <strong className="text-slate-200">{app.resumeVersion.versionTag}</strong></span>
                  <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                  <span>Drive Date: {new Date(app.drive.driveDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-md border font-medium uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}