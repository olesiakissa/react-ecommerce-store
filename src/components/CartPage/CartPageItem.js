import React from 'react';
import arrowLeft from '../../static/arrow-left.svg';
import arrowRight from '../../static/arrow-right.svg';
import { replaceSpaceWithDash } from '../../utils/StringUtils';

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
  }

  componentDidMount() {
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
        const containers = document.querySelectorAll(`.pdp-attr-buttons#${attrName}`);
        Array.from(containers).forEach(container => {
          /**
           * This check is needed to make sure that we don't select
           * divs that don't contain our current props item.
           * If omitted, all divs in cart modal with the specified
           * selector are selected and the logic of highlighting the 
           * attributes is breaking.
           */
            if (container.closest('.item-selection').innerText.includes(this.props.item.name)) {
              attributesContainers.push(container);
            }
          }
        )
      }
      );
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
            <p>{this.props.item.amount}</p>
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
                return (<div className='pdp-attributes pdp-colors-container'>
                <div className='color-swatches pdp-attr-buttons flex'
                    id={attribute.name}>
                  {
                    attribute.items.map(color => 
                    <button aria-label={color.displayValue}
                            style={{backgroundColor: `${color.value}`}}
                            className='pdp-button pdp-color-swatch btn-cart-page'
                            id={color.id}
                            onClick={(e) => 
                            this.props.selectProductAttributes(
                              e, 
                              attribute.name, 
                              this.props.item)}>
                    </button>)
                  }
                </div>
              </div>)
              } else if (attribute.name === 'Capacity') {
                return (
                  <div className='pdp-attributes pdp-capacity-container'>
                    <div className='capacity pdp-attr-buttons flex'
                        id={attribute.name}>
                    {attribute.items.map(capacity => 
                    <button className='pdp-button pdp-capacity btn-cart-page'
                            onClick={(e) => 
                            this.props.selectProductAttributes(
                              e, 
                              attribute.name,
                              this.props.item)}>
                        {capacity.value}
                    </button>
                    )}
                    </div>
                  </div>
                )
              } else if (attribute.name === 'Size') {
                return (
                  <div className='pdp-attributes pdp-sizes-container'>
                    <div className='sizes pdp-attr-buttons flex'
                        id={attribute.name}>
                    {attribute.items.map(size => 
                    <button className='pdp-button pdp-size btn-cart-page'
                            onClick={(e) => 
                            this.props.selectProductAttributes(
                              e, 
                              attribute.name,
                              this.props.item)}>
                        {size.value}
                    </button>)}
                    </div>
                  </div>            
                )
              } else if (attribute.name === 'With USB 3 ports') {
                  return (
                    <div className='pdp-attributes pdp-ports-container'>
                    <div className='ports pdp-attr-buttons flex'
                        id={replaceSpaceWithDash(attribute.name)}>
                    {attribute.items.map(item => 
                    <button className='pdp-button pdp-port btn-cart-page'
                            onClick={(e) => 
                            this.props.selectProductAttributes(
                              e, 
                              replaceSpaceWithDash(attribute.name),
                              this.props.item)}>
                        {item.value}
                    </button>)}
                    </div>
                  </div> 
                  )
              } else if (attribute.name === 'Touch ID in keyboard') {
                return (
                    <div className='pdp-attributes pdp-touchid-container'>
                    <div className='touchid pdp-attr-buttons flex'
                        id={replaceSpaceWithDash(attribute.name)}>
                    {attribute.items.map(item => 
                    <button className='pdp-button pdp-touchid btn-cart-page'
                            onClick={(e) => 
                            this.props.selectProductAttributes(
                              e, 
                              replaceSpaceWithDash(attribute.name),
                              this.props.item)}>
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