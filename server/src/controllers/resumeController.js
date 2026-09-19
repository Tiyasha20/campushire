import fs from 'fs';
// import { createRequire } from 'module';

import prisma from '../utils/prisma.js';
import { evaluateResumeSkills } from '../services/matchingService.js';
import { evaluateEligibility } from '../services/eligibilityService.js';
import { PDFParse } from 'pdf-parse';
// const require = createRequire(import.meta.url);


// Upload and parse a new resume version for the student
// Upload and parse a new resume version for the student
export const uploadResumeVersion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file.' });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: { resumes: true },
    });

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    // Extract text from the uploaded PDF safely
    const fileBuffer = fs.readFileSync(req.file.path);
    let parsedText = '';
    
    try {
  const parser = new PDFParse({
    data: fileBuffer,
  });

  const result = await parser.getText();

  parsedText = result.text || '';

  await parser.destroy();

  console.log('✅ PDF parsed successfully');
  console.log('Extracted text length:', parsedText.length);

} catch (pdfError) {
  console.error('❌ PDF parsing failed:', pdfError);

  return res.status(400).json({
    message: 'Could not extract text from the uploaded PDF.',
    error: pdfError.message,
  });
}

    // Ensure no null bytes exist in parsedText regardless of parsing route
    parsedText = parsedText.replace(/\0/g, '');

    // Generate incremental version tag (V1, V2, etc.)
    const versionCount = studentProfile.resumes.length + 1;
    const versionTag = `V${versionCount}`;

    // Extract tech skills found in the text
   const detectedSkills = evaluateResumeSkills(
  parsedText,
  [
    'React',
    'Node.js',
    'Express',
    'PostgreSQL',
    'JavaScript',
    'Python',
    'Java',
    'HTML',
    'CSS',
    'Docker'
  ],
  []
).insights?.mandatory?.matched || [];

    const newResume = await prisma.resumeVersion.create({
      data: {
        studentId: studentProfile.id,
        fileUrl: req.file.path.replace(/\\/g, '/'),
        versionTag,
        parsedText,
        skillsFound: detectedSkills,
      },
    });

    return res.status(201).json({
      message: `Resume ${versionTag} uploaded and parsed successfully.`,
      resume: newResume,
    });
  } catch (error) {
    console.error('🔥 Upload Controller Exception:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Check eligibility and match score for a Placement Drive
export const analyzeDriveMatch = async (req, res) => {
  try {
    const { driveId, resumeVersionId } = req.body;

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    const drive = await prisma.placementDrive.findUnique({
      where: { id: driveId },
      include: { job: true },
    });

    if (!studentProfile || !drive) {
      return res.status(404).json({ message: 'Student profile or Drive not found.' });
    }

    // 1. Evaluate Hard Eligibility
    const eligibilityResult = evaluateEligibility(studentProfile, drive.job);
    if (!eligibilityResult.isEligible) {
      return res.status(200).json({
        eligible: false,
        reasons: eligibilityResult.reasons,
        canApply: false,
      });
    }

    // 2. Evaluate Resume Match
    const resume = await prisma.resumeVersion.findUnique({
      where: { id: resumeVersionId },
    });

    if (!resume) {
      return res.status(404).json({ message: 'Specified resume version not found.' });
    }
    console.log('========== MATCH DEBUG ==========');
console.log('Resume ID:', resume.id);
console.log('Resume version:', resume.versionTag);
console.log('Parsed text length:', resume.parsedText?.length);
console.log('Parsed text preview:', resume.parsedText?.substring(0, 1000));
console.log('Stored skills:', resume.skillsFound);
console.log('Mandatory skills:', drive.job.mandatorySkills);
console.log('Preferred skills:', drive.job.preferredSkills);
console.log('=================================');

    const matchAnalysis = evaluateResumeSkills(
  resume.parsedText || '',
  drive.job.mandatorySkills || [],
  drive.job.preferredSkills || []
);

    return res.status(200).json({
      eligible: true,
      canApply: matchAnalysis.canApply,
      matchScore: matchAnalysis.matchScore,
      insights: matchAnalysis.insights,
      resumeVersion: resume.versionTag,
    });
  } catch (error) {
    console.error('Match analysis error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Get all uploaded resume versions for the logged-in student
export const getMyResumes = async (req, res) => {
  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        resumes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    return res.status(200).json({ resumes: studentProfile.resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    return res.status(500).json({ error: error.message });
  }
};