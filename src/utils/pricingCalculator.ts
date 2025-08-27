import type { PricingInput, PricingResult, CalculationSteps } from '../types/pricing';

const TAX_RATES = {
  high: 0.23,
  low: 0.091
};

export function calculatePricing(input: PricingInput): { result: PricingResult; steps: CalculationSteps } {
  const { cost, profitRate, hasTax, taxType, hasDiscount, discountType, discountAmount, discountPercentage, discountThreshold } = input;

  // Step 1: 成本价 + 利润
  const basePrice = cost;
  const profit = cost * (profitRate / 100);
  const afterProfit = cost + profit;

  // Step 2: 加税费（在优惠前）
  let afterTax = afterProfit;
  
  if (hasTax && taxType) {
    const taxRate = TAX_RATES[taxType];
    afterTax = afterProfit * (1 + taxRate);
  }

  // Step 3: 反推标价（考虑优惠）
  let standardPrice = afterTax;
  
  if (hasDiscount) {
    if (discountType === 'amount' && discountThreshold && discountAmount) {
      // 满减优惠：只有当到手价满足门槛时才应用满减
      if (afterTax >= discountThreshold) {
        standardPrice = afterTax + discountAmount;
      }
    } else if (discountType === 'percentage' && discountPercentage) {
      // 打折优惠：反推标价 = 到手价 / 折扣率
      standardPrice = afterTax / (discountPercentage / 100);
    }
  }

  // 计算结果
  const finalPrice = afterTax; // 计划到手价（加税后的价格）
  const actualProfitRate = profitRate; // 实际利润率保持不变

  const steps: CalculationSteps = {
    basePrice,
    afterProfit,
    afterDiscount: standardPrice,
    afterTax
  };

  const result: PricingResult = {
    standardPrice: Math.round(standardPrice * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    actualProfitRate: Math.round(actualProfitRate * 100) / 100
  };

  return { result, steps };
}