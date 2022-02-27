import React from 'react';
import { Link } from 'react-router-dom';

export default class ProductCard extends React.Component {
  
  render() {
    const filteredPrice = this.props.prices.find(
      price => price.currency.symbol === this.props.currentCurrency).amount;
    return (
      <div className={`product-card ${!this.props.inStock && 'out-of-stock'}`}>
        <Link aria-labelledby={`name${this.props.id}`}
              to={`details/${this.props.id}`}
              onClick={() => this.props.showProductDetails(this.props.id)}
              style={{textDecoration: 'none'}}>
          <img src={this.props.gallery[0]} className='product-thumbnail' alt={this.props.name} />
          <div className='out-of-stock-text' 
               style={{display: `${!this.props.inStock ? 'block' : 'none'}`}}>
            OUT OF STOCK
          </div>
          <h2 className='product-name'
              id={`name${this.props.id}`}>
              {this.props.name}
              <span className='sr-only'>View details</span>
          </h2>
          <div className='flex product-cta'>
            <p className='product-price'>{`${this.props.currentCurrency}${filteredPrice}`}</p>
            <button aria-label={`Add ${this.props.name} to cart`}
                    className='product-card-btn-addToCart'
                    disabled={!this.props.inStock && true}
                    onClick={(e) => {this.props.addToCart(e, this.props)}}>
            </button>
          </div>
        </Link>
      </div>
    )
  }
}
