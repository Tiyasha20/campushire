import prisma from '../utils/prisma.js';

export const getPlacementFunnel = async (req, res) => {
  try {
    const [
      totalStudents,
      totalApplications,
      shortlisted,
      interviewsScheduled,
      offersExtended,
      placed,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'SHORTLISTED' } }),
      prisma.application.count({
        where: {
          status: { in: ['INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'] },
        },
      }),
      prisma.application.count({ where: { status: 'OFFER_EXTENDED' } }),
      prisma.application.count({ where: { status: 'ACCEPTED' } }),
    ]);

    res.status(200).json({
      funnel: {
        totalStudents,
        totalApplications,
        shortlisted,
        interviewsScheduled,
        offersExtended,
        placed,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDepartmentStats = async (req, res) => {
  try {
    const students = await prisma.studentProfile.findMany({
      select: {
        department: true,
        applications: {
          select: { status: true },
        },
      },
    });

    const stats = {};

    students.forEach((student) => {
      const dept = student.department;
      if (!stats[dept]) {
        stats[dept] = { totalStudents: 0, placedStudents: 0, totalApplications: 0 };
      }

      stats[dept].totalStudents += 1;
      stats[dept].totalApplications += student.applications.length;

      const isPlaced = student.applications.some((app) => app.status === 'ACCEPTED');
      if (isPlaced) {
        stats[dept].placedStudents += 1;
      }
    });

    res.status(200).json({ departmentStats: stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};