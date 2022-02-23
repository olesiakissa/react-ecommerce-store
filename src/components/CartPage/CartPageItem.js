import React from 'react';
import arrowLeft from '../../static/arrow-left.svg';
import arrowRight from '../../static/arrow-right.svg';

export default class CartPageItem extends React.Component {

  constructor() {
    super();
    this.handleItemGallery = this.handleItemGallery.bind(this);
    this.showNextImage = this.showNextImage.bind(this);
    this.showPrevImage = this.showPrevImage.bind(this);
    this.state = {
      imgIndex: 0
    }
  }

  componentDidMount() {
    this.handleItemGallery();
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
                    onClick={() => this.props.addToCart(this.props.item)}
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
                            className='pdp-button pdp-color-swatch'
                            id={color.id}
                            onClick={(e) => 
                            this.props.selectProductAttributes(e, 
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
                    <button className='pdp-button pdp-capacity'
                            onClick={(e) => 
                            this.props.selectProductAttributes(e, 
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
                    <button className='pdp-button pdp-size'
                            onClick={(e) => 
                            this.props.selectProductAttributes(e, 
                                                      attribute.name,
                                                      this.props.item)}>
                        {size.value}
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