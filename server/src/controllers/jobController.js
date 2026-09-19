import prisma from '../utils/prisma.js';

// --- RECRUITER ACTIONS ---

// Create a new Company profile (Recruiter setup)
export const createCompany = async (req, res) => {
  try {
    const { name, website } = req.body;
    const company = await prisma.company.create({
      data: { name, website },
    });
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Post a new Job opening (pending TPC approval)
export const createJob = async (req, res) => {
  try {
    const {
      companyId,
      title,
      description,
      mandatorySkills,
      preferredSkills,
      minCgpa,
      maxBacklogs,
      eligibleDepts,
      eligibleBatches,
    } = req.body;

    const job = await prisma.job.create({
      data: {
        companyId,
        title,
        description,
        mandatorySkills,
        preferredSkills,
        minCgpa: parseFloat(minCgpa),
        maxBacklogs: parseInt(maxBacklogs, 10),
        eligibleDepts,
        eligibleBatches: eligibleBatches.map((b) => parseInt(b, 10)),
        isApproved: false, // Must be approved by TPC Admin
      },
    });

    res.status(201).json({ message: 'Job submitted for TPC approval', job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- TPC ADMIN ACTIONS ---

// Get all jobs pending approval
export const getPendingJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { isApproved: false },
      include: { company: true },
    });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve a Job and create an active Placement Drive
export const approveJobAndCreateDrive = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { driveDate, deadline, collegeId } = req.body;

    // Update job approval status
    const job = await prisma.job.update({
      where: { id: jobId },
      data: { isApproved: true },
    });

    // Create corresponding Placement Drive
    const drive = await prisma.placementDrive.create({
      data: {
        jobId: job.id,
        collegeId: collegeId || req.user.collegeId || 'DEFAULT_COLLEGE',
        driveDate: new Date(driveDate),
        deadline: new Date(deadline),
      },
      include: { job: { include: { company: true } } },
    });

    res.status(201).json({ message: 'Job approved and drive published', drive });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- PUBLIC / STUDENT ACTIONS ---

// List all active placement drives
export const getActiveDrives = async (req, res) => {
  try {
    const drives = await prisma.placementDrive.findMany({
      where: {
        deadline: { gte: new Date() },
      },
      include: {
        job: {
          include: { company: true },
        },
      },
    });
    res.status(200).json({ drives });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};