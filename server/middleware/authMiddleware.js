// Placeholder middleware.
// Admin auth in this beginner-friendly demo is handled on the frontend
// with a hardcoded admin account + localStorage token (see README).
// Kept here so the folder structure matches a real project and can be
// extended later with real JWT verification if needed.
const protect = (req, res, next) => {
  next();
};

module.exports = { protect };
