import React from 'react';
import { Routes, Route } from 'react-router-dom';

import {client} from '../index.js'
import GET_ALL_DATA from '../queries/AllData';
import Header from './Header';
import ProductsList from './ProductsList';
import ProductDescriptionPage from './ProductDescriptionPage';
import CartPage from './CartPage';

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
    this.setState({currentCurrency: e.target.value})
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

  handleAddToCart(product) {
    const isProductInCart = this.state.cartItems.find(
                            item => item.id === product.id);
    if (isProductInCart) {
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
    } else {
      this.setState({
        cartItems: [...this.state.cartItems, {...product, amount: 1}]
      }, () => {
        this.updateTotalPrice();
        this.updateLocalStorageCartItems();
        }
      )}
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
    const attributeValue = (attrName === 'Size' || attrName === 'Capacity') ?
                                                        e.target.innerHTML :
                                                        e.target.id
    if (!product.selectedAttributes) {
      this.setState({
        productDetails: {
          ...product,
          selectedAttributes: {
            [attrName]: attributeValue
          }
        }
      }, this.updateLocalStorageProductDetails)
    } else {
      this.setState({
        productDetails: {
          ...product,
          selectedAttributes: {
            ...product.selectedAttributes,
            [attrName]: attributeValue
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
      })
    }
  }

  showProductDetails (id){
    this.setState({
      productDetails: this.state.filteredProducts.find(
        product => product.id === id)
    }, this.updateLocalStorageProductDetails)
  }

  render() {
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
                selectProductAttributes={this.selectProductAttributes}
                totalPrice={this.state.totalPrice}
         />}
         <main>
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
                                        />}/>
         </Routes>  
         </main>     
      </>
    )
  }
}
