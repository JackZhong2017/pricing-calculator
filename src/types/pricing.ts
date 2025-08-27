export interface PricingInput {
  cost: number;
  profitRate: number;
  hasTax: boolean;
  taxType?: 'high' | 'low';
  hasDiscount: boolean;
  discountType?: 'amount' | 'percentage';
  discountAmount?: number;
  discountPercentage?: number;
  discountThreshold?: number;
}

export interface PricingResult {
  standardPrice: number;
  finalPrice: number;
  profit: number;
  actualProfitRate: number;
}

export interface CalculationSteps {
  basePrice: number;
  afterProfit: number;
  afterDiscount: number;
  afterTax: number;
}