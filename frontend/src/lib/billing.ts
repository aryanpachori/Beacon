export const PRO_PLAN_PRICE_INR = 999
export const PRO_PLAN_AMOUNT_PAISE = 99_900
export const PRO_PLAN_CURRENCY = 'INR'

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
