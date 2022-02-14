import React from 'react';

export default class ProductCard extends React.Component {
  
  render() {
    const filteredPrice = this.props.prices.find(
      price => price.currency.symbol === this.props.currentCurrency).amount;
    return (
      <div className='product-card'>
      <img src={this.props.gallery[0]} alt={this.props.name} />
      <h2 className='product-name'>{this.props.name}</h2>
      <div className='flex product-cta'>
        <p className='product-price'>{`${this.props.currentCurrency}${filteredPrice}`}</p>
        <button aria-label='Add to cart'
                className='product-card-btn-addToCart'
                onClick={(e)=>this.props.addToCart(e, this.props)}>
        </button>
      </div>
      </div>
    )
  }
}