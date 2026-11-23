const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mediqueue_super_secret_jwt_key_2026_bca_academic_project';

// verify JWT in the Authorization header
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // payload includes id, email, role, etc.
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or corrupted token.',
    });
  }
}

// restrict route access to specific user roles (e.g. 'doctor', 'admin')
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] permissions. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET,
};
