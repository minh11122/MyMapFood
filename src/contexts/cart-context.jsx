import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext(undefined)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem("cart")
    return savedCart ? JSON.parse(savedCart) : []
  })

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items))
  }, [items])

  const addToCart = (item) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id)
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId) => {
    setItems((prevItems) => prevItems.filter((item) => item._id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const finalPrice = item.discount 
        ? item.price * (1 - item.discount / 100) 
        : item.price
      return total + finalPrice * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const isInCart = (itemId) => {
    return items.some((item) => item._id === itemId)
  }

  const getItemQuantity = (itemId) => {
    const item = items.find((i) => i._id === itemId)
    return item ? item.quantity : 0
  }

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}