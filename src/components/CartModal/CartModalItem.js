import React from 'react';
import { convertArrayToObject, 
         convertArrayToStringEntry } from '../../utils/DataUtils';
import { replaceSpaceWithDash } from '../../utils/StringUtils';

export default class CartModalItem extends React.Component {

  constructor() {
    super();
    this.setProductSelectedAttributes = this.setProductSelectedAttributes.bind(this);
    this.cartModalItemContainsProductQuantity = 
      this.cartModalItemContainsProductQuantity.bind(this);
    this.cartModalItemContainsCurrentProductId = 
     this.cartModalItemContainsCurrentProductId.bind(this);
    this.cartModalItemClasslistContainsAttributeName = 
     this.cartModalItemClasslistContainsAttributeName.bind(this);
  }

  componentDidMount() {
    if (this.props.item.selectedAttributes) {
      this.setProductSelectedAttributes();
    }
  }

  componentDidUpdate() {
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

    for (let attrIndex = 0; attrIndex < Object.entries(selectedAttributes).length; attrIndex++) {
        this.setActiveAttribute(
          Array.from((Array.from(attributesContainers)[attrIndex]).children), 
          convertArrayToObject(Object.entries(selectedAttributes)[attrIndex]));
    }
  }

  getAttributesContainers(selectedAttributes) {
    const attributesContainers = [];
    Object.keys(selectedAttributes).forEach(
      attrName => {
        const containers = 
          document.querySelectorAll(`.${replaceSpaceWithDash(attrName)}`);

          for (let i = 0; i < containers.length; i++) {
            const closestModalButtons = 
            Array.from(containers[i].closest('.cart-modal-item').children).find(
              item => item.classList.contains('cart-modal-buttons'));
          /**
           * This check is needed to make sure that we don't select
           * divs that don't contain our current props item.
           * If omitted, all divs in cart modal with the specified
           * selector are selected and the logic of highlighting the 
           * attributes is breaking.
           */
            if (this.cartModalItemContainsCurrentProductId(containers[i], selectedAttributes) &&
                this.cartModalItemClasslistContainsAttributeName(containers[i], attrName) &&
                this.cartModalItemContainsProductQuantity(closestModalButtons)) {
                  attributesContainers.push(containers[i]);
            } 
          }

        });
    return attributesContainers;
  }

  cartModalItemContainsCurrentProductId(modalContainer, selectedAttributes) {
    const containsValuesFlagsArray = [];

    Object.entries(selectedAttributes).forEach(entry => {
      containsValuesFlagsArray.push((
        modalContainer.id.includes(convertArrayToStringEntry(entry)) ? true : false
      ));
    });

    return containsValuesFlagsArray.every(flag => flag === true);
  }

  cartModalItemClasslistContainsAttributeName(modalContainer, attrName) {
    return modalContainer.classList.contains(replaceSpaceWithDash(attrName));
  }

  cartModalItemContainsProductQuantity(closestModalButtons) {
    return Array.from(closestModalButtons.children).find(
             child => child.classList.contains('cart-modal-item-amount'))
             .innerText.includes(this.props.item.amount);
  }

  setActiveAttribute(buttons, selectedAttributes) {
    buttons.forEach(button => {
      button.classList.remove('selected'); 
      
      const attributeKeyName = Object.keys(selectedAttributes)[0];
      if(button.innerText === selectedAttributes[attributeKeyName] ||
        button.id === selectedAttributes[attributeKeyName]) {
          button.classList.add('selected');
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
                    <div className=
                    {`${this.props.item.id} ${replaceSpaceWithDash(attribute.name)} color-swatches pdp-attr-buttons flex`}
                         id={this.props.item.id}> 
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
                      <div className=
                      {`${this.props.item.id} ${replaceSpaceWithDash(attribute.name)} pdp-attr-buttons flex`}
                           id={this.props.item.id}>
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