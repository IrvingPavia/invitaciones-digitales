/**
 * Unit tests for packageAccess middleware.
 * Tests feature access control, admin bypass, and lifecycle status checks.
 */

const { requirePackageFeature, requireActiveEvent, getPlanFeatures, PLAN_FEATURES } = require('./packageAccess');

// Mock the database module
jest.mock('../models/database', () => ({
  getDB: jest.fn()
}));

const { getDB } = require('../models/database');

function mockReq({ role = 'client', self_registered = true, eventId = '1', params = {} } = {}) {
  return {
    user: { id: 1, role, self_registered },
    params: { id: eventId, ...params }
  };
}

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('packageAccess middleware', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = jest.fn();
    getDB.mockReturnValue({ query: mockQuery });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlanFeatures', () => {
    it('returns correct features for Invitación Digital', () => {
      expect(getPlanFeatures('Invitación Digital')).toEqual(['landing_builder', 'guest_management', 'qr_codes']);
    });

    it('returns correct features for Tarjeta Física', () => {
      expect(getPlanFeatures('Tarjeta Física')).toEqual(['card_editor', 'pdf_export']);
    });

    it('returns correct features for Completo', () => {
      expect(getPlanFeatures('Completo')).toEqual(['all']);
    });

    it('returns correct features for Trial', () => {
      expect(getPlanFeatures('Trial')).toEqual(['all']);
    });

    it('returns empty array for null plan_type', () => {
      expect(getPlanFeatures(null)).toEqual([]);
    });

    it('returns empty array for unknown plan_type', () => {
      expect(getPlanFeatures('Unknown')).toEqual([]);
    });
  });

  describe('requirePackageFeature', () => {
    it('allows admin (non-self-registered) to bypass all checks', async () => {
      const req = mockReq({ role: 'admin', self_registered: false });
      const res = mockRes();
      const next = jest.fn();

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('allows root (non-self-registered) to bypass all checks', async () => {
      const req = mockReq({ role: 'root', self_registered: false });
      const res = mockRes();
      const next = jest.fn();

      const middleware = requirePackageFeature('card_editor');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('does NOT bypass for self-registered admin', async () => {
      const req = mockReq({ role: 'admin', self_registered: true });
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Invitación Digital' }]]);

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(mockQuery).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('returns 404 when event is not found', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[]]);

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Evento no encontrado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns EVENT_COMPLETED for completed events', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'completed', plan_type: 'Completo' }]]);

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'EVENT_COMPLETED' }));
      expect(next).not.toHaveBeenCalled();
    });

    it('returns FEATURE_NOT_INCLUDED when plan does not include feature', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Invitación Digital' }]]);

      const middleware = requirePackageFeature('card_editor');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'FEATURE_NOT_INCLUDED',
        required_feature: 'card_editor'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('allows access when feature is included in plan', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Invitación Digital' }]]);

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('allows access to any feature when plan is Completo', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Completo' }]]);

      const middleware = requirePackageFeature('card_editor');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('allows access to any feature when plan is Trial', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Trial' }]]);

      const middleware = requirePackageFeature('pdf_export');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('uses req.params.eventId when available', async () => {
      const req = mockReq({ params: { eventId: '42' } });
      delete req.params.id;
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Completo' }]]);

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['42']
      );
      expect(next).toHaveBeenCalled();
    });

    it('returns 400 when no eventId is available', async () => {
      const req = { user: { id: 1, role: 'client', self_registered: true }, params: {} };
      const res = mockRes();
      const next = jest.fn();

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('Tarjeta Física blocks landing_builder access', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Tarjeta Física' }]]);

      const middleware = requirePackageFeature('landing_builder');
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FEATURE_NOT_INCLUDED' }));
    });

    it('Tarjeta Física allows card_editor access', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active', plan_type: 'Tarjeta Física' }]]);

      const middleware = requirePackageFeature('card_editor');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireActiveEvent', () => {
    it('allows admin (non-self-registered) to bypass', async () => {
      const req = mockReq({ role: 'root', self_registered: false });
      const res = mockRes();
      const next = jest.fn();

      await requireActiveEvent(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('returns EVENT_COMPLETED for completed events', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'completed' }]]);

      await requireActiveEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'EVENT_COMPLETED' }));
      expect(next).not.toHaveBeenCalled();
    });

    it('allows active events to pass through', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'active' }]]);

      await requireActiveEvent(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('allows available events to pass through', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[{ lifecycle_status: 'available' }]]);

      await requireActiveEvent(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('returns 404 when event not found', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      mockQuery.mockResolvedValue([[]]);

      await requireActiveEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when no eventId is available', async () => {
      const req = { user: { id: 1, role: 'client', self_registered: true }, params: {} };
      const res = mockRes();
      const next = jest.fn();

      await requireActiveEvent(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
