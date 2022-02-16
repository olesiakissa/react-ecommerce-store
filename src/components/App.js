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
    this.updateTotalPrice = this.updateTotalPrice.bind(this);
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
        }, this.updateTotalPrice)
      }
    } 
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
      })
    )
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
      }, () => {
        this.updateTotalPrice();
        this.updateLocalStorage()
      });
    } else {
      this.setState({
        cartItems: [...this.state.cartItems, {...product, amount: 1}]
      }, () => {
        this.updateTotalPrice();
        this.updateLocalStorage();
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
          this.updateLocalStorage();
      });
    } else {
      if (this.state.cartItems.length > 1) {
        this.setState({
          cartItems: this.state.cartItems.filter(item => item.id !== product.id)
        }, ()=> {
          this.updateLocalStorage();
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
                totalPrice={this.state.totalPrice}
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
