import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Form State for creating a job
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mandatorySkills, setMandatorySkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [eligibleDepts, setEligibleDepts] = useState('CSE, IT, ECE');
  const [eligibleBatches, setEligibleBatches] = useState('2025, 2026');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/jobs/drives');
      setDrives(res.data.drives || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/jobs', {
        companyId: user.profile?.companyId || null,
        title,
        description,
        mandatorySkills: mandatorySkills.split(',').map((s) => s.trim()),
        preferredSkills: preferredSkills.split(',').map((s) => s.trim()),
        minCgpa,
        maxBacklogs,
        eligibleDepts: eligibleDepts.split(',').map((s) => s.trim()),
        eligibleBatches: eligibleBatches.split(',').map((s) => s.trim()),
      });
      setMessage('Job submitted for TPC Admin approval!');
      setTitle('');
      setDescription('');
      setMandatorySkills('');
      setPreferredSkills('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to post job.');
    }
  };

  const viewApplicants = async (driveId) => {
    setSelectedDriveId(driveId);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/applications/drive/${driveId}`);
      setApplicants(res.data.applications || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch applicants.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status });
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
    } catch (err) {
      alert('Failed to update candidate status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Recruiter Portal</h1>
          <p className="text-sm text-slate-400">Manage hiring drives and evaluate candidates</p>
        </div>
        <button onClick={logout} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm transition">
          Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Creation */}
        <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Post New Opening</h2>
          {message && <p className="text-xs text-emerald-400 mb-4">{message}</p>}
          <form onSubmit={handlePostJob} className="space-y-3 text-sm">
            <div>
              <label className="block text-slate-400 mb-1">Role Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Description</label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Mandatory Skills (comma separated)</label>
              <input
                required
                value={mandatorySkills}
                onChange={(e) => setMandatorySkills(e.target.value)}
                placeholder="React, Node.js, SQL"
                className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Preferred Skills</label>
              <input
                value={preferredSkills}
                onChange={(e) => setPreferredSkills(e.target.value)}
                placeholder="Docker, AWS"
                className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Min CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Max Backlogs</label>
                <input
                  type="number"
                  required
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 mt-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded transition"
            >
              Submit for Approval
            </button>
          </form>
        </div>

        {/* Right Columns: Drives & Ranked Applicants */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Active Placement Drives</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {drives.map((d) => (
                <button
                  key={d.id}
                  onClick={() => viewApplicants(d.id)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition border ${
                    selectedDriveId === d.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {d.job.title} ({d.job.company.name})
                </button>
              ))}
            </div>
          </div>

          {/* Applicant Roster */}
          {selectedDriveId && (
            <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Ranked Candidates</h2>
              {loadingApplicants ? (
                <p className="text-sm text-slate-400">Loading applicants...</p>
              ) : applicants.length === 0 ? (
                <p className="text-sm text-slate-400">No applicants yet for this drive.</p>
              ) : (
                <div className="space-y-3">
                  {applicants.map((app) => (
  <div
    key={app.id}
    className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 flex justify-between items-center"
  >
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-semibold text-white">{app.student.fullName}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
          Score: {app.matchScore}%
        </span>
        <span className="text-xs text-slate-500">Version: {app.resumeVersion?.versionTag}</span>

        {app.resumeVersion?.fileUrl && (
          <a
            href={`http://localhost:5000/${app.resumeVersion.fileUrl.replace(/\\/g, '/')}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded flex items-center gap-1 transition"
          >
            📄 View Resume
          </a>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1">
        {app.student.department} | CGPA: {app.student.cgpa} | Status: <strong className="text-slate-200">{app.status}</strong>
      </p>
    </div>

                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-xs p-2 rounded text-slate-300"
                      >
                        <option value="APPLIED">APPLIED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</option>
                        <option value="OFFER_EXTENDED">OFFER_EXTENDED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}