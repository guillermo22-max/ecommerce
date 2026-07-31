// Fully simulated payment gateway — no card data ever leaves the browser.
const DECLINE_TEST_NUMBER = '4000000000000002'

export function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function luhnCheck(digits) {
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

export function validateCard(card) {
  const errors = {}
  const digits = card.number.replace(/\s+/g, '')

  if (!card.holder.trim() || card.holder.trim().length < 3) {
    errors.holder = 'Ingresa el nombre tal como aparece en la tarjeta'
  }

  if (!/^\d{16}$/.test(digits) || !luhnCheck(digits)) {
    errors.number = 'Número de tarjeta inválido'
  }

  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
    errors.expiry = 'Usa el formato MM/AA'
  } else {
    const [month, year] = card.expiry.split('/').map(Number)
    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1
    if (month < 1 || month > 12) {
      errors.expiry = 'Mes inválido'
    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.expiry = 'La tarjeta está vencida'
    }
  }

  if (!/^\d{3,4}$/.test(card.cvv)) {
    errors.cvv = 'CVV inválido'
  }

  return errors
}

// Simulates contacting the payment gateway: a short delay, then approve or
// decline. Use 4000 0000 0000 0002 to test the declined path.
export function simulateCharge(card) {
  const digits = card.number.replace(/\s+/g, '')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(digits === DECLINE_TEST_NUMBER ? 'declined' : 'approved')
    }, 1200)
  })
}
