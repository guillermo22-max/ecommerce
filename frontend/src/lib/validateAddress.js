const PHONE_PATTERN = /^[0-9+\-()\s]{7,20}$/
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9\-\s]{3,10}$/
const COUNTRY_PATTERN = /^[A-Za-z]{2}$/

export function validateAddress(address) {
  const errors = {}

  if (!address.full_name.trim() || address.full_name.trim().length < 2) {
    errors.full_name = 'Ingresa un nombre válido (mínimo 2 caracteres)'
  }
  if (address.phone.trim() && !PHONE_PATTERN.test(address.phone.trim())) {
    errors.phone = 'Ingresa un teléfono válido (7 a 20 dígitos)'
  }
  if (!address.line1.trim() || address.line1.trim().length < 5) {
    errors.line1 = 'Ingresa una dirección válida (mínimo 5 caracteres)'
  }
  if (!address.city.trim() || address.city.trim().length < 2) {
    errors.city = 'Ingresa una ciudad válida'
  }
  if (!POSTAL_CODE_PATTERN.test(address.postal_code.trim())) {
    errors.postal_code = 'Ingresa un código postal válido'
  }
  if (!COUNTRY_PATTERN.test(address.country.trim())) {
    errors.country = 'Usa el código de país de 2 letras (ej. MX, US)'
  }

  return errors
}
