import prisma from '../utils/prisma.js';
import { evaluateEligibility } from '../services/eligibilityService.js';
import { evaluateResumeSkills } from '../services/matchingService.js';

// --- STUDENT ACTIONS ---

// Submit an application to a Placement Drive
export const applyToDrive = async (req, res) => {
  try {
    const { driveId, resumeVersionId } = req.body;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
      include: { job: true },
    });

    if (!drive) {
      return res.status(404).json({ message: 'Placement drive not found.' });
    }

    // Check if drive deadline has passed
    if (new Date() > new Date(drive.deadline)) {
      return res.status(400).json({ message: 'Application deadline for this drive has passed.' });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        driveId,
        studentId: studentProfile.id,
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this drive.' });
    }

    // 1. Verify Hard Eligibility
    const eligibility = evaluateEligibility(studentProfile, drive.job);
    if (!eligibility.isEligible) {
      return res.status(400).json({
        message: 'Cannot apply: You do not meet the hard eligibility criteria.',
        reasons: eligibility.reasons,
      });
    }

    // 2. Fetch Resume Version
    const resume = await prisma.resumeVersion.findUnique({
      where: { id: resumeVersionId },
    });

    if (!resume || resume.studentId !== studentProfile.id) {
      return res.status(404).json({ message: 'Invalid resume version selected.' });
    }

    // 3. Verify Mandatory Skills & Compute Match
    const matchAnalysis = evaluateResumeSkills(
      resume.parsedText,
      drive.job.mandatorySkills,
      drive.job.preferredSkills
    );

    if (!matchAnalysis.canApply) {
      return res.status(400).json({
        message: 'Cannot apply: Resume is missing mandatory skills required for this role.',
        missingMandatorySkills: matchAnalysis.insights.mandatory.missing,
      });
    }

    // 4. Create Application record locked to this resume version
    const application = await prisma.application.create({
      data: {
        driveId,
        studentId: studentProfile.id,
        resumeVersionId: resume.id,
        matchScore: matchAnalysis.matchScore,
        matchDetails: matchAnalysis.insights,
        status: 'APPLIED',
      },
      include: {
        drive: { include: { job: true } },
        resumeVersion: true,
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student views all their applications
export const getMyApplications = async (req, res) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const applications = await prisma.application.findMany({
      where: { studentId: studentProfile.id },
      include: {
        drive: {
          include: {
            job: {
              include: { company: true },
            },
          },
        },
        resumeVersion: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- RECRUITER & TPC ADMIN ACTIONS ---

// View applicants for a specific placement drive
export const getDriveApplicants = async (req, res) => {
  try {
    const { driveId } = req.params;

    const applications = await prisma.application.findMany({
      where: { driveId },
      include: {
        student: true,
        resumeVersion: true,
      },
      orderBy: { matchScore: 'desc' }, // Ranked by match score
    });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update candidate application status (Shortlist, Interview, Offer, etc.)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'APPLIED',
      'ELIGIBILITY_VERIFIED',
      'RESUME_MATCHED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEW_COMPLETED',
      'OFFER_EXTENDED',
      'ACCEPTED',
      'REJECTED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid application status provided.' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    res.status(200).json({
      message: `Status updated to ${status}`,
      application: updatedApplication,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};