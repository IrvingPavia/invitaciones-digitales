const { calculateVolumeDiscount } = require('./discount.service');
const { getDB } = require('../models/database');

// Mock the database module
jest.mock('../models/database');

describe('calculateVolumeDiscount', () => {
  let mockQuery;

  beforeEach(() => {
    mockQuery = jest.fn();
    getDB.mockReturnValue({ query: mockQuery });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('throws error when plan is not found', async () => {
    mockQuery.mockResolvedValue([[]]);
    await expect(calculateVolumeDiscount(999, 1)).rejects.toThrow('Plan not found');
  });

  test('returns 0 discount when plan has no volume_discount rules', async () => {
    mockQuery.mockResolvedValue([[{ price: '500.00', volume_discount: null }]]);
    const result = await calculateVolumeDiscount(1, 3);

    expect(result).toEqual({
      unitPrice: 500,
      quantity: 3,
      discountPct: 0,
      totalAmount: 1500.00
    });
  });

  test('returns 0 discount when volume_discount is empty array', async () => {
    mockQuery.mockResolvedValue([[{ price: '200.00', volume_discount: [] }]]);
    const result = await calculateVolumeDiscount(1, 2);

    expect(result).toEqual({
      unitPrice: 200,
      quantity: 2,
      discountPct: 0,
      totalAmount: 400.00
    });
  });

  test('returns 0 discount when quantity does not meet minimum', async () => {
    const rules = [{ min_qty: 5, discount_pct: 10 }, { min_qty: 10, discount_pct: 20 }];
    mockQuery.mockResolvedValue([[{ price: '300.00', volume_discount: rules }]]);
    const result = await calculateVolumeDiscount(1, 3);

    expect(result).toEqual({
      unitPrice: 300,
      quantity: 3,
      discountPct: 0,
      totalAmount: 900.00
    });
  });

  test('applies correct discount when quantity meets a tier', async () => {
    const rules = [{ min_qty: 3, discount_pct: 10 }, { min_qty: 5, discount_pct: 15 }];
    mockQuery.mockResolvedValue([[{ price: '100.00', volume_discount: rules }]]);
    const result = await calculateVolumeDiscount(1, 4);

    // quantity=4, meets min_qty=3 (10%) but not min_qty=5
    expect(result).toEqual({
      unitPrice: 100,
      quantity: 4,
      discountPct: 10,
      totalAmount: 360.00  // 100 * 4 * (1 - 10/100) = 360
    });
  });

  test('applies the greatest discount whose min_qty does not exceed quantity', async () => {
    const rules = [
      { min_qty: 2, discount_pct: 5 },
      { min_qty: 5, discount_pct: 10 },
      { min_qty: 10, discount_pct: 20 }
    ];
    mockQuery.mockResolvedValue([[{ price: '250.00', volume_discount: rules }]]);
    const result = await calculateVolumeDiscount(1, 10);

    // quantity=10, meets all tiers, highest applicable is 20%
    expect(result).toEqual({
      unitPrice: 250,
      quantity: 10,
      discountPct: 20,
      totalAmount: 2000.00  // 250 * 10 * (1 - 20/100) = 2000
    });
  });

  test('handles volume_discount stored as JSON string', async () => {
    const rules = JSON.stringify([{ min_qty: 3, discount_pct: 15 }]);
    mockQuery.mockResolvedValue([[{ price: '400.00', volume_discount: rules }]]);
    const result = await calculateVolumeDiscount(1, 5);

    expect(result).toEqual({
      unitPrice: 400,
      quantity: 5,
      discountPct: 15,
      totalAmount: 1700.00  // 400 * 5 * (1 - 15/100) = 1700
    });
  });

  test('handles invalid JSON string in volume_discount gracefully', async () => {
    mockQuery.mockResolvedValue([[{ price: '100.00', volume_discount: 'not-valid-json' }]]);
    const result = await calculateVolumeDiscount(1, 5);

    expect(result).toEqual({
      unitPrice: 100,
      quantity: 5,
      discountPct: 0,
      totalAmount: 500.00
    });
  });

  test('correctly calculates total with decimal prices', async () => {
    const rules = [{ min_qty: 2, discount_pct: 10 }];
    mockQuery.mockResolvedValue([[{ price: '199.99', volume_discount: rules }]]);
    const result = await calculateVolumeDiscount(1, 3);

    // 199.99 * 3 * (1 - 10/100) = 199.99 * 3 * 0.9 = 539.973 → 539.97
    expect(result).toEqual({
      unitPrice: 199.99,
      quantity: 3,
      discountPct: 10,
      totalAmount: 539.97
    });
  });
});
