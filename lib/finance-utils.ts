import type { Transaction, Invoice, Account, DashboardMetrics } from "./types"

export function calculateDashboardMetrics(
  transactions: Transaction[],
  invoices: Invoice[],
  accounts: Account[],
  startDate?: string,
  endDate?: string,
): DashboardMetrics {
  const filteredTransactions = transactions.filter((t) => {
    if (startDate && t.date < startDate) return false
    if (endDate && t.date > endDate) return false
    return true
  })

  const filteredInvoices = invoices.filter((i) => {
    if (startDate && i.issueDate < startDate) return false
    if (endDate && i.issueDate > endDate) return false
    return true
  })

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const turnover = filteredInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
  const revenue = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const expenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const profit = revenue - expenses
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

  return { totalBalance, turnover, revenue, expenses, profit, profitMargin }
}

export function formatCurrency(amount: number, currency = "KZT"): string {
  const sign = amount < 0 ? "-" : ""
  const formatted = Math.abs(amount)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${sign}${formatted} ${currency}`
}

export function formatDate(date: string): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

export function maskAccountNumber(accountNumber?: string, visible = 4): string | undefined {
  if (!accountNumber) return undefined
  const digits = accountNumber.replace(/\s+/g, "")
  if (digits.length <= visible) return digits
  const last = digits.slice(-visible)
  return `•••• ${last}`
}

export function getMonthlyData(transactions: Transaction[], invoices: Invoice[], months = 6) {
  const now = new Date()
  const monthlyData = []

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = date.toISOString().split("T")[0]
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0]

    const monthTransactions = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd)
    const monthInvoices = invoices.filter((i) => i.issueDate >= monthStart && i.issueDate <= monthEnd)

    const revenue = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const turnover = monthInvoices.reduce((sum, i) => sum + i.totalAmount, 0)

    monthlyData.push({
      month: date.toLocaleDateString("ru-RU", { month: "short", year: "numeric" }),
      revenue,
      expenses,
      turnover,
      profit: revenue - expenses,
    })
  }

  return monthlyData
}

export function getCategoryExpenses(
  transactions: Transaction[],
  categories: { id: string; name: string; color: string }[],
) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense")

  const categoryTotals = categories.map((category) => {
    const total = expenseTransactions.filter((t) => t.categoryId === category.id).reduce((sum, t) => sum + t.amount, 0)

    return {
      name: category.name,
      value: total,
      color: category.color,
    }
  })

  return categoryTotals.filter((c) => c.value > 0).sort((a, b) => b.value - a.value)
}
