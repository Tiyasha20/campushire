import jwt from 'jsonwebtoken';
import { ROLES } from '../constants/roles.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = decodedUser; // { id, email, role, collegeId }
    next();
  });
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}]`,
      });
    }
    next();
  };
};

export const requireTPCAdmin = requireRole(ROLES.TPC_ADMIN);
export const requireRecruiter = requireRole(ROLES.RECRUITER);
export const requireStudent = requireRole(ROLES.STUDENT);