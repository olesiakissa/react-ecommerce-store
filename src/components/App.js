import React from 'react';
import Header from './Header';

import {client} from '../index.js'
import GET_ALL_DATA from '../queries/AllData';
import ProductsList from './ProductsList';

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
        })
      }
    } 
  }

  handleFirstLoadFilter() {
    this.setState({
      filteredProducts: this.state.products[0].products,
      currentCurrency: this.state.currencies[0].symbol,
      sortBy: 'all',
      productsListHeading: 'all'
    })
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

  handleSwitchCurrency(e) {
    this.setState({currentCurrency: e.target.value})
  }

  updateLocalStorage() {
    localStorage.setItem("cartItems", JSON.stringify(this.state.cartItems));
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
      }, this.updateLocalStorage());
    } else {
      this.setState({
        cartItems: [...this.state.cartItems, {...product, amount: 1}]
      }, this.updateLocalStorage());
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
      }, this.updateLocalStorage());
    } else {
      if (this.state.cartItems.length > 1) {
        this.setState({
          cartItems: this.state.cartItems.filter(item => item.id !== product.id)
        }, this.updateLocalStorage());
      } else {
          this.toggleCartModal();
          localStorage.clear();
          this.setState({
            cartItems: []
          });
        }
      }  
    }

  toggleCartModal() {
    this.setState(prevState => ({
      cartModalIsShown: !prevState.cartModalIsShown
      })
    )
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
                />}
        {this.state.sortBy && 
        <ProductsList products={this.state.filteredProducts}
                      currentCurrency={this.state.currentCurrency}
                      addToCart={this.handleAddToCart}
                      heading={this.state.productsListHeading}
        />}
      </>
    )
  }
}
