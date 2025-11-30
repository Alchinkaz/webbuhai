export const translations = {
  en: {
    home: "Home",
    deals: "Finance",
    inventory: "Inventory",
    party: "Party",
    hr: "Employees",
    settings: "Settings",
    getHelp: "Get Help",
    documents: "Documents",
    documentsDescription: "Manage your documents and files",

    // Legacy/old pages
    dashboard: "Dashboard",
    dashboardOld: "Dashboard Old",
    dashboardNew: "Dashboard New",
    projects: "Projects",

    // Settings Page
    settingsTitle: "Settings",
    settingsDescription: "Manage your application preferences",
    appearance: "Appearance",
    appearanceDescription: "Customize the appearance of the application",
    theme: "Theme",
    themeDescription: "Select the theme for the application",
    light: "Light",
    dark: "Dark",
    language: "Language",
    languageDescription: "Select your preferred language",
    selectLanguage: "Select language",

    // Dashboard
    totalRevenue: "Total Revenue",
    subscriptions: "Subscriptions",
    sales: "Sales",
    activeNow: "Active Now",

    // Get Help Page
    getHelpTitle: "Get Help",
    getHelpDescription: "This is the help page.",

    // User Menu
    account: "Account",
    billing: "Billing",
    notifications: "Notifications",
    logOut: "Log out",

    // Common
    save: "Save",
    cancel: "Cancel",
    search: "Search",

    partyDescription: "Manage your clients, suppliers, and partners",
    hrDescription: "Manage departments and employees",

    // Inventory translations
    inventoryDescription: "Manage warehouses and resources",
    warehouses: "Warehouses",
    addWarehouse: "Add Warehouse",
    warehouseName: "Warehouse Name",
    warehouseType: "Warehouse Type",
    warehouseLocation: "Location",
    resourceCount: "Resources",
    editWarehouse: "Edit Warehouse",
    deleteWarehouse: "Delete Warehouse",
    viewResources: "View Resources",
    addResource: "Add Resource",
    name: "Name", // Simplified column names - removed "Resource" prefix
    type: "Type", // Simplified column names - removed "Resource" prefix
    quantity: "Quantity",
    unit: "Unit",
    price: "Price",
    backToWarehouses: "Back to Warehouses",
    cannotDeleteWarehouse: "Cannot delete warehouse with resources",
    warehouseHasResources: "This warehouse contains resources. Please move or delete them first.",
    edit: "Edit",
    delete: "Delete",

    // Legacy counterparties (kept for compatibility)
    counterparties: "Counterparties",
    counterpartiesDescription: "Manage your clients, suppliers, and partners",

    // Finance page tabs
    finance: "Finance",
    analytics: "Analytics",
    transactions: "Transactions",
    wallet: "Wallet",
  },
  ru: {
    home: "Главная",
    deals: "Финансы",
    inventory: "Инвентарь",
    party: "Контрагенты",
    hr: "Сотрудники",
    settings: "Настройки",
    getHelp: "Поддержка",
    documents: "Документы",
    documentsDescription: "Управление документами и файлами",

    // Legacy/old pages
    dashboard: "Дашборд",
    dashboardOld: "Панель управления старая",
    dashboardNew: "Панель управления новая",
    projects: "Проекты",

    // Settings Page
    settingsTitle: "Настройки",
    settingsDescription: "Управление настройками приложения",
    appearance: "Внешний вид",
    appearanceDescription: "Настройка внешнего вида приложения",
    theme: "Тема",
    themeDescription: "Выберите тему для приложения",
    light: "Светлая",
    dark: "Темная",
    language: "Язык",
    languageDescription: "Выберите предпочитаемый язык",
    selectLanguage: "Выберите язык",

    // Dashboard
    totalRevenue: "Общий доход",
    subscriptions: "Подписки",
    sales: "Продажи",
    activeNow: "Активны сейчас",

    // Get Help Page
    getHelpTitle: "Поддержка",
    getHelpDescription: "Это страница поддержки.",

    // User Menu
    account: "Аккаунт",
    billing: "Оплата",
    notifications: "Уведомления",
    logOut: "Выйти",

    // Common
    save: "Сохранить",
    cancel: "Отмена",
    search: "Поиск",

    partyDescription: "Управление клиентами, поставщиками и партнерами",
    hrDescription: "Управление отделами и сотрудниками",

    // Inventory translations
    inventoryDescription: "Управление складами и ресурсами",
    warehouses: "Склады",
    addWarehouse: "Добавить склад",
    warehouseName: "Название склада",
    warehouseType: "Тип склада",
    warehouseLocation: "Местоположение",
    resourceCount: "Ресурсов",
    editWarehouse: "Редактировать склад",
    deleteWarehouse: "Удалить склад",
    viewResources: "Просмотр ресурсов",
    addResource: "Добавить ресурс",
    name: "Название", // Simplified column names - removed "Resource" prefix
    type: "Тип", // Simplified column names - removed "Resource" prefix
    quantity: "Количество",
    unit: "Единица",
    price: "Цена",
    backToWarehouses: "Назад к складам",
    cannotDeleteWarehouse: "Невозможно удалить склад с ресурсами",
    warehouseHasResources: "В этом складе есть ресурсы. Сначала переместите или удалите их.",
    edit: "Редактировать",
    delete: "Удалить",

    // Legacy counterparties (kept for compatibility)
    counterparties: "Контрагенты",
    counterpartiesDescription: "Управление клиентами, поставщиками и партнерами",

    // Finance page tabs
    finance: "Финансы",
    analytics: "Аналитика",
    transactions: "Транзакции",
    wallet: "Кошелек",
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
