"use client"

import { IconChevronRight } from "@tabler/icons-react"
import { useNavigation } from "@/hooks/use-navigation"
import { useLanguage } from "@/hooks/use-language"

export function Breadcrumbs() {
  const { currentPage, selectedWarehouse, setSelectedWarehouse, selectedDepartment, setSelectedDepartment } =
    useNavigation()
  const { t } = useLanguage()

  const getBreadcrumbs = () => {
    const crumbs: { label: string; onClick?: () => void }[] = []

    switch (currentPage) {
      case "Home":
      case "home":
        crumbs.push({ label: t("home") })
        break
      case "Deals":
      case "deals":
        crumbs.push({ label: t("deals") })
        break
      case "Inventory":
      case "inventory":
        crumbs.push({
          label: t("inventory"),
          onClick: selectedWarehouse ? () => setSelectedWarehouse(null) : undefined,
        })
        if (selectedWarehouse) {
          crumbs.push({ label: selectedWarehouse.name })
        }
        break
      case "Party":
      case "party":
        crumbs.push({ label: t("party") })
        break
      case "HR":
      case "hr":
        crumbs.push({
          label: t("hr"),
          onClick: selectedDepartment ? () => setSelectedDepartment(null) : undefined,
        })
        if (selectedDepartment) {
          crumbs.push({ label: selectedDepartment.name })
        }
        break
      case "Documents":
      case "documents":
        crumbs.push({ label: t("documents") })
        break
      case "Finance":
      case "finance":
        crumbs.push({ label: t("finance") })
        break
      case "settings":
        crumbs.push({ label: t("settings") })
        break
      case "reports":
        crumbs.push({ label: "Отчёты" })
        break
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <IconChevronRight className="h-4 w-4" />}
          {crumb.onClick ? (
            <button onClick={crumb.onClick} className="hover:text-foreground transition-colors">
              {crumb.label}
            </button>
          ) : (
            <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
