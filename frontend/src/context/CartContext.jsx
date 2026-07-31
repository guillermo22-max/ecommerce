import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as cartApi from '../api/cart'
import { AuthContext } from './AuthContext'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext)
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null)
      return
    }
    setLoading(true)
    try {
      const data = await cartApi.getCart()
      setCart(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = useCallback(async (productId, quantity = 1) => {
    const data = await cartApi.addCartItem({ productId, quantity })
    setCart(data)
  }, [])

  const updateItem = useCallback(async (productId, quantity) => {
    const data = await cartApi.updateCartItem({ productId, quantity })
    setCart(data)
  }, [])

  const removeItem = useCallback(async (productId) => {
    const data = await cartApi.removeCartItem(productId)
    setCart(data)
  }, [])

  const itemCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart],
  )

  const total = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity * Number(item.product.price), 0) ?? 0,
    [cart],
  )

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, total, refresh, addItem, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  )
}
