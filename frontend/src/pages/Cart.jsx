import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  const updateQuantity = (_id, change) => {
    const updatedCart = cartItems
      .map((item) =>
        item._id === _id
          ? { ...item, cartQuantity: item.cartQuantity + change }
          : item
      )
      .filter((item) => item.cartQuantity > 0);

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.cartQuantity,
    0
  );

  if (cartItems.length === 0) {
    return <p className="page-message">Your cart is empty.</p>;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-title">My Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => {
              const imageUrl =
                item.image && item.image.startsWith('http')
                  ? item.image
                  : 'https://via.placeholder.com/300x200?text=Auto+Part';

              return (
                <div className="cart-item" key={item._id}>
                  <img src={imageUrl} alt={item.name} className="cart-item-image" />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>Ref: {item.reference || 'N/A'}</p>
                    <p className="cart-item-price">€{Number(item.price).toFixed(2)}</p>
                  </div>

                  <div className="cart-quantity">
                    <button onClick={() => updateQuantity(item._id, -1)}>-</button>
                    <span>{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <p>Total Items: {cartItems.reduce((sum, item) => sum + item.cartQuantity, 0)}</p>
            <p className="cart-total">Total Price: €{totalPrice.toFixed(2)}</p>
            <button
              className="primary-btn full-width"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;