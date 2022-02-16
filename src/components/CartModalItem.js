import React from 'react';

export default class CartModalItem extends React.Component {
  render(){
    const currentItemPrice = this.props.item.prices.find(
      price => price.currency.symbol === this.props.currentCurrency).amount;
    return (
      <div className='cart-modal-item flex'>
        <div className='modal-item-description flex'>
          <h2 className='modal-item-heading'>{this.props.item.name}</h2>
          <p className='modal-item-price'>{`${this.props.currentCurrency}${currentItemPrice}`}</p>
          <div className='modal-item-attributes'>tba</div>
        </div>
        <div className='cart-modal-buttons flex'>
          <button aria-label='Increase item quantity'
                  onClick={() => this.props.addToCart(this.props.item)}
                  className='btn-cart-modal btn-modal-increase flex'>
                  +
          </button>
          <p>{this.props.item.amount}</p>
          <button aria-label='Decrease item quantity'
                  onClick={() => this.props.removeFromCart(this.props.item)}
                  className='btn-cart-modal btn-modal-decrease flex'>
                  -
          </button>
        </div>
        <img src={this.props.item.gallery[0]} 
             alt={this.props.item.name}
             className='cart-modal-img' />
      </div>
    )
  }
}