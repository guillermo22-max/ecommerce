import { ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { checkout } from '../api/orders'
import { Button } from '../components/ui/Button'
import { InputField } from '../components/ui/InputField'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../lib/format'
import { formatCardNumber, formatExpiry, simulateCharge, validateCard } from '../lib/payment'
import { validateAddress } from '../lib/validateAddress'

const initialAddress = {
  full_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
}

const initialCard = { holder: '', number: '', expiry: '', cvv: '' }

const STEPS = [
  { key: 'shipping', label: 'Envío' },
  { key: 'payment', label: 'Pago' },
]

function StepIndicator({ step }) {
  const activeIndex = STEPS.findIndex((s) => s.key === step)
  return (
    <ol className="flex items-center gap-3 text-sm font-medium text-slate-500">
      {STEPS.map((s, index) => (
        <li key={s.key} className="flex items-center gap-3">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              index <= activeIndex ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {index + 1}
          </span>
          <span className={index <= activeIndex ? 'text-slate-900' : ''}>{s.label}</span>
          {index < STEPS.length - 1 && <span className="h-px w-8 bg-slate-200" />}
        </li>
      ))}
    </ol>
  )
}

export function CheckoutPage() {
  const { cart, total, refresh } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState('shipping')
  const [address, setAddress] = useState(initialAddress)
  const [addressErrors, setAddressErrors] = useState({})

  const [card, setCard] = useState(initialCard)
  const [cardErrors, setCardErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  function handleAddressChange(event) {
    const { name, value } = event.target
    setAddress((prev) => ({ ...prev, [name]: value }))
    setAddressErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleContinueToPayment(event) {
    event.preventDefault()
    const errors = validateAddress(address)
    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors)
      return
    }
    setStep('payment')
  }

  function handleCardChange(event) {
    const { name, value } = event.target
    const formatted =
      name === 'number' ? formatCardNumber(value) : name === 'expiry' ? formatExpiry(value) : value
    setCard((prev) => ({ ...prev, [name]: formatted }))
    setCardErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handlePay(event) {
    event.preventDefault()
    setError('')

    const errors = validateCard(card)
    if (Object.keys(errors).length > 0) {
      setCardErrors(errors)
      return
    }

    setPaying(true)
    try {
      const outcome = await simulateCharge(card)
      if (outcome === 'declined') {
        setError('Tu pago fue rechazado. Verifica los datos de tu tarjeta o intenta con otra.')
        return
      }

      const order = await checkout({
        shippingAddress: { ...address, country: address.country.trim().toUpperCase() },
      })
      await refresh()
      navigate(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar el pedido.')
    } finally {
      setPaying(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return <p className="py-12 text-center text-slate-600">Tu carrito está vacío.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <StepIndicator step={step} />

      <div className="grid gap-8 md:grid-cols-2">
        {step === 'shipping' ? (
          <form onSubmit={handleContinueToPayment} noValidate className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Dirección de envío</h1>

            <InputField
              id="full_name"
              name="full_name"
              label="Nombre completo"
              value={address.full_name}
              onChange={handleAddressChange}
              error={addressErrors.full_name}
              required
            />
            <InputField
              id="phone"
              name="phone"
              label="Teléfono"
              value={address.phone}
              onChange={handleAddressChange}
              error={addressErrors.phone}
            />
            <InputField
              id="line1"
              name="line1"
              label="Dirección"
              value={address.line1}
              onChange={handleAddressChange}
              error={addressErrors.line1}
              required
            />
            <InputField
              id="line2"
              name="line2"
              label="Dirección (línea 2)"
              value={address.line2}
              onChange={handleAddressChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="city"
                name="city"
                label="Ciudad"
                value={address.city}
                onChange={handleAddressChange}
                error={addressErrors.city}
                required
              />
              <InputField
                id="state"
                name="state"
                label="Estado"
                value={address.state}
                onChange={handleAddressChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="postal_code"
                name="postal_code"
                label="Código postal"
                value={address.postal_code}
                onChange={handleAddressChange}
                error={addressErrors.postal_code}
                required
              />
              <InputField
                id="country"
                name="country"
                label="País (código, ej. MX)"
                value={address.country}
                onChange={handleAddressChange}
                error={addressErrors.country}
                maxLength={2}
                required
              />
            </div>

            <Button type="submit" className="mt-2 w-fit">
              Continuar al pago
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePay} noValidate className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep('shipping')}
              className="flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a envío
            </button>

            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <CreditCard className="h-6 w-6 text-indigo-600" />
              Pago
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Pasarela simulada: no se procesa ningún cargo real.
            </p>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <InputField
              id="holder"
              name="holder"
              label="Nombre en la tarjeta"
              value={card.holder}
              onChange={handleCardChange}
              error={cardErrors.holder}
              required
            />
            <InputField
              id="number"
              name="number"
              label="Número de tarjeta"
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              value={card.number}
              onChange={handleCardChange}
              error={cardErrors.number}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="expiry"
                name="expiry"
                label="Vencimiento (MM/AA)"
                placeholder="MM/AA"
                inputMode="numeric"
                value={card.expiry}
                onChange={handleCardChange}
                error={cardErrors.expiry}
                required
              />
              <InputField
                id="cvv"
                name="cvv"
                label="CVV"
                placeholder="123"
                inputMode="numeric"
                maxLength={4}
                value={card.cvv}
                onChange={handleCardChange}
                error={cardErrors.cvv}
                required
              />
            </div>

            <Button type="submit" disabled={paying} className="mt-2 w-fit">
              {paying ? 'Procesando pago...' : `Pagar ${formatCurrency(total)}`}
            </Button>
          </form>
        )}

        <div className="flex h-fit flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Resumen del pedido</h2>
          <div className="flex flex-col gap-2 divide-y divide-slate-100">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 text-sm">
                <span className="text-slate-700">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(item.quantity * item.product.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span className="text-indigo-600">{formatCurrency(total)}</span>
          </div>
          {step === 'payment' && (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tus datos de pago no se almacenan.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
