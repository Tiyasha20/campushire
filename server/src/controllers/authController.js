import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';

export const register = async (req, res) => {
  try {
    const { email, password, role, collegeId, profileData } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Create user and respective profile record
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        collegeId: collegeId || null,
        ...(role === 'STUDENT' && profileData
          ? {
              studentProfile: {
                create: {
                  fullName: profileData.fullName,
                  department: profileData.department,
                  batch: Number(profileData.batch),
                  cgpa: Number(profileData.cgpa),
                  activeBacklogs: Number(profileData.activeBacklogs || 0),
                  qualification: profileData.qualification,
                },
              },
            }
          : {}),
        ...(role === 'RECRUITER' && profileData
          ? {
              recruiterProfile: {
                create: {
                  companyId: profileData.companyId,
                },
              },
            }
          : {}),
      },
      include: {
        studentProfile: true,
        recruiterProfile: true,
      },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, collegeId: newUser.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.studentProfile || newUser.recruiterProfile || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
export const registerRecruiter = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      companyName,
      companyWebsite,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !companyName) {
      return res.status(400).json({
        message: 'Full name, email, password, and company name are required.',
      });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email already registered.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find company by name
    let company = await prisma.company.findFirst({
      where: {
        name: companyName,
      },
    });

    // Create company if it doesn't exist
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          website: companyWebsite || null,
        },
      });
    }

    // Create recruiter user and profile
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'RECRUITER',
        collegeId: null,

        recruiterProfile: {
  create: {
    status: 'PENDING',
    company: {
      connect: {
        id: company.id,
      },
    },
  },
},
    },

      include: {
        recruiterProfile: {
          include: {
            company: true,
          },
        },
      },
    });

    return res.status(201).json({
      message:
        'Registration submitted successfully. Your account is awaiting TPC Admin approval.',

      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        profile: newUser.recruiterProfile,
      },
    });

  } catch (error) {
    console.error('Recruiter registration error:', error);

    return res.status(500).json({
      message: 'Internal server error.',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        recruiterProfile: true,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, collegeId: user.collegeId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.studentProfile || user.recruiterProfile || null,
      },
    });
  } catch (error) {
  console.error('Recruiter registration error:', error);

  return res.status(500).json({
    message: error.message,
  });
}
};