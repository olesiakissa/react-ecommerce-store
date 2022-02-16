import React from 'react';
import { Link } from 'react-router-dom';
import { truncateNumberToTwoDecimals } from '../utils/StringUtils';
import CartModalItem from './CartModalItem';

export default class CartModal extends React.Component {
  render() {
    return (
     <div className='cart-modal flex' style={{top: `${this.props.offsetHeight}px`}}>
      <div className='cart-modal-title flex'>
      
      {this.props.cartItems.length > 0 ?
      <>
        <h2 className='cart-modal-heading'>My Bag</h2>
        <p>{`, ${this.props.cartItems.length} item${this.props.cartItems.length > 1 ? 's' : ''}`}</p>
      </>
        : <div className='cart-modal-empty'>Your cart is empty</div>}
        </div>
      
      {this.props.cartItems.length > 0 &&
      <>
        <div className='cart-modal-items flex'>
          {this.props.cartItems.map(item => 
          <CartModalItem key={item.id}
                         item={item}
                         addToCart={this.props.addToCart}
                         removeFromCart={this.props.removeFromCart}
                         currentCurrency={this.props.currentCurrency}
          />)}
        </div>
        <div className='flex total-price'>
          <h2 className='cart-modal-heading modal-heading-total'>
            Total
          </h2>
          <p className='cart-modal-heading modal-total-price'>
            {truncateNumberToTwoDecimals(this.props.totalPrice)}
          </p>
        </div>
        <div className='cart-modal-links flex'> 
          <Link to={'/cart'}>View bag</Link>
          <Link to={'/'}>Check out</Link>
        </div>
      </>
      }
     </div>
    )
  }
}