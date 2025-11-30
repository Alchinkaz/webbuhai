export function numberToWordsRu(num: number): string {
  if (num === 0) return "ноль"

  const ones = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"]
  const teens = [
    "десять",
    "одиннадцать",
    "двенадцать",
    "тринадцать",
    "четырнадцать",
    "пятнадцать",
    "шестнадцать",
    "семнадцать",
    "восемнадцать",
    "девятнадцать",
  ]
  const tens = [
    "",
    "",
    "двадцать",
    "тридцать",
    "сорок",
    "пятьдесят",
    "шестьдесят",
    "семьдесят",
    "восемьдесят",
    "девяносто",
  ]
  const hundreds = [
    "",
    "сто",
    "двести",
    "триста",
    "четыреста",
    "пятьсот",
    "шестьсот",
    "семьсот",
    "восемьсот",
    "девятьсот",
  ]

  const thousands = ["", "тысяча", "тысячи", "тысяч"]
  const millions = ["", "миллион", "миллиона", "миллионов"]

  function getPlural(num: number, forms: string[]): string {
    const n = Math.abs(num) % 100
    const n1 = n % 10
    if (n > 10 && n < 20) return forms[3]
    if (n1 > 1 && n1 < 5) return forms[2]
    if (n1 === 1) return forms[1]
    return forms[3]
  }

  function convertHundreds(n: number, isFeminine = false): string {
    if (n === 0) return ""
    const parts: string[] = []

    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10

    if (h > 0) parts.push(hundreds[h])

    if (t === 1) {
      parts.push(teens[o])
    } else {
      if (t > 0) parts.push(tens[t])
      if (o > 0) {
        if (isFeminine && o === 1) parts.push("одна")
        else if (isFeminine && o === 2) parts.push("две")
        else parts.push(ones[o])
      }
    }

    return parts.join(" ")
  }

  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * 100)

  const parts: string[] = []

  // Millions
  const m = Math.floor(integerPart / 1000000)
  if (m > 0) {
    parts.push(convertHundreds(m))
    parts.push(getPlural(m, millions))
  }

  // Thousands
  const th = Math.floor((integerPart % 1000000) / 1000)
  if (th > 0) {
    parts.push(convertHundreds(th, true))
    parts.push(getPlural(th, thousands))
  }

  // Hundreds
  const h = integerPart % 1000
  if (h > 0 || integerPart === 0) {
    parts.push(convertHundreds(h))
  }

  let result = parts.filter((p) => p).join(" ")
  result += " тенге"

  if (decimalPart > 0) {
    result += ` ${decimalPart.toString().padStart(2, "0")} тиын`
  } else {
    result += " 00 тиын"
  }

  return result
}

export const numberToWords = numberToWordsRu
