export const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Brak autoryzacji' });
    }

    if (!Array.isArray(roles)) {
      return res.status(500).json({ error: 'Błąd konfiguracji ról' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }

    next();
  };
};
