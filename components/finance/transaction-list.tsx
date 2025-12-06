"use client"

import { useState, useMemo } from "react"
import { useFinance } from "@/lib/finance-context"
import { formatCurrency, formatDate } from "@/lib/finance-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, MoreHorizontal, Trash2, Search, Filter, ArrowUp, ArrowDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TransactionForm } from "@/components/finance/transaction-form"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReactNode } from "react"

// Функция для сокращения текста
const truncateText = (text: string, maxLength = 30) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Форматирование чисел как в Admiral Design System
const numberFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Компонент для ячейки суммы с правильным форматированием
const AmountCell = ({
  amount,
  currency,
  type,
  disabled = false,
}: {
  amount: number
  currency?: string
  type: string
  disabled?: boolean
}) => {
  const formattedAmount = numberFormatter.format(amount)
  const isNegative = type === "expense"

  return (
    <div
      className={cn("text-right font-semibold tabular-nums text-sm", "text-overflow-ellipsis overflow-hidden", {
        "text-green-600 dark:text-green-400": type === "income",
        "text-red-600 dark:text-red-400": type === "expense",
        "text-blue-600 dark:text-blue-400": type === "transfer",
        "opacity-50": disabled,
      })}
    >
      {isNegative && "-"}
      {formattedAmount} {currency || "KZT"}
    </div>
  )
}

interface TransactionListProps {
  filterByType?: "income" | "expense"
  actionButtons?: ReactNode
}

export function TransactionList({ filterByType, actionButtons }: TransactionListProps) {
  const { transactions, accounts, categories, counterparties, deleteTransaction, updateTransaction } = useFinance()
  const { toast } = useToast()
  const [activeTypeTab, setActiveTypeTab] = useState<"expense" | "income">("expense")
  const [filterType, setFilterType] = useState<string>("income")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [limit, setLimit] = useState<number>(50)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [editOpen, setEditOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkEditData, setBulkEditData] = useState({
    accountId: "",
    categoryId: "",
    date: "",
    type: "",
    counterpartyId: "",
  })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<any>(null)

  // Состояние для сортировки
  const [sortColumn, setSortColumn] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Функция сортировки транзакций
  const sortTransactions = (transactions: any[], column: string, direction: "asc" | "desc") => {
    return [...transactions].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (column) {
        case "date":
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case "type":
          aValue = a.type
          bValue = b.type
          break
        case "category":
          const aCategory = categories.find((c) => c.id === a.categoryId)
          const bCategory = categories.find((c) => c.id === b.categoryId)
          aValue = aCategory?.name || ""
          bValue = bCategory?.name || ""
          break
        case "account":
          const aAccount = accounts.find((acc) => acc.id === a.accountId)
          const bAccount = accounts.find((acc) => acc.id === b.accountId)
          aValue = aAccount?.name || ""
          bValue = bAccount?.name || ""
          break
        case "counterparty":
          const aCounterparty = counterparties.find((cp) => cp.id === a.counterpartyId)
          const bCounterparty = counterparties.find((cp) => cp.id === b.counterpartyId)
          aValue = aCounterparty?.name || ""
          bValue = bCounterparty?.name || ""
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "comment":
          aValue = a.comment || ""
          bValue = b.comment || ""
          break
        default:
          return 0
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1
      return 0
    })
  }

  // Обработчик клика на заголовок колонки
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const allFilteredTransactions = useMemo(() => {
    const typeToFilter = filterByType || activeTypeTab
    const filtered = transactions.filter((t) => {
      if (t.type !== typeToFilter) return false
      if (filterCategory !== "all" && t.categoryId !== filterCategory) return false
      return true
    })

    // Применяем сортировку
    return sortTransactions(filtered, sortColumn, sortDirection)
  }, [transactions, filterByType, activeTypeTab, filterCategory, sortColumn, sortDirection])

  const totalPages = Math.ceil(allFilteredTransactions.length / limit)
  const startIndex = (currentPage - 1) * limit
  const endIndex = startIndex + limit
  const filteredTransactions = allFilteredTransactions.slice(startIndex, endIndex)

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту транзакцию? Баланс счёта будет скорректирован.")) {
      try {
        deleteTransaction(id)
        toast({
          title: "Успешно",
          description: "Транзакция удалена",
        })
      } catch (error) {
        console.error("Error deleting transaction:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось удалить транзакцию",
          variant: "destructive",
        })
      }
    }
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setEditOpen(true)
  }

  const handleShowDetails = (transaction: any) => {
    setSelectedTransactionDetails(transaction)
    setDetailsOpen(true)
  }

  const handleSelectTransaction = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTransactions)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedTransactions(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(filteredTransactions.map((t) => t.id)))
    } else {
      setSelectedTransactions(new Set())
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    setSelectedTransactions(new Set()) // Очищаем выбор при смене страницы
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setCurrentPage(1) // Сбрасываем на первую страницу при изменении лимита
  }

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) return

    if (
      confirm(
        `Вы уверены, что хотите удалить ${selectedTransactions.size} транзакций? Балансы счетов будут скорректированы.`,
      )
    ) {
      try {
        selectedTransactions.forEach((id) => deleteTransaction(id))
        setSelectedTransactions(new Set())
        toast({
          title: "Успешно",
          description: `Удалено ${selectedTransactions.size} транзакций`,
        })
      } catch (error) {
        console.error("Error deleting transactions:", error)
        toast({
          title: "Ошибка",
          description: "Не удалось удалить транзакции",
          variant: "destructive",
        })
      }
    }
  }

  const handleBulkEdit = () => {
    if (selectedTransactions.size === 0) return
    setBulkEditOpen(true)
  }

  const handleBulkEditSubmit = () => {
    if (selectedTransactions.size === 0) return

    if (typeof updateTransaction !== "function") {
      console.error("updateTransaction function is not available")
      toast({
        title: "Ошибка",
        description: "Функция обновления недоступна",
        variant: "destructive",
      })
      return
    }

    try {
      let updatedCount = 0
      selectedTransactions.forEach((id) => {
        const transaction = transactions.find((t) => t.id === id)
        if (!transaction) {
          console.warn(`Transaction with id ${id} not found`)
          return
        }

        const updates: any = {}
        if (bulkEditData.accountId) updates.accountId = bulkEditData.accountId
        if (bulkEditData.categoryId) updates.categoryId = bulkEditData.categoryId
        if (bulkEditData.date) updates.date = bulkEditData.date
        if (bulkEditData.type) updates.type = bulkEditData.type
        if (bulkEditData.counterpartyId) updates.counterpartyId = bulkEditData.counterpartyId

        if (Object.keys(updates).length > 0) {
          try {
            updateTransaction(id, updates)
            updatedCount++
          } catch (error) {
            console.error(`Error updating transaction ${id}:`, error)
          }
        }
      })

      setSelectedTransactions(new Set())
      setBulkEditOpen(false)
      setBulkEditData({
        accountId: "",
        categoryId: "",
        date: "",
        type: "",
        counterpartyId: "",
      })

      if (updatedCount > 0) {
        toast({
          title: "Успешно",
          description: `Обновлено ${updatedCount} транзакций`,
        })
      } else {
        toast({
          title: "Предупреждение",
          description: "Не было обновлено ни одной транзакции",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in bulk edit:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить транзакции",
        variant: "destructive",
      })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "income":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "expense":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "transfer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return ""
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "income":
        return "Доход"
      case "expense":
        return "Расход"
      case "transfer":
        return "Перевод"
      default:
        return type
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Sticky toolbar section */}
        <div className="shrink-0 space-y-4 px-4 lg:px-6 py-4 bg-background">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Tabs value={activeTypeTab} onValueChange={(v) => setActiveTypeTab(v as "expense" | "income")}>
                <TabsList>
                  <TabsTrigger value="expense">Расходы</TabsTrigger>
                  <TabsTrigger value="income">Доходы</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-10 h-10 p-0 flex items-center justify-center [&>svg:last-child]:hidden">
                  <Filter className="h-4 w-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">{actionButtons}</div>
          </div>

          {selectedTransactions.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Выбрано: {selectedTransactions.size}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(true)}
                className="h-8"
                disabled={selectedTransactions.size === filteredTransactions.length}
              >
                Выбрать все на странице
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTransactions(new Set(allFilteredTransactions.map((t) => t.id)))
                }}
                className="h-8"
                disabled={selectedTransactions.size === allFilteredTransactions.length}
              >
                Выбрать все ({allFilteredTransactions.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkEdit} className="h-8 bg-transparent">
                <Edit className="h-4 w-4 mr-1" />
                Редактировать
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="h-8">
                <Trash2 className="h-4 w-4 mr-1" />
                Удалить
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTransactions(new Set())} className="h-8">
                <MoreHorizontal className="h-4 w-4 mr-1" />
                Отменить выбор
              </Button>
            </div>
          )}
        </div>

        {/* Table section with scrollable body */}
        <div className="flex-1 min-h-0 px-4 lg:px-6 flex flex-col">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">
                {transactions.length === 0 ? "Нет транзакций" : "Ничего не найдено"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {transactions.length === 0
                  ? "Добавьте первую транзакцию, чтобы начать отслеживать финансы"
                  : "Попробуйте изменить фильтры или поисковый запрос"}
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-lg border">
              <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
                <table className="w-full table-auto border-collapse">
                  <thead className="sticky top-0 z-10 bg-background">
                    <tr className="border-b">
                      <th className="w-12 h-10 px-2 text-left align-middle font-medium text-sm flex-shrink-0">
                        <Checkbox
                          checked={
                            selectedTransactions.size === filteredTransactions.length && filteredTransactions.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th
                        className="w-24 h-10 px-2 text-left align-middle font-medium text-sm cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-1">
                          Дата
                          {sortColumn === "date" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="w-20 h-10 px-2 text-left align-middle font-medium text-sm cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center gap-1">
                          Тип
                          {sortColumn === "type" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="w-28 h-10 px-2 text-left align-middle font-medium text-sm cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort("category")}
                      >
                        <div className="flex items-center gap-1">
                          Категория
                          {sortColumn === "category" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="w-28 h-10 px-2 text-left align-middle font-medium text-sm cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort("account")}
                      >
                        <div className="flex items-center gap-1">
                          Счёт
                          {sortColumn === "account" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="w-28 h-10 px-2 text-left align-middle font-medium text-sm cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort("counterparty")}
                      >
                        <div className="flex items-center gap-1">
                          Контрагент
                          {sortColumn === "counterparty" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="w-24 h-10 px-2 text-right align-middle font-medium text-sm cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Сумма
                          {sortColumn === "amount" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="w-32 h-10 px-2 text-left align-middle font-medium text-sm cursor-pointer hover:bg-muted/50 whitespace-nowrap"
                        onClick={() => handleSort("comment")}
                      >
                        <div className="flex items-center gap-1">
                          Комментарий
                          {sortColumn === "comment" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th className="w-12 h-10 px-2 text-center align-middle flex-shrink-0" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => {
                      const account = accounts.find((a) => a.id === transaction.accountId)
                      const toAccount = transaction.toAccountId
                        ? accounts.find((a) => a.id === transaction.toAccountId)
                        : null
                      const category = categories.find((c) => c.id === transaction.categoryId)
                      const counterparty = counterparties.find((cp) => cp.id === transaction.counterpartyId)

                      return (
                        <tr
                          key={transaction.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors border-b"
                          onClick={() => handleEdit(transaction)}
                        >
                          <td className="w-12 p-2 align-middle flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedTransactions.has(transaction.id)}
                              onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                            />
                          </td>
                          <td className="w-24 p-2 align-middle text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                            {new Date(transaction.date).toLocaleDateString("ru-RU", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                          <td className="w-20 p-2 align-middle">
                            <Badge className={cn("font-medium text-sm px-1 py-0", getTypeColor(transaction.type))}>
                              {getTypeLabel(transaction.type)}
                            </Badge>
                          </td>
                          <td className="w-28 p-2 align-middle">
                            {category && transaction.type !== "transfer" ? (
                              <div className="flex items-center gap-1 min-w-0">
                                <div
                                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span
                                  className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                                  title={category.name}
                                >
                                  {truncateText(category.name, 15)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm">-</span>
                            )}
                          </td>
                          <td className="w-28 p-2 align-middle">
                            {transaction.type === "transfer" && toAccount ? (
                              <div className="text-sm">
                                <div
                                  className="font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                  title={account?.name}
                                >
                                  {truncateText(account?.name || "-", 12)}
                                </div>
                                <div className="text-center text-muted-foreground">→</div>
                                <div
                                  className="font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                                  title={toAccount.name}
                                >
                                  {truncateText(toAccount.name, 12)}
                                </div>
                              </div>
                            ) : (
                              <span
                                className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                                title={account?.name}
                              >
                                {truncateText(account?.name || "-", 15)}
                              </span>
                            )}
                          </td>
                          <td
                            className="w-28 p-2 align-middle text-muted-foreground text-sm whitespace-nowrap overflow-hidden text-ellipsis"
                            title={counterparty?.name}
                          >
                            {truncateText(counterparty?.name || "-", 15)}
                          </td>
                          <td className="w-24 p-2 align-middle text-right">
                            <AmountCell
                              amount={transaction.amount}
                              currency={transaction.currency}
                              type={transaction.type}
                            />
                          </td>
                          <td
                            className="w-32 p-2 align-middle text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis"
                            title={transaction.comment}
                          >
                            {truncateText(transaction.comment || "-", 20)}
                          </td>
                          <td className="w-12 p-2 align-middle text-center">
                            <Button variant="ghost" size="sm" onClick={() => handleShowDetails(transaction)}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {filteredTransactions.length > 0 && (
            <div className="shrink-0 flex items-center justify-between py-4">
              <div className="flex items-center gap-2">
                <Select value={limit.toString()} onValueChange={(value) => handleLimitChange(Number(value))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Назад
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать транзакцию</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              transaction={editingTransaction}
              onSuccess={() => {
                setEditOpen(false)
                setEditingTransaction(null)
              }}
              onCancel={() => {
                setEditOpen(false)
                setEditingTransaction(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Массовое редактирование</DialogTitle>
            <p className="text-sm text-muted-foreground">Редактировать {selectedTransactions.size} транзакций</p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Счёт</label>
              <Select
                value={bulkEditData.accountId || "_none"}
                onValueChange={(value) =>
                  setBulkEditData((prev) => ({ ...prev, accountId: value === "_none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите счёт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Не изменять</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Категория</label>
              <Select
                value={bulkEditData.categoryId || "_none"}
                onValueChange={(value) =>
                  setBulkEditData((prev) => ({ ...prev, categoryId: value === "_none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Не изменять</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Тип</label>
              <Select
                value={bulkEditData.type || "_none"}
                onValueChange={(value) =>
                  setBulkEditData((prev) => ({ ...prev, type: value === "_none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Не изменять</SelectItem>
                  <SelectItem value="income">Доход</SelectItem>
                  <SelectItem value="expense">Расход</SelectItem>
                  <SelectItem value="transfer">Перевод</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Контрагент</label>
              <Select
                value={bulkEditData.counterpartyId || "_none"}
                onValueChange={(value) =>
                  setBulkEditData((prev) => ({ ...prev, counterpartyId: value === "_none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите контрагента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Не изменять</SelectItem>
                  {counterparties.map((counterparty) => (
                    <SelectItem key={counterparty.id} value={counterparty.id}>
                      {counterparty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Дата</label>
              <Input
                type="date"
                value={bulkEditData.date}
                onChange={(e) => setBulkEditData((prev) => ({ ...prev, date: e.target.value }))}
                placeholder="Выберите дату"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleBulkEditSubmit}>Применить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Подробности транзакции</DialogTitle>
          </DialogHeader>
          {selectedTransactionDetails && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Дата</label>
                <p className="text-sm">{formatDate(selectedTransactionDetails.date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Тип</label>
                <p className="text-sm">{getTypeLabel(selectedTransactionDetails.type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Сумма</label>
                <p className="text-sm font-semibold">
                  {selectedTransactionDetails.type === "expense" && "-"}
                  {formatCurrency(selectedTransactionDetails.amount, selectedTransactionDetails.currency)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Счёт</label>
                <p className="text-sm">
                  {accounts.find((a) => a.id === selectedTransactionDetails.accountId)?.name || "-"}
                </p>
              </div>
              {selectedTransactionDetails.toAccountId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Получатель</label>
                  <p className="text-sm">
                    {accounts.find((a) => a.id === selectedTransactionDetails.toAccountId)?.name || "-"}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Категория</label>
                <p className="text-sm">
                  {categories.find((c) => c.id === selectedTransactionDetails.categoryId)?.name || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Контрагент</label>
                <p className="text-sm">
                  {counterparties.find((cp) => cp.id === selectedTransactionDetails.counterpartyId)?.name || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Комментарий</label>
                <p className="text-sm whitespace-pre-wrap">{selectedTransactionDetails.comment || "-"}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
