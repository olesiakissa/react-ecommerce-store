import React from 'react';
import { Routes, Route } from 'react-router-dom';

import {client} from '../index.js'
import GET_ALL_DATA from '../queries/AllData';
import Header from './Header';
import ProductsList from './PDP/ProductsList';
import ProductDescriptionPage from './PDP/ProductDescriptionPage';
import CartPage from './CartPage/CartPage';
import { convertArrayToStringEntry } from '../utils/DataUtils.js';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.setState = this.setState.bind(this);
    this.handleFirstLoadFilter = this.handleFirstLoadFilter.bind(this);
    this.handleFilterProductsByCategory = this.handleFilterProductsByCategory.bind(this);
    this.updateBtnMenuText = this.updateBtnMenuText.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.handleSwitchCurrency = this.handleSwitchCurrency.bind(this);
    this.toggleCartModal = this.toggleCartModal.bind(this);
    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.handleRemoveFromCart = this.handleRemoveFromCart.bind(this);
    this.selectProductAttributes = this.selectProductAttributes.bind(this);
    this.updateTotalPrice = this.updateTotalPrice.bind(this);
    this.showProductDetails = this.showProductDetails.bind(this);
    this.updateLocalStorageProductDetails = this.updateLocalStorageProductDetails.bind(this);
    this.updateProductDetailsOnReload = this.updateProductDetailsOnReload.bind(this);
    this.updateSelectedAttributesPDP = this.updateSelectedAttributesPDP.bind(this);
    this.addToCartWithSelectedAttributes = this.addToCartWithSelectedAttributes.bind(this);
    this.addToCartWithDefaultAttributes = this.addToCartWithDefaultAttributes.bind(this);
    this.addToCartWithoutAttributes = this.addToCartWithoutAttributes.bind(this);
    this.getProductDefaultAttributes = this.getProductDefaultAttributes.bind(this);
    this.increaseCartItemAmount = this.increaseCartItemAmount.bind(this);
    this.addNewCartItem = this.addNewCartItem.bind(this);
    this.createCustomProductId = this.createCustomProductId.bind(this);
    this.calculateTotalCartItemsQuantity = this.calculateTotalCartItemsQuantity.bind(this);
    this.cartProductIdContainsCurrentProductId = this.cartProductIdContainsCurrentProductId.bind(this);
  }

  state = {
    products: [],
    filteredProducts: [],
    categories: [],
    currencies: [],
    currentCurrency: '',
    sortBy: '',
    productsListHeading: '',
    cartItems: [],
    cartModalIsShown: false
  }
// TODO Add specific endpoints for each request
  componentDidMount() {
    client.query(GET_ALL_DATA)
      .then(result => {
        this.setState({
          currencies: result.data.currencies,
          products: result.data.categories,
          categories: result.data.categories.map(category => category.name)
        })
      });
  }

  componentDidUpdate() {
    if (this.state.sortBy === '') {
      this.handleFirstLoadFilter();
    } 
    this.updateCartItemsOnLoad();
    this.updateProductDetailsOnReload();
  }

  handleFirstLoadFilter() {
    this.setState({
      filteredProducts: this.state.products[0].products,
      currentCurrency: this.state.currencies[0].symbol,
      sortBy: 'all',
      productsListHeading: 'all',
      totalPrice: 0
    })
  }

  localStorageIsEmpty() {
    return localStorage.getItem("cartItems") === '[]' ||
           localStorage.getItem("cartItems") === null 
  }

  updateCartItemsOnLoad() {
    if (this.state.cartItems.length === 0) { 
      if (!this.localStorageIsEmpty()) {
        this.setState({
          cartItems: JSON.parse(localStorage.getItem("cartItems"))
        }, this.updateTotalPrice)
      }
    } 
  }

  /**
   * Fills the product description page from the localStorage
   * in case the page was reloaded and productDetails was removed
   * from state on page reload.
   */
  updateProductDetailsOnReload() {
    if (window.location.href.includes('details') &&
    localStorage.getItem("productDetails") !== null &&
    !this.state.hasOwnProperty("productDetails")) {
      this.setState({
        productDetails: JSON.parse(localStorage.getItem("productDetails"))
      })
    }
  }

  handleFilterProductsByCategory(e) {
    this.updateBtnMenuText();
    this.closeMenu();
    const filtered = this.state.products.filter(
      categories => categories.name === e.currentTarget.innerHTML);

    this.setState({
      sortBy: e.currentTarget.innerHTML,
      filteredProducts: filtered[0].products,
      productsListHeading: e.currentTarget.innerHTML
    });
  }

  closeMenu(){
    document.querySelector(".primary-navigation")
            .setAttribute("data-visible", "false");
  }

  updateBtnMenuText() {
    const btnMenu = document.querySelector(".btn-menu");
    btnMenu.innerText = 'Menu';
    btnMenu.setAttribute("aria-expanded", "false");
  }

  toggleCartModal() {
    this.setState(prevState => ({
      cartModalIsShown: !prevState.cartModalIsShown
      }));
  }

  handleSwitchCurrency(e) {
    this.setState({
      currentCurrency: e.target.value
    }, this.updateTotalPrice)
  }

  updateLocalStorageCartItems() {
    localStorage.setItem("cartItems", JSON.stringify(this.state.cartItems));
  }

  /**
   * Saves the details of the product which is requested by
   * user and is helpful in case the user refreshes the page
   * and PDP has to be filled with the same data again without 
   * navigating back to the homepage.
   */
  updateLocalStorageProductDetails() {
    localStorage.setItem("productDetails", JSON.stringify(this.state.productDetails));
  }

  calculateTotalCartItemsQuantity() {    
    return this.state.cartItems.map(
      item => item.amount).reduce(
        (prevAmount, nextAmount) => prevAmount + nextAmount);
  }

  createCustomProductId(product) {
    return product.selectedAttributes ? 
    `${product.id}${Object.entries(product.selectedAttributes)
        .join('')}`.replaceAll(/[ ,]/g, '') :
    `${product.id}${Object.entries(this.getProductDefaultAttributes(product))
        .join('')}`.replaceAll(/[ ,]/g, '');
  }

  cartProductIdContainsCurrentProductId(product, attributes) {
    const containsValuesFlagsArray = [];

    Object.entries(attributes).forEach(entry => {
      containsValuesFlagsArray.push((
        product.id.includes(convertArrayToStringEntry(entry)) ? true : false
      ));
    });

    return containsValuesFlagsArray.every(flag => flag === true);
  }

  handleAddToCart(e, product) {
    e.preventDefault();
    let isProductInCart = {};
       
    if (product.hasOwnProperty("attributes")) {
      const productAttributes = 
      product.selectedAttributes ?? this.getProductDefaultAttributes(product);
      isProductInCart = this.state.cartItems.find(
          item => this.cartProductIdContainsCurrentProductId(
            item, productAttributes) === true && 
            item.name === product.name);
      if (product.hasOwnProperty("selectedAttributes")) {      
        this.addToCartWithSelectedAttributes(isProductInCart, product);
      } else {
        this.addToCartWithDefaultAttributes(isProductInCart, product);
      }
    } else {
      this.addToCartWithoutAttributes(isProductInCart, product);
    }
  }

  getProductDefaultAttributes(product) {
    const selectedAttributesArray = product.attributes.map(attribute => ({
                                      [attribute.name]: attribute.items[0].id
                                    }))
    return Object.assign({}, ...selectedAttributesArray);
  }

  increaseCartItemAmount(product) {
    this.setState({
      cartItems: this.state.cartItems.map(item => item.id === product.id ? 
        {
          ...item,
          amount: item.amount + 1
        } : item)
    }, () => {
      this.updateTotalPrice();
      this.updateLocalStorageCartItems()
    }); 
  }

  addNewCartItem(product) {
    if (product.hasOwnProperty('attributes') && !product.selectedAttributes) {
      this.setState({
        cartItems: [...this.state.cartItems, 
          {
            ...product, 
            id: this.createCustomProductId(product),
            selectedAttributes: this.getProductDefaultAttributes(product),
            amount: 1
          }]
      }, () => {
        this.updateTotalPrice();
        this.updateLocalStorageCartItems();
        });
    } else {
      this.setState({
        cartItems: [...this.state.cartItems, 
          {
            ...product, 
            id: this.createCustomProductId(product),
            amount: 1
          }]
      }, () => {
        this.updateTotalPrice();
        this.updateLocalStorageCartItems();
        });      
    }

  }

  addToCartWithoutAttributes(isProductInCart, product) {
    if (isProductInCart) {
      this.increaseCartItemAmount(product);
    } else {
      this.addNewCartItem(product);
    }
  }

  addToCartWithSelectedAttributes(isProductInCart, product) {
    if (isProductInCart) {
      this.increaseCartItemAmount(isProductInCart);
    } else {
      this.addNewCartItem(product);
    } 
  }

  addToCartWithDefaultAttributes(isProductInCart, product) {
    if (isProductInCart) {
      this.increaseCartItemAmount(isProductInCart);
    } else {
      this.addNewCartItem(product);  
    }
  }

  handleRemoveFromCart(product) {
    if (product.amount > 1) {
      this.setState({
        cartItems: this.state.cartItems.map(item => item.id === product.id ?
          {
            ...item,
            amount: item.amount - 1
          }
          : item)
        }, () => {
          this.updateTotalPrice();
          this.updateLocalStorageCartItems();
      });
    } else {
      if (this.state.cartItems.length > 1) {
        this.setState({
          cartItems: this.state.cartItems.filter(item => item.id !== product.id)
        }, ()=> {
          this.updateLocalStorageCartItems();
          this.updateTotalPrice();
        });
      } else {
          this.toggleCartModal();
          localStorage.clear();
          this.setState({
            cartItems: [],
            totalPrice: 0
          });
        }
      }  
    }

  selectProductAttributes(e, attrName, product) {
    this.updateAttributeButtonFocus(e);

    let attrValue = '';
    switch(attrName) {
      case 'Size':
      case 'Capacity':
      case 'With USB 3 ports':
      case 'Touch ID in keyboard':
        attrValue = e.target.innerText;
        break;
      case 'Color':
        attrValue = e.target.id;
        break;
      default:
        attrValue = e.target.innerHTML;
        break;
    }
      this.updateSelectedAttributesPDP(attrName, attrValue, product);
  }

  updateSelectedAttributesPDP(attrName, attrValue, product) {
    if (!product.selectedAttributes) {
      this.setState({
        productDetails: {
          ...product,
          selectedAttributes: {
            [attrName]: attrValue
          }
        }
      }, this.updateLocalStorageProductDetails)
    } else {
      this.setState({
        productDetails: {
          ...product,
          selectedAttributes: {
            ...product.selectedAttributes,
            [attrName]: attrValue
          }
        }
      }, this.updateLocalStorageProductDetails)
    }
  }

  /**
   * Makes a selection on the one attribute in the row of product
   * attributes and remove focus from the others
   * @param {*} e Event fired by button that triggers the selection
   */
  updateAttributeButtonFocus(e) {
    const btnArray = e.target.parentNode.children;
    for (const btn of btnArray) {
      btn.classList.remove('selected');
      if (btn.innerHTML === e.target.innerHTML) {
        e.target.classList.add('selected')
      }
    }
  }

  updateTotalPrice() {
    if (this.state.cartItems.length !== 0) {
      const totalSum = this.state.cartItems.map(
        item => item.prices.filter(
          price => price.currency.symbol === this.state.currentCurrency).map(
            el => el.amount * item.amount
          )
        ).flat()
        .reduce((total, nextPrice) => total + nextPrice, 0);
      this.setState({
        totalPrice: totalSum
      }, () => {
        localStorage.setItem("totalPrice", JSON.stringify(this.state.totalPrice))
      })
    }
  }

  showProductDetails (id) {
    this.setState({
      productDetails: this.state.filteredProducts.find(
        product => product.id === id)
    }, this.updateLocalStorageProductDetails)
  }

  render() {
    const header = document.querySelector('.header')
    // TODO Remove inline styles
    const styles = {
      headerOffsetHeight: header ? header.offsetHeight : 100,
      cartModalOffsetRight: header ? window.getComputedStyle(header).paddingInlineEnd : 50
    }
    return (
      <>
        {this.state.categories.length > 0 
         &&
        <Header categories={this.state.categories} 
                filterProductsByCategory={this.handleFilterProductsByCategory}
                currencies={this.state.currencies}
                currentCurrency={this.state.currentCurrency}
                switchCurrency={this.handleSwitchCurrency}
                cartItems={this.state.cartItems}
                cartModalIsShown={this.state.cartModalIsShown}
                toggleCartModal={this.toggleCartModal}
                addToCart={this.handleAddToCart}
                removeFromCart={this.handleRemoveFromCart}
                totalPrice={this.state.totalPrice}
                calculateTotalCartItemsQuantity={this.calculateTotalCartItemsQuantity}
                cartProductIdContainsCurrentProductId={this.cartProductIdContainsCurrentProductId}
                styles={styles}
         />}
         <main className='main'>
         {/* TODO Remove inline styles */}
         <div className='content-overlay' 
              style={{display: this.state.cartModalIsShown ? 'block' : 'none',
              top: `${styles.headerOffsetHeight}px`}}>
        </div>
         <Routes>
            <Route index path='/' element={this.state.sortBy &&
                            <ProductsList products={this.state.filteredProducts}
                            currentCurrency={this.state.currentCurrency}
                            addToCart={this.handleAddToCart}
                            showProductDetails={this.showProductDetails}
                            heading={this.state.productsListHeading}
              />}>            
            </Route>
            <Route path='details/:id' 
            element={this.state.hasOwnProperty("productDetails") && 
            <ProductDescriptionPage product={this.state.productDetails}
                                    addToCart={this.handleAddToCart}
                                    currentCurrency={this.state.currentCurrency}
                                    selectProductAttributes={this.selectProductAttributes}
            />} />

            <Route path='cart' element={<CartPage cartItems={this.state.cartItems}
                                                  totalPrice={this.state.totalPrice}
                                                  updateTotalPrice={this.updateTotalPrice}
                                                  currentCurrency={this.state.currentCurrency}
                                                  cartProductIdContainsCurrentProductId={this.cartProductIdContainsCurrentProductId}
                                                  addToCart={this.handleAddToCart}
                                                  removeFromCart={this.handleRemoveFromCart}
            />}/>
         </Routes> 
         </main>     
      </>
    )
  }
}
