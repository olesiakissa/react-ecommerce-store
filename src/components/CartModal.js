import React from 'react';
import { Link } from 'react-router-dom';
import { truncateNumberToTwoDecimals } from '../utils/StringUtils';
import CartModalItem from './CartModalItem';

export default class CartModal extends React.Component {

  /**
   * Checks if all attributes in all products are selected.
   * Blocks the user from viewing the bag if one of the attributes is missing
   * and shows a warning.
   * @param {*} e Event fired by clicking on one of the cart modal buttons
   */
  validateProductAttributes(e) {
    const isAllAttributesSelected = this.checkAllItemsHaveSelectedAttributes();
    if (!isAllAttributesSelected) {
      this.checkAttributesShowWarning(e);
    } else {
      this.props.toggleCartModal();
    }
  }

  /**
   * Check whether each cart item has its attributes selected.
   * 
   * @returns {boolean} if at least one attribute inside of the item wasn't selected
   * so the user can't proceed to the cart page.
   */
  checkAllItemsHaveSelectedAttributes() {
    const itemsAttributes = Array.from(document.querySelectorAll('.modal-item-attributes'));
    const allItemsHaveSelectedAttributes = itemsAttributes.every(
      cardItem => Array.from(cardItem.children).some(
        buttonElement => buttonElement.classList.contains('selected')))
    return allItemsHaveSelectedAttributes;
  }

  checkAttributesShowWarning(e) {
    e.preventDefault();
    document.querySelector('.check-alert').style.display = 'block';
  }

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
                         selectProductAttributes={this.props.selectProductAttributes}
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
        <div className='check-alert' role='alert'>Please, select all products attributes</div>
        <div className='cart-modal-links flex'> 
          <Link to={'/cart'} 
                className='cart-modal-link link-view-bag'
                onClick={ e => this.validateProductAttributes(e) }>
                View bag
          </Link>
          <Link to={'/'} 
                className='cart-modal-link link-checkout'
                onClick={ e => this.validateProductAttributes(e) }>
                Check out
          </Link>
        </div>
      </>
      }
     </div>
    )
  }
}