import { Plan } from '@prisma/client'
import {
  PRO_PACKAGE_LIMIT,
  PRO_REPO_LIMIT,
  STARTER_PACKAGE_LIMIT,
  STARTER_REPO_LIMIT,
} from './billing.constants'

export function getRepoLimitForPlan(plan: Plan): number {
  return plan === Plan.pro ? PRO_REPO_LIMIT : STARTER_REPO_LIMIT
}

export function getPackageLimitForPlan(plan: Plan): number {
  return plan === Plan.pro ? PRO_PACKAGE_LIMIT : STARTER_PACKAGE_LIMIT
}

export function getPlanLimits(plan: Plan): { repoLimit: number; packageLimit: number } {
  return {
    repoLimit: getRepoLimitForPlan(plan),
    packageLimit: getPackageLimitForPlan(plan),
  }
}
