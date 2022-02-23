import React from 'react';
import CartPageItem from './CartPageItem';
import { truncateNumberToTwoDecimals } from '../../utils/StringUtils';

export default class CartPage extends React.Component {

  componentDidMount() {
    this.loadTotalPriceOnPageReload();
  }

  loadTotalPriceOnPageReload() {
      document.querySelector('.total-price-holder').innerText = 
      this.props.totalPrice ? 
      truncateNumberToTwoDecimals(this.props.totalPrice) :
      truncateNumberToTwoDecimals(JSON.parse(localStorage.getItem("totalPrice")))
  }

  render() {
    return (
      <div className='cart-container flex'>
        <h1 className='cart-heading'>CART</h1>
        <div className='cart-items-container flex'>
          {this.props.cartItems.map(item => (
            <CartPageItem key={item.id} 
                          item={item}
                          updateTotalPrice={this.props.updateTotalPrice}
                          addToCart={this.props.addToCart}
                          removeFromCart={this.props.removeFromCart}
                          currentCurrency={this.props.currentCurrency}
                          selectProductAttributes={this.props.selectProductAttributes}
                          />
          )
          )}
            <div className='flex total-price'>
            <h2 className='total-price-heading'>
              Total
            </h2>
            <p className='total-price-holder'></p>
          </div>
        </div>
      </div>
    )
  }
}