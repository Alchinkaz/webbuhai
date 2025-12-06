"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { calculateDashboardMetrics, formatCurrency } from "@/lib/finance-utils"
import { MetricCard } from "@/components/finance/metric-card"
import { TransactionList } from "@/components/finance/transaction-list"
import { TransactionForm } from "@/components/finance/transaction-form"
import { AccountCard } from "@/components/finance/account-card"
import { AccountForm } from "@/components/finance/account-form"
import { StatementImport } from "@/components/finance/statement-import"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, TrendingUp, TrendingDown, DollarSign, PlusCircle, Banknote } from "lucide-react"

const tabs = [
  { id: "analytics", label: "Аналитика" },
  { id: "bank", label: "Банк" },
  { id: "cash", label: "Касса" },
]

export function FinanceContent() {
  const [activeTab, setActiveTab] = useState("analytics")
  const { transactions, invoices, accounts } = useFinance()

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)

  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(lastDayOfMonth.toISOString().split("T")[0])

  const metrics = calculateDashboardMetrics(transactions, invoices, accounts, startDate, endDate)

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  const getTransactionCount = (accountId: string) => {
    return transactions.filter((t) => t.accountId === accountId).length
  }

  const bankActionButtons = (
    <div className="flex items-center gap-2">
      <StatementImport />
      <Button onClick={() => setIsTransactionDialogOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Новая транзакция
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0 border-b px-4 lg:px-6 mb-0 pt-4 pb-0 bg-background/95 backdrop-blur-md z-20">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Finance tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-muted-foreground hover:text-foreground relative whitespace-nowrap border-b-2 text-sm font-medium transition-colors pb-3.5 ${
                activeTab === tab.id ? "text-foreground border-foreground" : "border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "analytics" && (
          <div className="px-4 lg:px-6 space-y-6 pb-6 h-full overflow-y-auto">
            {/* Accounts section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Счета и кошельки</h2>
                <p className="text-sm text-muted-foreground">Управление счетами и балансами</p>
              </div>
              <Button onClick={() => setIsAccountDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить счёт
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Общий баланс
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Сумма по всем счетам</p>
              </CardContent>
            </Card>

            {accounts.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} transactionCount={getTransactionCount(account.id)} />
                ))}
              </div>
            )}

            {/* Period report section */}
            <Card>
              <CardHeader>
                <CardTitle>Период отчёта</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Начало периода</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Конец периода</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Общий баланс"
                value={formatCurrency(metrics.totalBalance)}
                description="Сумма по всем счетам"
                icon={<Wallet className="h-4 w-4" />}
                variant="default"
              />
              <MetricCard
                title="Выручка"
                value={formatCurrency(metrics.revenue)}
                description="Фактические поступления"
                icon={<TrendingUp className="h-4 w-4" />}
                variant="success"
              />
              <MetricCard
                title="Расходы"
                value={formatCurrency(metrics.expenses)}
                description="Все траты за период"
                icon={<TrendingDown className="h-4 w-4" />}
                variant="danger"
              />
              <MetricCard
                title="Прибыль"
                value={formatCurrency(metrics.profit)}
                description={`Маржа: ${metrics.profitMargin.toFixed(1)}%`}
                icon={<DollarSign className="h-4 w-4" />}
                variant={metrics.profit >= 0 ? "success" : "danger"}
              />
            </div>

            {/* Account dialog */}
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Создать новый счёт</DialogTitle>
                  <DialogDescription>
                    Добавьте банковский счёт, кошелёк или наличные для отслеживания финансов
                  </DialogDescription>
                </DialogHeader>
                <AccountForm
                  onSuccess={() => setIsAccountDialogOpen(false)}
                  onCancel={() => setIsAccountDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "bank" && (
          <div className="h-full flex flex-col">
            <TransactionList actionButtons={bankActionButtons} />

            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Новая транзакция</DialogTitle>
                  <DialogDescription>Добавьте доход, расход или перевод между счетами</DialogDescription>
                </DialogHeader>
                <TransactionForm
                  onSuccess={() => setIsTransactionDialogOpen(false)}
                  onCancel={() => setIsTransactionDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "cash" && (
          <div className="px-4 lg:px-6 space-y-6 pb-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-2xl font-bold">Касса</h2>
                <p className="text-sm text-muted-foreground">Управление наличными операциями</p>
              </div>
            </div>

            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Banknote className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Раздел в разработке</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Здесь будет функционал для управления кассовыми операциями и наличными средствами
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
