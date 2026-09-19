import bcrypt from 'bcrypt';
import prisma from '../src/utils/prisma.js';
import { ROLES } from '../src/constants/roles.js';

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing records to ensure idempotent seeding
  await prisma.application.deleteMany({});
  await prisma.placementDrive.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.resumeVersion.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.recruiterProfile.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 1. Create TPC Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      password: defaultPasswordHash,
      role: ROLES.TPC_ADMIN,
      collegeId: 'COLLEGE-TECH-01',
    },
  });
  console.log('✅ Created TPC Admin:', adminUser.email);

  // 2. Create Companies
  const companyGoogle = await prisma.company.create({
    data: {
      name: 'Google India',
      website: 'https://careers.google.com',
    },
  });

  const companyMicrosoft = await prisma.company.create({
    data: {
      name: 'Microsoft IDC',
      website: 'https://careers.microsoft.com',
    },
  });
  console.log('✅ Created Companies');

  // 3. Create Recruiter
  const recruiterUser = await prisma.user.create({
    data: {
      email: 'recruiter@google.com',
      password: defaultPasswordHash,
      role: ROLES.RECRUITER,
      collegeId: 'COLLEGE-TECH-01',
    },
  });

  await prisma.recruiterProfile.create({
    data: {
      userId: recruiterUser.id,
      companyId: companyGoogle.id,
    },
  });
  console.log('✅ Created Recruiter:', recruiterUser.email);

  // 4. Create Students & Resume Snapshots
  // Student 1: Rahul Sharma
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'rahul.sharma@college.edu',
      password: defaultPasswordHash,
      role: ROLES.STUDENT,
      collegeId: 'COLLEGE-TECH-01',
    },
  });

  const profileRahul = await prisma.studentProfile.create({
    data: {
      userId: studentUser1.id,
      fullName: 'Rahul Sharma',
      department: 'CSE',
      batch: 2026,
      cgpa: 8.85,
      activeBacklogs: 0,
      qualification: 'B.Tech Computer Science & Engineering',
    },
  });

  const resumeRahul = await prisma.resumeVersion.create({
    data: {
      studentId: profileRahul.id,
      versionTag: 'V1',
      fileUrl: 'uploads/sample_rahul_v1.pdf',
      parsedText:
        'Rahul Sharma. Full Stack Engineer. Experience with React, Node.js, Express, PostgreSQL, Docker, and REST APIs. Proficient in dynamic programming, data structures, and algorithms.',
      skillsFound: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker'],
    },
  });

  // Student 2: Ananya Sen
  const studentUser2 = await prisma.user.create({
    data: {
      email: 'ananya.sen@college.edu',
      password: defaultPasswordHash,
      role: ROLES.STUDENT,
      collegeId: 'COLLEGE-TECH-01',
    },
  });

  const profileAnanya = await prisma.studentProfile.create({
    data: {
      userId: studentUser2.id,
      fullName: 'Ananya Sen',
      department: 'IT',
      batch: 2026,
      cgpa: 7.2,
      activeBacklogs: 1,
      qualification: 'B.Tech Information Technology',
    },
  });

  await prisma.resumeVersion.create({
    data: {
      studentId: profileAnanya.id,
      versionTag: 'V1',
      fileUrl: 'uploads/sample_ananya_v1.pdf',
      parsedText:
        'Ananya Sen. Frontend developer. Skilled in HTML, CSS, JavaScript, React, Tailwind CSS, and Figma prototyping.',
      skillsFound: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS'],
    },
  });
  console.log('✅ Created Demo Students & Profiles');

  // 5. Create Jobs & Placement Drives
  // Job 1: Approved Drive
  const jobSDE = await prisma.job.create({
    data: {
      companyId: companyGoogle.id,
      title: 'Software Development Engineer - I',
      description:
        'Looking for passionate engineers skilled in scalable backend architectures and modern web apps.',
      mandatorySkills: ['React', 'Node.js', 'PostgreSQL'],
      preferredSkills: ['Docker', 'AWS', 'Kubernetes'],
      minCgpa: 8.0,
      maxBacklogs: 0,
      eligibleDepts: ['CSE', 'IT', 'ECE'],
      eligibleBatches: [2025, 2026],
      isApproved: true,
    },
  });

  const driveSDE = await prisma.placementDrive.create({
    data: {
      jobId: jobSDE.id,
      collegeId: 'COLLEGE-TECH-01',
      driveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // In 7 days
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    },
  });

  // Job 2: Pending Approval
  await prisma.job.create({
    data: {
      companyId: companyMicrosoft.id,
      title: 'Cloud Solutions Associate',
      description:
        'Engage with enterprise customers to design and build cloud native architectures on Azure.',
      mandatorySkills: ['Networking', 'Linux', 'Python'],
      preferredSkills: ['Azure', 'Terraform'],
      minCgpa: 7.5,
      maxBacklogs: 0,
      eligibleDepts: ['CSE', 'IT', 'EE'],
      eligibleBatches: [2026],
      isApproved: false,
    },
  });
  console.log('✅ Created Jobs & Placement Drives');

  // 6. Create Test Application for Rahul Sharma
  await prisma.application.create({
    data: {
      driveId: driveSDE.id,
      studentId: profileRahul.id,
      resumeVersionId: resumeRahul.id,
      matchScore: 80,
      matchDetails: {
        mandatory: { matched: ['React', 'Node.js', 'PostgreSQL'], missing: [] },
        preferred: { matched: ['Docker'], missing: ['AWS', 'Kubernetes'] },
      },
      status: 'SHORTLISTED',
    },
  });
  console.log('✅ Seeded Test Application');

  console.log('\n✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });