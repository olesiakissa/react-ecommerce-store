import React from 'react';
import ProductCard from './ProductCard';
import { capitalize } from '../utils/StringUtils';

export default class ProductsList extends React.Component {

  render() {
    const products = this.props.products.map(
        product => <ProductCard key={product.id} 
                                {...product} 
                                currentCurrency={this.props.currentCurrency}
                                addToCart={this.props.addToCart}/>)                           
    return (
      <>
      <h1 className='category-heading'>
        { capitalize(this.props.heading) }
      </h1>
      <div className='products-container'>
        {products}
      </div>
      </>
    )
  }
}
