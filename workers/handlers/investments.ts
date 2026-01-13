/**
 * Investments API Handlers
 */

import { D1Service } from '../../services/core/d1Service';
import { checkProfitThreshold, getProfitRecommendation, calculatePortfolioProfitLoss } from '../../services/trading/tradingRulesService';
import { successResponse, errorResponse } from '../api/middleware/errorHandler';
import { validateInvestment } from '../../services/utils/validators';
import type { Env } from '../api/index';
import type { Investment, TradingRules } from '../../types';

/**
 * GET /api/investments
 */
export async function getInvestments(request: Request, env: Env): Promise<Response> {
  try {
    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getAllInvestments();

    if (!result.success) {
      return errorResponse(result.error || 'Failed to fetch investments', 500);
    }

    // Calculate portfolio metrics
    const investments = result.data || [];
    const metrics = calculatePortfolioProfitLoss(investments);

    return successResponse({
      investments,
      metrics,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * POST /api/investments
 */
export async function createInvestment(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const investment: Investment = body;

    // Validate
    const validation = validateInvestment(investment);
    if (!validation.valid) {
      return errorResponse('Validation failed', 400, { errors: validation.errors });
    }

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.createInvestment(investment);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to create investment', 500);
    }

    return successResponse(result.data, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * GET /api/investments/profit-check
 * Check which investments should take profit
 */
export async function profitCheck(request: Request, env: Env): Promise<Response> {
  try {
    const d1Service = new D1Service(env.DB);

    // Get investments
    const investmentsResult = await d1Service.getAllInvestments();
    if (!investmentsResult.success || !investmentsResult.data) {
      return errorResponse('Failed to fetch investments', 500);
    }

    // Get trading rules
    const rulesResult = await d1Service.getTradingRules();
    const rules = rulesResult.data || undefined;

    const investments = investmentsResult.data;
    const recommendations: Array<{
      investment: Investment;
      profitCheck: any;
      recommendation: string;
    }> = [];

    for (const inv of investments) {
      const profitCheck = checkProfitThreshold(inv, rules);

      if (profitCheck.shouldTakeProfit) {
        recommendations.push({
          investment: inv,
          profitCheck,
          recommendation: getProfitRecommendation(inv, rules),
        });
      }
    }

    return successResponse({
      total: investments.length,
      shouldTakeProfit: recommendations.length,
      recommendations,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
