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

  selectProductAttributes(e, product) {
    this.updateAttributeButtonFocus(e);
    this.setState({
      cartItems: this.state.cartItems.map(item => item.id === product.item.id ? 
        {
          ...item,
          selectedAttributes: {
            name: item.attributes[0].name,
            value: e.target.innerHTML
          }
        } : item)
    }, this.updateLocalStorage)
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
                            heading={this.state.productsListHeading}
              />}>            
            </Route>
            <Route path='details/:id' element={<ProductDescriptionPage />} />
            <Route path='cart' element={<CartPage cartItems={this.state.cartItems}
                                                  totalPrice={this.state.totalPrice}
                                        />}/>
         </Routes>  
         </main>     
      </>
    )
  }
}
