import React from 'react';
import { replaceSpaceWithDash } from '../../utils/StringUtils';

export default class CartModalItem extends React.Component {

  constructor() {
    super();
    this.setProductSelectedAttributes = this.setProductSelectedAttributes.bind(this);
  }

  componentDidMount() {
    if (this.props.item.selectedAttributes) {
      this.setProductSelectedAttributes();
    }
  }

  /**
   * Highlights the product attributes that were selected 
   * by user before it was added to the cart.
   */
  setProductSelectedAttributes() {
    const selectedAttributes = this.props.item.selectedAttributes;
    const attributesContainers = this.getAttributesContainers(selectedAttributes);

    // TODO Fix attributes selection
    // (only the first one is selected currently)
    for (let i = 0; i < attributesContainers.length; i++) {
      this.setActiveAttribute(
        Array.from(attributesContainers[i].children), 
        selectedAttributes);
    }
  }

  getAttributesContainers(selectedAttributes) {
    const attributesContainers = [];
    Object.keys(selectedAttributes).forEach(
      attrName => {
        const containers = 
        document.querySelectorAll(`.pdp-attr-buttons#${replaceSpaceWithDash(attrName)}`);
        for (let i = 0; i < containers.length; i++) {
          /**
           * This check is needed to make sure that we don't select
           * divs that don't contain our current props item.
           * If omitted, all divs in cart modal with the specified
           * selector are selected and the logic of highlighting the 
           * attributes is breaking.
           */
          if (Array.from(containers[i].classList).some(
            className => className.includes(selectedAttributes[attrName]))) {
            attributesContainers.push(containers[i]);     
            }
          }
        });
    return attributesContainers;
  }

  setActiveAttribute(buttons, selectedAttributes) {
    buttons.forEach(button => {
      button.classList.remove('selected');
      if(selectedAttributes.hasOwnProperty(button.parentNode.id)){
        if(button.innerText === selectedAttributes[button.parentNode.id] ||
          button.id === selectedAttributes[button.parentNode.id]) {
            button.classList.add('selected');
        }
      }
    });
  }

  render() {
    const currentItemPrice = this.props.item.prices.find(
      price => price.currency.symbol === this.props.currentCurrency).amount;
    return (
      <div className='cart-modal-item flex'>
        <div className='modal-item-description flex'>
          <div className="modal-item-header-wrapper">
            <h2 className='modal-item-heading'>{this.props.item.name}</h2>
            <p className='modal-item-price'>{`${this.props.currentCurrency}${currentItemPrice}`}</p>
          </div>
          <div className='modal-item-attributes flex'>
            {this.props.item.attributes.length > 0 && 
              this.props.item.attributes.map(attribute => {
              if (attribute.name === 'Color') {
                return (
                  <div className='pdp-attributes pdp-colors-container'>
                    <div className={`${this.props.item.id} color-swatches pdp-attr-buttons flex`}
                        id={attribute.name}>
                          {attribute.items.map(color => 
                            <button aria-label={color.displayValue}
                                    style={{backgroundColor: `${color.value}`}}
                                    className='btn-cart-modal pdp-color-swatch'
                                    id={color.id}>
                            </button>)
                          }
                    </div>
                  </div>)
                } else {
                  return (
                    <div className='pdp-attributes pdp-container'>
                      <div className={`${this.props.item.id} pdp-attr-buttons flex`}
                           id={replaceSpaceWithDash(attribute.name)}>
                              {attribute.items.map(item => 
                                <button className='btn-cart-modal'
                                        disabled>
                                    {item.value}
                                </button>
                              )}
                      </div>
                    </div>
                  )
                }
              })}
              </div>
            </div>
        <div className='cart-modal-buttons flex'>
          <button aria-label='Increase item quantity'
                  onClick={(e) => this.props.addToCart(e, this.props.item)}
                  className='btn-cart-modal btn-modal-increase flex'>
                  +
          </button>
          <p className='cart-modal-item-amount'>{this.props.item.amount}</p>
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