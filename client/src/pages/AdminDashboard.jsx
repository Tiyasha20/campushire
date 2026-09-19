import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#38bdf8', '#818cf8', '#a855f7', '#34d399', '#10b981'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [pendingJobs, setPendingJobs] = useState([]);
  const [activeDrives, setActiveDrives] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [driveDate, setDriveDate] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchPendingJobs();
    fetchDrives();
    fetchAnalytics();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      const res = await api.get('/jobs/pending');
      setPendingJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await api.get('/jobs/drives');
      setActiveDrives(res.data.drives || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/funnel');
      const f = res.data.funnel;
      if (f) {
        setFunnelData([
          { stage: 'Applied', count: f.totalApplications },
          { stage: 'Shortlisted', count: f.shortlisted },
          { stage: 'Interviews', count: f.interviewsScheduled },
          { stage: 'Offers', count: f.offersExtended },
          { stage: 'Placed', count: f.placed },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const approveJob = async (jobId) => {
    if (!driveDate || !deadline) {
      alert('Please provide Drive Date and Deadline.');
      return;
    }
    try {
      await api.patch(`/jobs/approve/${jobId}`, { driveDate, deadline });
      alert('Job approved and published as active drive!');
      setApprovingId(null);
      fetchPendingJobs();
      fetchDrives();
    } catch (err) {
      alert(err.response?.data?.error || 'Approval failed.');
    }
  };

  const handleDownloadCsv = async (driveId, jobTitle) => {
    try {
      const res = await api.get(`/analytics/export/${driveId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jobTitle.replace(/\s+/g, '_')}_applicants.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('No applicant data to export yet.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">TPC Admin Hub</h1>
          <p className="text-sm text-slate-400">Placement cell metrics, approvals, and report exports</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition"
        >
          Sign Out
        </button>
      </header>

      {/* Analytics Chart */}
      <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Placement Funnel Conversion</h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <XAxis dataKey="stage" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {funnelData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Pending Postings</h2>
          {pendingJobs.length === 0 ? (
            <p className="text-sm text-slate-400">No jobs currently pending review.</p>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job) => (
                <div key={job.id} className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-sm">{job.title}</h3>
                      <p className="text-xs text-emerald-400">{job.company?.name || 'External Company'}</p>
                    </div>
                  </div>

                  {approvingId === job.id ? (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      <input
                        type="date"
                        value={driveDate}
                        onChange={(e) => setDriveDate(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-xs p-2 rounded text-white"
                      />
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-xs p-2 rounded text-white"
                      />
                      <button
                        onClick={() => approveJob(job.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded text-xs transition"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => setApprovingId(null)}
                        className="px-3 py-1.5 bg-slate-800 rounded text-xs text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setApprovingId(job.id)}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 rounded text-xs transition"
                    >
                      Set Schedule & Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Drives & Data Exports */}
        <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Export Drive Rosters</h2>
          {activeDrives.length === 0 ? (
            <p className="text-sm text-slate-400">No active drives published yet.</p>
          ) : (
            <div className="space-y-3">
              {activeDrives.map((drive) => (
                <div
                  key={drive.id}
                  className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white">{drive.job.title}</h4>
                    <p className="text-xs text-slate-400">{drive.job.company.name}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadCsv(drive.id, drive.job.title)}
                    className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded text-xs transition"
                  >
                    Download CSV
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}