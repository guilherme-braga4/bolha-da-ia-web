const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'always',
})

export const formatPrice = (price: string) => brl.format(Number(price))

export const formatDelta = (from: string, to: string) =>
  percent.format((Number(to) - Number(from)) / Number(from))

export const formatNumber = (value: string | number, digits = 0) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR')
