// Константы для кодов посещаемости
// Вынесены в отдельный файл для избежания проблем с порядком инициализации при минификации

export const ATTENDANCE_CODE = {
  FULL_DAY: "8",
  HALF_DAY: "4",
  ABSENT: "Н",
  DISMISSED: "У",
  VACATION: "О",
  SICK: "Б",
  CLEAR: "clear",
} as const

export type AttendanceCode = 
  | typeof ATTENDANCE_CODE.FULL_DAY
  | typeof ATTENDANCE_CODE.HALF_DAY
  | typeof ATTENDANCE_CODE.ABSENT
  | typeof ATTENDANCE_CODE.DISMISSED
  | typeof ATTENDANCE_CODE.VACATION
  | typeof ATTENDANCE_CODE.SICK
  | typeof ATTENDANCE_CODE.CLEAR

