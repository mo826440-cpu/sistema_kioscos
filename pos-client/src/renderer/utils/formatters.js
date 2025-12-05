// =====================================================
// UTILIDADES DE FORMATEO - FORMATO ARGENTINO
// =====================================================

/**
 * Formatea un número a formato de moneda argentina
 * Ejemplo: 10000.5 -> $10.000,50
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0,00'
  }
  
  const num = parseFloat(amount)
  
  // Formatear con separadores argentinos
  const formatted = num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return `$${formatted}`
}

/**
 * Formatea un número sin el símbolo de moneda
 * Ejemplo: 10000.5 -> 10.000,50
 */
export const formatNumber = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00'
  }
  
  const num = parseFloat(amount)
  
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Convierte un string en formato argentino a número
 * Ejemplo: "10.000,50" -> 10000.50
 */
export const parseArgentineCurrency = (value) => {
  if (!value) return 0
  
  // Convertir a string y limpiar
  let str = value.toString().trim()
  
  // Remover el símbolo $
  str = str.replace('$', '')
  
  // Remover espacios
  str = str.replace(/\s/g, '')
  
  // Reemplazar puntos (separador de miles) por nada
  str = str.replace(/\./g, '')
  
  // Reemplazar coma (separador decimal) por punto
  str = str.replace(',', '.')
  
  const num = parseFloat(str)
  
  return isNaN(num) ? 0 : num
}

/**
 * Formatea un input mientras el usuario escribe
 * Mantiene el formato argentino en tiempo real
 */
export const formatInputCurrency = (value) => {
  if (!value) return ''
  
  // Obtener el número parseado
  const num = parseArgentineCurrency(value)
  
  // Si es 0, retornar vacío para mejor UX
  if (num === 0) return ''
  
  // Formatear sin el símbolo $
  return formatNumber(num)
}

