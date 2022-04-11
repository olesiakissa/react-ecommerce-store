import React from 'react';
import arrowLeft from '../../static/arrow-left.svg';
import arrowRight from '../../static/arrow-right.svg';
import { replaceSpaceWithDash } from '../../utils/StringUtils';
import { convertArrayToObject } from '../../utils/DataUtils';

export default class CartPageItem extends React.Component {

  constructor() {
    super();
    this.handleItemGallery = this.handleItemGallery.bind(this);
    this.showNextImage = this.showNextImage.bind(this);
    this.showPrevImage = this.showPrevImage.bind(this);
    this.setProductSelectedAttributes = this.setProductSelectedAttributes.bind(this);
    this.state = {
      imgIndex: 0
    }
    this.cartPageItemContainsProductQuantity = 
      this.cartPageItemContainsProductQuantity.bind(this);
    this.cartPageItemClasslistContainsAttributeName = 
      this.cartPageItemClasslistContainsAttributeName.bind(this);
  }

  componentDidMount() {
    this.handleItemGallery();
    if (this.props.item.selectedAttributes) {
      this.setProductSelectedAttributes();
    }
  }

  componentDidUpdate() {
    this.handleItemGallery();
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

    for (let i = 0; i < Object.entries(selectedAttributes).length; i++) {
      this.setActiveAttribute(
        Array.from((Array.from(attributesContainers)[i]).children), 
        convertArrayToObject(Object.entries(selectedAttributes)[i]));
    }
  }

  getAttributesContainers(selectedAttributes) {
    const attributesContainers = [];
    Object.keys(selectedAttributes).forEach(
      attrName => {
        const containers = 
        document.querySelectorAll(`.${replaceSpaceWithDash(attrName)}`);

        for (let i = 0; i < containers.length; i++) {
          const closestButtons = 
          containers[i].closest('.item-details') ? 
          Array.from(containers[i].closest('.item-details').children).find(
            item => item.classList.contains('item-buttons')) :
            null;
         /**
         * This check is needed to make sure that we don't select
         * divs that don't contain our current props item.
         * If omitted, all divs in cart modal with the specified
         * selector are selected and the logic of highlighting the 
         * attributes is breaking.
         */
          if (this.props.cartProductIdContainsCurrentProductId(
              containers[i], selectedAttributes) &&
              this.cartPageItemClasslistContainsAttributeName(containers[i], attrName) &&
              this.cartPageItemContainsProductQuantity(closestButtons)) {
                attributesContainers.push(containers[i]);
          } 
        }
      });
    return attributesContainers;
  }

  cartPageItemClasslistContainsAttributeName(container, attrName) {
    return container.classList.contains(replaceSpaceWithDash(attrName));
  }

  cartPageItemContainsProductQuantity(closestButtons) {
    return closestButtons ? Array.from(closestButtons.children).find(
      child => child.classList.contains('cart-page-item-amount'))
      .innerText.includes(this.props.item.amount) : false;
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

  handleItemGallery() {
    const arrowLeft = document.querySelector(`.gallery-arrow-left.${this.props.item.id}`);
    const arrowRight = document.querySelector(`.gallery-arrow-right.${this.props.item.id}`);

    const gallery = this.props.item.gallery;
    
    arrowLeft.addEventListener('click', function() {
      this.showPrevImage(gallery);
    }.bind(this));

    arrowRight.addEventListener('click', function() {
      this.showNextImage(gallery);
    }.bind(this));
  }

  showNextImage(gallery) {
    if (this.state.imgIndex >= gallery.length - 1) {
      this.setState({
        imgIndex: 0
      })
    } else {
      this.setState(prevState => (
        {
          imgIndex: prevState.imgIndex + 1
        }
      ))
    }
  }

  showPrevImage(gallery) {
    if (this.state.imgIndex <= 0) {
      this.setState({
        imgIndex: gallery.length - 1
      })
    } else {
      this.setState(prevState => (
        {
          imgIndex: prevState.imgIndex - 1
        }
      ))
    }
  }

  render() {
    const currentItemPrice = this.props.item.prices.find(
      price => price.currency.symbol === this.props.currentCurrency).amount;
    return (
      <div className='cart-item-card'>
        <div className='item-gallery flex'>
          <img src={arrowLeft} 
                  alt="Arrow left" 
                  className={`gallery-arrow gallery-arrow-left ${this.props.item.id}`}
                  id='arrowLeft'/>
          <img src={this.props.item.gallery[this.state.imgIndex]} 
               alt={this.props.item.name}
               className='item-img-highlight'
               id={this.props.item.id} />
          <img src={arrowRight} 
              alt="Arrow right" 
              className={`gallery-arrow gallery-arrow-right ${this.props.item.id}`}
              id='arrowRight'/>
        </div>
        <div className='item-details'>
          <div className='item-buttons flex'>
            <button aria-label='Decrease item quantity'
                    onClick={() => this.props.removeFromCart(this.props.item)}
                    className='btn-cart-modal btn-modal-decrease flex'>
                    -
            </button>
            <p className='cart-page-item-amount'>{this.props.item.amount}</p>
            <button aria-label='Increase item quantity'
                    onClick={(e) => this.props.addToCart(e, this.props.item)}
                    className='btn-cart-modal btn-modal-increase flex'>
                    +
            </button>
          </div>
          <div className='item-selection'>
            <h2 className='item-heading'>{this.props.item.name}</h2>
            <p className='item-price'>
              {`${this.props.currentCurrency}${currentItemPrice}`}
            </p>
            {this.props.item.attributes.length > 0 && 
              this.props.item.attributes.map(attribute => {
                if (attribute.name === 'Color') {
                return (
                <div className='pdp-attributes pdp-colors-container'>
                  <div className={`${this.props.item.id} ${replaceSpaceWithDash(attribute.name)} color-swatches pdp-attr-buttons flex`}
                      id={this.props.item.id}>
                    {
                      attribute.items.map(color => 
                      <button aria-label={color.displayValue}
                              style={{backgroundColor: `${color.value}`}}
                              className='pdp-button pdp-color-swatch btn-cart-page'
                              id={color.id}>
                      </button>)
                    }
                  </div>
              </div>)
              } else {
                return (
                    <div className='pdp-attributes pdp-container'>
                    <div className={`${this.props.item.id} ${replaceSpaceWithDash(attribute.name)} pdp-attr-buttons flex`}
                        id={this.props.item.id}>
                          {attribute.items.map(item => 
                          <button className='pdp-button btn-cart-page'>
                              {item.value}
                          </button>)}
                    </div>
                  </div> 
                )
              }
            })}  
          </div>
        </div>
      </div>
    )
  }
}