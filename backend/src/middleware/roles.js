/**
 * Role-based access control middleware
 */

// Require specific roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
  };
}

// Require user management permission
function requireUserManagement(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  if (req.user.role === 'root' || req.user.can_manage_users) {
    return next();
  }
  return res.status(403).json({ error: 'No tienes permisos para gestionar usuarios' });
}

// Check if user has access to a specific event (for clients)
function requireEventAccess(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  // Root and admin have access to all events
  if (req.user.role === 'root' || req.user.role === 'admin') return next();
  // Client: check if event is assigned
  const eventId = req.params.eventId || req.params.id || req.body.event_id;
  if (!eventId) return next();
  
  const { getDB } = require('../models/database');
  getDB().query('SELECT id FROM user_events WHERE user_id = ? AND event_id = ?', [req.user.id, eventId])
    .then(([rows]) => {
      if (rows.length === 0) return res.status(403).json({ error: 'No tienes acceso a este evento' });
      next();
    })
    .catch(err => res.status(500).json({ error: err.message }));
}

module.exports = { requireRole, requireUserManagement, requireEventAccess };
