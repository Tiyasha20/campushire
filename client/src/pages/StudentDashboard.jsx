import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzingDriveId, setAnalyzingDriveId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchResumes();
    fetchDrives();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await api.get('/resumes/my');
      setResumes(res.data.resumes || []);
      if (res.data.resumes?.length > 0) {
        setSelectedResumeId(res.data.resumes[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await api.get('/jobs/drives');
      setDrives(res.data.drives || []);
    } catch (err) {
      console.error('Failed to fetch drives:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    setMessage('');
    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Resume uploaded and parsed successfully.');
      fetchResumes();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const runAnalysis = async (driveId) => {
    if (!selectedResumeId) {
      alert('Please upload and select a resume version first.');
      return;
    }
    setAnalyzingDriveId(driveId);
    setAnalysisResult(null);
    try {
      const res = await api.post('/resumes/analyze', {
        driveId,
        resumeVersionId: selectedResumeId,
      });
      setAnalysisResult({ driveId, data: res.data });
    } catch (err) {
      alert(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setAnalyzingDriveId(null);
    }
  };

  const applyNow = async (driveId) => {
    try {
      await api.post('/applications/apply', {
        driveId,
        resumeVersionId: selectedResumeId,
      });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">CampusHire Student Portal</h1>
          <p className="text-sm text-slate-400">Logged in as {user?.email}</p>
        </div>
        <div className="flex items-center gap-3">
    <Link
      to="/student/applications"
      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-sm font-medium transition"
    >
      View My Applications
    </Link>
    <button
      onClick={logout}
      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm transition"
    >
      Sign Out
    </button>
  </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Resumes & Version Snapshots */}
        <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-white">Resume Versions</h2>
          
          <label className="block border-2 border-dashed border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition mb-4">
            <span className="text-sm text-slate-300">
              {uploading ? 'Processing...' : '+ Upload New PDF Resume'}
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {message && <p className="text-xs text-emerald-400 mb-4">{message}</p>}

          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => setSelectedResumeId(resume.id)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  selectedResumeId === resume.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-900/40 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{resume.versionTag}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Columns: Active Drives & Eligibility Checks */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-white">Active Placement Drives</h2>

          {drives.length === 0 ? (
            <p className="text-slate-400 text-sm">No drives are currently accepting applications.</p>
          ) : (
            drives.map((drive) => {
              const analysis = analysisResult?.driveId === drive.id ? analysisResult.data : null;

              return (
                <div
                  key={drive.id}
                  className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{drive.job.title}</h3>
                      <p className="text-sm text-emerald-400">{drive.job.company.name}</p>
                    </div>
                    <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                      Deadline: {new Date(drive.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300">{drive.job.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500">Min CGPA:</span> {drive.job.minCgpa}
                    </div>
                    <div>
                      <span className="text-slate-500">Max Backlogs:</span> {drive.job.maxBacklogs}
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Mandatory Skills:</span>{' '}
                      {drive.job.mandatorySkills.join(', ')}
                    </div>
                  </div>

                  {/* Dynamic Match & Eligibility Feedback */}
                  {analysis && (
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-700 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          Eligibility: {analysis.eligible ? '✅ Passed' : '❌ Ineligible'}
                        </span>
                        {analysis.eligible && (
                          <span className="font-semibold text-emerald-400">
                            Match Score: {analysis.matchScore}%
                          </span>
                        )}
                      </div>

                      {!analysis.eligible && analysis.reasons && (
                        <ul className="text-xs text-rose-400 list-disc list-inside space-y-1">
                          {analysis.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}

                      {analysis.eligible && analysis.insights && (
                        <div className="text-xs space-y-1 pt-2">
                          <p className="text-slate-400">
                            Matched Skills: {analysis.insights.mandatory.matched.concat(analysis.insights.preferred.matched).join(', ') || 'None'}
                          </p>
                          {analysis.insights.mandatory.missing.length > 0 && (
                            <p className="text-rose-400">
                              Missing Mandatory: {analysis.insights.mandatory.missing.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => runAnalysis(drive.id)}
                      disabled={analyzingDriveId === drive.id}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition"
                    >
                      {analyzingDriveId === drive.id ? 'Checking...' : 'Check Eligibility & Match'}
                    </button>

                    {analysis?.canApply && (
                      <button
                        onClick={() => applyNow(drive.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded text-sm transition"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}