/**
 * Transactions API Handlers
 */

import { D1Service } from '../../services/core/d1Service';
import { successResponse, errorResponse } from '../api/middleware/errorHandler';
import { validateTransaction } from '../../services/utils/validators';
import type { Env } from '../api/index';
import type { Transaction } from '../../types';

/**
 * GET /api/transactions
 * Get all transactions with optional filters
 */
export async function getTransactions(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const type = url.searchParams.get('type') as Transaction['type'] | undefined;
    const category = url.searchParams.get('category') || undefined;

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getAllTransactions(limit, type, category);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to fetch transactions', 500);
    }

    return successResponse(result.data || []);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * POST /api/transactions
 * Create new transaction
 */
export async function createTransaction(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const transaction: Transaction = body;

    // Validate
    const validation = validateTransaction(transaction);
    if (!validation.valid) {
      return errorResponse('Validation failed', 400, { errors: validation.errors });
    }

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.createTransaction(transaction);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to create transaction', 500);
    }

    return successResponse(result.data, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * GET /api/transactions/summary
 * Get transaction summary (income vs expense)
 */
export async function getTransactionSummary(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month'; // month, quarter, year

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getAllTransactions(1000);

    if (!result.success || !result.data) {
      return errorResponse('Failed to fetch transactions', 500);
    }

    const transactions = result.data;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Filter transactions by period
    const periodTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= now;
    });

    // Calculate summary
    const income = periodTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = periodTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const netCashFlow = income - expense;

    // Group by category
    const byCategory: Record<string, number> = {};
    periodTransactions.forEach((t) => {
      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      byCategory[t.category] += t.amount;
    });

    return successResponse({
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      totalIncome: income,
      totalExpense: expense,
      netCashFlow,
      transactionCount: periodTransactions.length,
      byCategory,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * DELETE /api/transactions/:id
 * Delete transaction
 */
export async function deleteTransaction(
  request: Request,
  env: Env,
  params: { id: string }
): Promise<Response> {
  try {
    const { id } = params;

    if (!id) {
      return errorResponse('Transaction ID is required', 400);
    }

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.deleteTransaction(id);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to delete transaction', 500);
    }

    return successResponse({ message: 'Transaction deleted successfully' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
