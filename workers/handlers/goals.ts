/**
 * Goals API Handlers
 */

import { D1Service } from '../../services/core/d1Service';
import { successResponse, errorResponse } from '../api/middleware/errorHandler';
import { validateGoal } from '../../services/utils/validators';
import type { Env } from '../api/index';
import type { Goal } from '../../types';

/**
 * GET /api/goals
 * Get all financial goals
 */
export async function getGoals(request: Request, env: Env): Promise<Response> {
  try {
    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getAllGoals();

    if (!result.success) {
      return errorResponse(result.error || 'Failed to fetch goals', 500);
    }

    const goals = result.data || [];

    // Calculate progress for each goal
    const goalsWithProgress = goals.map((goal) => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remaining = goal.targetAmount - goal.currentAmount;
      const daysRemaining = Math.ceil(
        (new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...goal,
        progress: Number(progress.toFixed(2)),
        remaining,
        daysRemaining,
        isCompleted: goal.currentAmount >= goal.targetAmount,
        isOverdue: new Date(goal.targetDate) < new Date() && goal.currentAmount < goal.targetAmount,
      };
    });

    return successResponse(goalsWithProgress);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * POST /api/goals
 * Create new goal
 */
export async function createGoal(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const goal: Goal = body;

    // Validate
    const validation = validateGoal(goal);
    if (!validation.valid) {
      return errorResponse('Validation failed', 400, { errors: validation.errors });
    }

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.createGoal(goal);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to create goal', 500);
    }

    return successResponse(result.data, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * PUT /api/goals/:id
 * Update goal progress
 */
export async function updateGoal(
  request: Request,
  env: Env,
  params: { id: string }
): Promise<Response> {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return errorResponse('Goal ID is required', 400);
    }

    // Only allow updating currentAmount
    const { currentAmount } = body;

    if (typeof currentAmount !== 'number' || currentAmount < 0) {
      return errorResponse('Invalid currentAmount', 400);
    }

    const d1Service = new D1Service(env.DB);

    // Get existing goal
    const existingResult = await d1Service.getAllGoals();
    if (!existingResult.success || !existingResult.data) {
      return errorResponse('Failed to fetch goal', 500);
    }

    const existingGoal = existingResult.data.find((g) => g.id === id);
    if (!existingGoal) {
      return errorResponse('Goal not found', 404);
    }

    // Update goal
    const updatedGoal: Goal = {
      ...existingGoal,
      currentAmount,
    };

    const result = await d1Service.updateGoal(id, updatedGoal);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to update goal', 500);
    }

    return successResponse(result.data);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * DELETE /api/goals/:id
 * Delete goal
 */
export async function deleteGoal(
  request: Request,
  env: Env,
  params: { id: string }
): Promise<Response> {
  try {
    const { id } = params;

    if (!id) {
      return errorResponse('Goal ID is required', 400);
    }

    const d1Service = new D1Service(env.DB);
    const result = await d1Service.deleteGoal(id);

    if (!result.success) {
      return errorResponse(result.error || 'Failed to delete goal', 500);
    }

    return successResponse({ message: 'Goal deleted successfully' });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

/**
 * GET /api/goals/summary
 * Get goals summary and statistics
 */
export async function getGoalsSummary(request: Request, env: Env): Promise<Response> {
  try {
    const d1Service = new D1Service(env.DB);
    const result = await d1Service.getAllGoals();

    if (!result.success || !result.data) {
      return errorResponse('Failed to fetch goals', 500);
    }

    const goals = result.data;
    const now = new Date();

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
    const activeGoals = goals.filter(
      (g) => g.currentAmount < g.targetAmount && new Date(g.targetDate) >= now
    ).length;
    const overdueGoals = goals.filter(
      (g) => g.currentAmount < g.targetAmount && new Date(g.targetDate) < now
    ).length;

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalRemaining = totalTarget - totalSaved;
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return successResponse({
      totalGoals,
      completedGoals,
      activeGoals,
      overdueGoals,
      totalTarget,
      totalSaved,
      totalRemaining,
      overallProgress: Number(overallProgress.toFixed(2)),
      completionRate: totalGoals > 0 ? Number(((completedGoals / totalGoals) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
