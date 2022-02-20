import React from 'react';

export default class ProductDescriptionPage extends React.Component {

  componentDidMount() {
    document.querySelector('.pdp-description').innerHTML = this.props.product.description;
  }

  /**
   * Check whether all product's attributes are selected.
   * 
   * @returns {boolean} if at least one attribute inside of the item wasn't selected
   * (if any exist) the user can't add the item to the cart.
   */
  checkAllAttributesAreSelected() {
    const itemAttributes = Array.from(document.querySelectorAll('.pdp-attributes .pdp-attr-buttons'));
    const allAttributesAreSelected = itemAttributes.every(
      attrContainer => Array.from(attrContainer.children).some(
      button => button.classList.contains('selected')))
      return allAttributesAreSelected;
  }

  toggleAlertCheckAttributes(attributesAreChecked) {
    document.querySelector('.check-attr-alert').style.display = 
    attributesAreChecked === false ? 'block' : 'none';
  }

  render() {
    const currentItemPrice = this.props.product.prices.find(
      price => price.currency.symbol === this.props.currentCurrency).amount;
    return (
      <div className={`pdp-product-container flex`}>
        <img src={this.props.product.gallery[0]} 
            alt={this.props.product.name}
            className='pdp-image' />
      <h1 className="pdp-product-name">{this.props.product.name}</h1>
      <div className='check-alert' 
      style={{display: !this.props.product.inStock ? 'block' : 'none'}}>
        Currently unavailable for purchase
      </div>
      {this.props.product.attributes.length > 0 && 
      this.props.product.attributes.map(attribute => {
        if (attribute.name === 'Color') {
          return (<div className='pdp-attributes pdp-colors-container'>
          <h2 className='attr-name'>{attribute.name}:</h2>
          <div className='color-swatches pdp-attr-buttons flex'>
            {
              attribute.items.map(color => 
              <button aria-label={color.displayValue}
                      style={{backgroundColor: `${color.value}`}}
                      className='pdp-color-swatch'
                      id={color.id}
                      onClick={(e) => 
                      this.props.selectProductAttributes(e, 
                                                         attribute.name, 
                                                         this.props.product)}>
              </button>)
            }
          </div>
        </div>)
        } else if (attribute.name === 'Capacity') {
          return (
            <div className='pdp-attributes pdp-capacity-container'>
              <h2 className='attr-name'>{attribute.name}:</h2>
              <div className='capacity pdp-attr-buttons flex'>
              {attribute.items.map(capacity => 
              <button className='pdp-button pdp-capacity'
              onClick={(e) => 
              this.props.selectProductAttributes(e, 
                                                 attribute.name,
                                                 this.props.product)}>
                  {capacity.value}
              </button>
              )}
              </div>
            </div>
          )
        } else if (attribute.name === 'Size') {
          return (
            <div className='pdp-attributes pdp-sizes-container'>
              <h2 className='attr-name'>{attribute.name}:</h2>
              <div className='sizes pdp-attr-buttons flex'>
              {attribute.items.map(size => 
              <button className='pdp-button pdp-size'
              onClick={(e) => 
              this.props.selectProductAttributes(e, 
                                                 attribute.name,
                                                 this.props.product)}>
                  {size.value}
              </button>)}
              </div>
            </div>            
          )
        }
      })}
      <div className='pdp-price-container'>
        <h2 className='pdp-price'>Price:</h2>
        <p>{`${this.props.currentCurrency}${currentItemPrice}`}</p>
      </div>
      <div className='check-attr-alert' role='alert'>
        Please, select all product attributes
      </div>
      <button className='pdp-btn-addToCart'
              onClick={() => {
                const allAttributesAreSelected = this.checkAllAttributesAreSelected();
                if (allAttributesAreSelected) {
                  this.toggleAlertCheckAttributes(allAttributesAreSelected);
                  this.props.addToCart(this.props.product)
                } else {
                  this.toggleAlertCheckAttributes(allAttributesAreSelected);
                }
                }}
              disabled={!this.props.product.inStock ? true : false}>Add to cart</button>
      <div className='pdp-description'>
      </div>   
      </div>
    )
  }
}