import React from 'react';
import CartPageItem from './CartPageItem';
import { truncateNumberToTwoDecimals } from '../../utils/StringUtils';

export default class CartPage extends React.Component {
  render() {
    return (
      <div className='cart-container flex'>
        <h1 className='cart-heading'>CART</h1>
        {this.props.cartItems.length <= 0 && 
        <h2 className='cart-heading'>Your cart is empty</h2>}            
        <div className='cart-items-container flex'>
          {this.props.cartItems.length > 0 && 
            this.props.cartItems.map(item => (
              <CartPageItem key={item.id}
                            item={item}
                            updateTotalPrice={this.props.updateTotalPrice}
                            cartProductIdContainsCurrentProductId={
                              this.props.cartProductIdContainsCurrentProductId
                            }
                            addToCart={this.props.addToCart}
                            removeFromCart={this.props.removeFromCart}
                            currentCurrency={this.props.currentCurrency}
                            />))}
            {this.props.cartItems.length > 0 && 
              <div className='flex total-price'>
                <h2 className='total-price-heading'>
                  Total
                </h2>
                <p className='total-price-holder'>
                  {`${this.props.currentCurrency}${truncateNumberToTwoDecimals(this.props.totalPrice)}`}
                </p>
              </div>}
         </div> 
      </div>                
    )
  }
}