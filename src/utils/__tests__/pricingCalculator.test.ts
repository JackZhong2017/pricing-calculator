import { calculatePricing } from '../pricingCalculator';
import type { PricingInput } from '../../types/pricing';

describe('定价计算器', () => {
  test('基础计算：成本价100，利润率20%，无税无优惠', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 20,
      hasTax: false,
      hasDiscount: false,
    };

    const { result } = calculatePricing(input);

    expect(result.standardPrice).toBe(120);
    expect(result.finalPrice).toBe(120);
    expect(result.profit).toBe(20);
    expect(result.actualProfitRate).toBe(20);
  });

  test('加税计算：高税23%', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 20,
      hasTax: true,
      taxType: 'high',
      hasDiscount: false,
    };

    const { result } = calculatePricing(input);

    expect(result.standardPrice).toBe(147.6); // 120 * 1.23
    expect(result.finalPrice).toBe(147.6);
  });

  test('加税计算：低税9.1%', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 20,
      hasTax: true,
      taxType: 'low',
      hasDiscount: false,
    };

    const { result } = calculatePricing(input);

    expect(result.standardPrice).toBe(130.92); // 120 * 1.091
    expect(result.finalPrice).toBe(130.92);
  });

  test('打折优惠：9折', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 20,
      hasTax: false,
      hasDiscount: true,
      discountType: 'percentage',
      discountPercentage: 90,
    };

    const { result } = calculatePricing(input);

    expect(result.standardPrice).toBe(133.33); // 120 / 0.9
    expect(result.finalPrice).toBe(120);
  });

  test('满减优惠：满200减30', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 100, // 利润率100%，成本价变为200
      hasTax: false,
      hasDiscount: true,
      discountType: 'amount',
      discountThreshold: 200,
      discountAmount: 30,
    };

    const { result } = calculatePricing(input);

    expect(result.standardPrice).toBe(230); // 200 + 30 (反推标价)
    expect(result.finalPrice).toBe(200); // 到手价
  });

  test('满减优惠不满足条件：满300减30，但价格只有120', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 50, // 提高利润率到50%，价格变为150
      hasTax: false,
      hasDiscount: true,
      discountType: 'amount',
      discountThreshold: 300,
      discountAmount: 30,
    };

    const { result } = calculatePricing(input);

    expect(result.standardPrice).toBe(150); // 不满足满减条件，价格不变
    expect(result.finalPrice).toBe(150);
  });

  test('复合计算：先9折优惠，后加高税23%', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 20,
      hasTax: true,
      taxType: 'high',
      hasDiscount: true,
      discountType: 'percentage',
      discountPercentage: 90,
    };

    const { result } = calculatePricing(input);

    // 计算步骤：100 -> 120(+20%) -> 147.6(+23%) -> 164(反推9折标价)
    expect(result.standardPrice).toBe(164);
    expect(result.finalPrice).toBe(147.6);
  });

  test('复合计算：先满200减30，后加低税9.1%', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 100, // 100 -> 200
      hasTax: true,
      taxType: 'low',
      hasDiscount: true,
      discountType: 'amount',
      discountThreshold: 200,
      discountAmount: 30,
    };

    const { result } = calculatePricing(input);

    // 计算步骤：100 -> 200(+100%) -> 218.2(+9.1%) -> 248.2(反推满减标价)
    expect(result.standardPrice).toBe(248.2);
    expect(result.finalPrice).toBe(218.2);
  });

  test('用户示例：成本100，利润率15%，低税9.1%，打折85%', () => {
    const input: PricingInput = {
      cost: 100,
      profitRate: 15,
      hasTax: true,
      taxType: 'low',
      hasDiscount: true,
      discountType: 'percentage',
      discountPercentage: 85,
    };

    const { result } = calculatePricing(input);

    // 预期结果：
    // 成本价：100
    // 加利润后：115 (100 + 100*0.15)
    // 加税费后：125.46 (115 * 1.091)
    // 计划到手价：125.46
    // 应用优惠后：147.60 (125.46 / 0.85)
    // 计划标价：147.60
    expect(result.finalPrice).toBe(125.47);
    expect(result.standardPrice).toBe(147.61);
    expect(result.profit).toBe(15);
    expect(result.actualProfitRate).toBe(15);
  });
});