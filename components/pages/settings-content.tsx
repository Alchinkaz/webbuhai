"use client"

import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "next-themes"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import {
  Monitor,
  Moon,
  Sun,
  CreditCard,
  Info,
  Loader2,
  Copy,
  Check,
  MoreHorizontal,
  Pencil,
  Plus,
  KeyRound,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

function EditableField({
  label,
  id,
  type = "text",
  placeholder,
  defaultValue,
  disabled = false,
}: {
  label: string
  id: string
  type?: string
  placeholder?: string
  defaultValue: string
  disabled?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsEditing(false)
    }, 1000)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setValue(defaultValue)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          readOnly={!isEditing}
          onClick={() => !disabled && setIsEditing(true)}
          className="bg-muted/50"
        />
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <Button size="sm" onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Сохранить
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isLoading}>
            Отмена
          </Button>
        </div>
      )}
    </div>
  )
}

const filters = [
  { id: "general", label: "Основные" },
  { id: "company", label: "Компания" },
  { id: "account", label: "Аккаунт" },
  { id: "payment", label: "Оплата" },
]

function AddDataButton() {
  return (
    <button className="flex items-center gap-2 mt-2">
      <span className="flex items-center justify-center w-6 h-6 rounded border border-border bg-background">
        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
      <span className="text-sm text-foreground">Добавить данные</span>
    </button>
  )
}

export function SettingsContent() {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("general")
  const [copied, setCopied] = useState(false)
  const userId = "gRGPYbeSngSZvVZbhU2M53XN"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col pb-8 h-full">
      <div className="shrink-0 border-b px-4 lg:px-6 mb-2 pt-4 pb-0 bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Settings tabs">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveTab(filter.id)}
              className={`text-muted-foreground hover:text-foreground relative whitespace-nowrap border-b-2 text-sm font-medium transition-colors pb-3.5 ${
                activeTab === filter.id ? "text-foreground border-foreground" : "border-transparent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-2 md:py-4">
        {activeTab === "general" && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="font-medium text-muted-foreground">Интерфейс</h3>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Тема</div>
                  <div className="text-sm text-muted-foreground">Выберите предпочтительную цветовую схему</div>
                </div>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={theme}
                  onValueChange={(value) => value && setTheme(value)}
                >
                  <ToggleGroupItem value="system" aria-label="System">
                    <Monitor className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="light" aria-label="Light">
                    <Sun className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" aria-label="Dark">
                    <Moon className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Язык</div>
                  <div className="text-sm text-muted-foreground">Выберите предпочтительный язык</div>
                </div>
                <Select defaultValue="ru">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Выберите язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "company" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Реквизиты компании */}
            <h3 className="font-medium text-muted-foreground">Реквизиты компании</h3>

            <div className="relative flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="default"
                  className="h-9 px-3 rounded-md bg-muted/50 border border-border text-muted-foreground cursor-not-allowed opacity-60"
                  title="ЭЦП"
                  disabled
                >
                  <KeyRound className="h-4 w-4 mr-0" />
                  <span className="text-sm">ЭЦП</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md bg-background border border-border hover:bg-muted"
                  title="Редактировать"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="font-semibold text-foreground text-2xl">ИП Alchin</span>
                  </div>

                  <div className="overflow-x-auto -mt-1 pt-2.5">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="py-3 pr-6 w-1/2 whitespace-nowrap">
                            <p className="text-sm text-muted-foreground mb-1">ИИН/БИН</p>
                            <p className="text-sm font-medium text-foreground">123456789012</p>
                          </td>
                          <td className="py-3 w-1/2 whitespace-nowrap">
                            <p className="text-sm text-muted-foreground mb-1">Налоговый режим</p>
                            <p className="text-sm font-medium text-foreground">Упрощёнка</p>
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="py-3 pr-6 whitespace-nowrap">
                            <p className="text-sm text-muted-foreground mb-1">Страна резидентства</p>
                            <p className="text-sm font-medium text-foreground">KZ - КАЗАХСТАН</p>
                          </td>
                          <td className="py-3 whitespace-nowrap">
                            <p className="text-sm text-muted-foreground mb-1">Код бенефициара</p>
                            <p className="text-sm font-medium text-foreground">17</p>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-6 whitespace-nowrap pt-3 pb-1.5">
                            <p className="text-sm text-muted-foreground mb-1">Единый платёж</p>
                            <p className="text-sm font-medium text-foreground">Плательщик ЕП</p>
                          </td>
                          <td className="py-3 whitespace-nowrap pt-3 pb-1.5">
                            <p className="text-sm text-muted-foreground mb-1">НДС</p>
                            <p className="text-sm font-medium text-foreground">Без НДС</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Блок Логотип и Печать - третий */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              {/* Логотип */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Логотип</div>
                  <div className="text-sm text-muted-foreground">Нажмите на логотип, чтобы загрузить новый</div>
                </div>
                <Avatar className="h-14 w-14 cursor-pointer hover:opacity-90 transition-opacity rounded-lg">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 text-white font-semibold rounded-lg">
                    ИП
                  </AvatarFallback>
                </Avatar>
              </div>
              <Separator />
              {/* Печать */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Печать</div>
                  <div className="text-sm text-muted-foreground">Нажмите, чтобы загрузить изображение печати</div>
                </div>
                <Avatar className="h-14 w-14 cursor-pointer hover:opacity-90 transition-opacity rounded-full">
                  <AvatarFallback className="bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 text-white font-semibold rounded-full border-2 border-dashed border-slate-300">
                    <Plus className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Код налогового органа */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-4 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Код налогового органа</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Код УГД по месту регистрации</p>
                  <AddDataButton />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">БИН аппарата акима по месту нахождения</p>
                  <AddDataButton />
                </div>
              </div>
            </div>

            {/* Документы */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-4 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Документы</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Свидетельство о регистрации</p>
                  <AddDataButton />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Свидетельство о постановке на учёт по НДС</p>
                  <AddDataButton />
                </div>
              </div>
            </div>

            {/* Расчётный счет */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Расчётный счет</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>

            {/* Адрес */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Адрес</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>

            {/* Склад */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Склад</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>

            {/* Касса */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Касса</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>

            {/* Ответственные лица */}
            <h3 className="font-medium text-muted-foreground">Ответственные лица</h3>

            {/* Директор */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Директор</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>

            {/* Главный бухгалтер */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Главный бухгалтер</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>

            {/* Заведующий складом */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Заведующий складом</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>

            {/* Отпуск товаров */}
            <div className="flex flex-col p-4 rounded-xl border border-border bg-card">
              <div className="mb-2 pb-3 -mx-4 px-4 border-b border-border">
                <h3 className="text-base font-medium text-foreground">Отпуск товаров</h3>
              </div>
              <div className="flex flex-col gap-0">
                <AddDataButton />
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Подраздел: Профиль */}
            <h3 className="font-medium text-muted-foreground">Профиль</h3>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              {/* Аватар */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Аватар</div>
                  <div className="text-sm text-muted-foreground">Нажмите на аватар, чтобы загрузить новый</div>
                </div>
                <Avatar className="h-14 w-14 cursor-pointer hover:opacity-90 transition-opacity">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-semibold">
                    A
                  </AvatarFallback>
                </Avatar>
              </div>
              <Separator />
              {/* Отображаемое имя */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Отображаемое имя</div>
                  <div className="text-sm text-muted-foreground">Имя, которое видят другие пользователи</div>
                </div>
                <div className="w-[200px]">
                  <Input defaultValue="Admin" placeholder="Введите имя" />
                </div>
              </div>
              <Separator />
              {/* User ID */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">User ID</div>
                  <div className="text-sm text-muted-foreground">Ваш уникальный идентификатор</div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{userId}</code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 bg-transparent"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Подраздел: Безопасность */}
            <h3 className="font-medium text-muted-foreground">Безопасность</h3>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              {/* Почта */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Электронная почта</div>
                  <div className="text-sm text-muted-foreground">Используется для входа и уведомлений</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">admin@example.com</span>
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400"
                  >
                    Основной
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
              {/* Пароль */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Пароль</div>
                  <div className="text-sm text-muted-foreground">Изменить пароль для входа в аккаунт</div>
                </div>
                <Button variant="outline">Изменить пароль</Button>
              </div>
            </div>

            {/* Подраздел: Опасная зона */}
            <h3 className="font-medium text-red-500">Опасная зона</h3>
            <div className="rounded-xl border border-red-200 dark:border-red-900 bg-card text-card-foreground shadow-sm">
              {/* Удаление аккаунта */}
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="font-medium">Удалить аккаунт</div>
                  <div className="text-sm text-muted-foreground">Безвозвратно удалить аккаунт и все данные</div>
                </div>
                <Button variant="destructive">Удалить</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">Текущий тариф</h3>
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-base font-medium">Бесплатный план 0₸/мес</div>
                  <div className="text-sm text-muted-foreground mt-1">Включает кредиты на 500₸ каждый месяц.</div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
                    Посмотреть тарифы
                  </Button>
                  <Button className="flex-1 sm:flex-none">Улучшить</Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <div className="text-3xl font-bold">$4.23</div>
                  <div className="text-sm text-zinc-400 mt-1">admin@example.com</div>
                </div>
                <Button variant="outline">Купить кредиты</Button>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white flex flex-col justify-between shadow-2xl flex-shrink-0 w-full md:w-[320px] h-[202px] p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)] hover:scale-[1.02] group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/5 transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="text-3xl font-bold">$4.23</div>
                    <div className="text-sm text-zinc-400 mt-1">admin@example.com</div>
                  </div>
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      Подарочные кредиты <Info className="h-3 w-3 opacity-50" />
                    </div>
                    <div className="font-medium text-sm">$0.00</div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      Ежемесячные кредиты <Info className="h-3 w-3 opacity-50" />
                    </div>
                    <div className="font-medium text-sm">$4.23 / $5.00</div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/40">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      Купленные кредиты <Info className="h-3 w-3 opacity-50" />
                    </div>
                    <div className="font-medium text-sm">$0.00</div>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div className="font-medium text-sm">Всего доступно кредитов</div>
                    <div className="font-bold text-sm">$4.23</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-muted-foreground">Способ оплаты</h3>
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="rounded-lg border p-2 bg-muted/50">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">Способ оплаты не добавлен</div>
                    <div className="text-sm text-muted-foreground">Добавьте способ оплаты в ваш аккаунт.</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  Добавить карту
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
