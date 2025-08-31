import { useState } from 'react';
import type { PricingInput, PricingResult, CalculationSteps } from './types/pricing';
import { calculatePricing } from './utils/pricingCalculator';
import './App.css';

function App() {
  const [input, setInput] = useState<PricingInput>({
    cost: 0,
    profitRate: 0,
    hasTax: false,
    hasDiscount: false,
  });

  const [result, setResult] = useState<PricingResult | null>(null);
  const [steps, setSteps] = useState<CalculationSteps | null>(null);

  const handleCalculate = () => {
    if (input.cost <= 0 || input.profitRate < 0) {
      alert('请输入有效的成本价和利润率');
      return;
    }

    const { result: calcResult, steps: calcSteps } = calculatePricing(input);
    setResult(calcResult);
    setSteps(calcSteps);
  };

  const handleInputChange = (field: keyof PricingInput, value: any) => {
    setInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧮 售价计算器</h1>
        <p>帮助Jack计算产品定价</p>
      </header>

      <div className="calculator-container">
        <div className="input-section">
          <h2>输入信息</h2>
          
          {/* 成本价和利润率 */}
          <div className="input-group">
            <label>成本价 (¥)</label>
            <input
              type="number"
              value={input.cost || ''}
              onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
              placeholder="请输入成本价"
            />
          </div>

          <div className="input-group">
            <label>利润率 (%)</label>
            <input
              type="number"
              value={input.profitRate || ''}
              onChange={(e) => handleInputChange('profitRate', parseFloat(e.target.value) || 0)}
              placeholder="请输入利润率"
            />
          </div>

          {/* 税费选择 */}
          <div className="input-group">
            <label>税费</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="tax"
                  checked={!input.hasTax}
                  onChange={() => handleInputChange('hasTax', false)}
                />
                无税
              </label>
              <label>
                <input
                  type="radio"
                  name="tax"
                  checked={input.hasTax && input.taxType === 'low'}
                  onChange={() => {
                    handleInputChange('hasTax', true);
                    handleInputChange('taxType', 'low');
                  }}
                />
                低税 (9.1%)
              </label>
              <label>
                <input
                  type="radio"
                  name="tax"
                  checked={input.hasTax && input.taxType === 'high'}
                  onChange={() => {
                    handleInputChange('hasTax', true);
                    handleInputChange('taxType', 'high');
                  }}
                />
                高税 (23%)
              </label>
            </div>
          </div>

          {/* 优惠选择 */}
          <div className="input-group">
            <label>
              <input
                type="checkbox"
                checked={input.hasDiscount}
                onChange={(e) => handleInputChange('hasDiscount', e.target.checked)}
              />
              启用优惠
            </label>
          </div>

          {input.hasDiscount && (
            <>
              <div className="input-group">
                <label>优惠类型</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="discountType"
                      checked={input.discountType === 'amount'}
                      onChange={() => handleInputChange('discountType', 'amount')}
                    />
                    满减 (满X减Y)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="discountType"
                      checked={input.discountType === 'percentage'}
                      onChange={() => handleInputChange('discountType', 'percentage')}
                    />
                    打折
                  </label>
                </div>
              </div>

              {input.discountType === 'amount' && (
                <>
                  <div className="input-group">
                    <label>满 (¥)</label>
                    <input
                      type="number"
                      value={input.discountThreshold || ''}
                      onChange={(e) => handleInputChange('discountThreshold', parseFloat(e.target.value) || 0)}
                      placeholder="满多少钱"
                    />
                  </div>
                  <div className="input-group">
                    <label>减 (¥)</label>
                    <input
                      type="number"
                      value={input.discountAmount || ''}
                      onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                      placeholder="减多少钱"
                    />
                  </div>
                </>
              )}

              {input.discountType === 'percentage' && (
                <div className="input-group">
                  <label>折扣 (%)</label>
                  <input
                    type="number"
                    value={input.discountPercentage || ''}
                    onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)}
                    placeholder="例如：90表示9折"
                    max="100"
                    min="1"
                  />
                </div>
              )}
            </>
          )}

          <button className="calculate-btn" onClick={handleCalculate}>
            计算定价
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h2>计算结果</h2>
            <div className="result-grid">
              <div className="result-item">
                <label>计划标价</label>
                <span className="price">¥{result.standardPrice}</span>
              </div>
              <div className="result-item">
                <label>计划到手价</label>
                <span className="price">¥{result.finalPrice}</span>
              </div>
              <div className="result-item">
                <label>实际利润</label>
                <span className="profit">¥{result.profit}</span>
              </div>
              <div className="result-item">
                <label>实际利润率</label>
                <span className="profit-rate">{result.actualProfitRate}%</span>
              </div>
            </div>

            {steps && (
              <div className="calculation-steps">
                <h3>计算步骤</h3>
                <div className="step">
                  <span>成本价:</span>
                  <span>¥{steps.basePrice}</span>
                </div>
                <div className="step">
                  <span>加利润后:</span>
                  <span>¥{steps.afterProfit.toFixed(2)}</span>
                </div>
                <div className="step">
                  <span>应用优惠后:</span>
                  <span>¥{steps.afterDiscount.toFixed(2)}</span>
                </div>
                <div className="step">
                  <span>加税费后:</span>
                  <span>¥{steps.afterTax.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App
