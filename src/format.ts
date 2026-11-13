const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const percent = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'always',
})

export const formatPrice = (price: string) => brl.format(Number(price))

export const formatDelta = (oldPrice: string, newPrice: string) =>
  percent.format((Number(newPrice) - Number(oldPrice)) / Number(oldPrice))

export const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR')
