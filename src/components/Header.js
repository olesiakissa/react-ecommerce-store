import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../src/static/logo.svg';
import CartModal from './CartModal/CartModal';

export default class Header extends React.Component {

  componentDidMount() {
    this.highlightFirstTab();
  }

  highlightFirstTab() {
    document.querySelector('.nav-link').classList.add('selected');
  }

  highlightActiveTab(e) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('selected');
      if (link.innerHTML === e.target.innerHTML) {
        e.target.classList.add('selected');
      }
    });
  }

  toggleMenu(e) {
    const nav = document.querySelector(".primary-navigation");
    const visibility = nav.getAttribute("data-visible");
    if (visibility === "false") {
      nav.setAttribute("data-visible", "true");
      e.target.setAttribute("aria-expanded", "true");
      e.target.innerText = 'Close';
    } else {
      nav.setAttribute("data-visible", "false");
      e.target.setAttribute("aria-expanded", "false");
      e.target.innerText = 'Menu';
    }
  }

  render() {
    const products = 
    this.props.categories.map(
      category => <li key={category} 
                      className='flex'>
                    <Link className='nav-link' 
                          to={'/'}
                          aria-label={category} 
                          onClick={(e) => {
                            this.highlightActiveTab(e);
                            this.props.filterProductsByCategory(e);
                            }}>
                            {category}
                    </Link>
                  </li>);
    const header = document.querySelector('.header')
    const headerOffsetHeight = header ? header.offsetHeight : 80
    return (
      <>
      <header className='header flex'>
      <Link to={'/'}
            onClick={()=>{
              if (this.props.cartModalIsShown) {
                this.props.toggleCartModal();
              }
            }}>
        <img src={logo} alt='Homepage' className='header-logo'/>
      </Link>

      <select aria-label='Switch currency'
              tabIndex='0'
              className='btn btn-currency'
              name='currency'
              onChange={this.props.switchCurrency}>
              {this.props.currencies.map(currency => 
                <option key={currency.symbol} value={currency.symbol}>
                  {`${currency.symbol} ${currency.label}`}
                </option>)}
              </select>

      <div className='btn-cart-container'
            onClick={(e)=> {
              if (window.location.href.includes('cart')) {
                e.preventDefault();
              } else {
                this.props.toggleCartModal();
              }
            }}>
        <button aria-label='Open cart modal'
                className='btn btn-cart'></button>
        {this.props.cartItems.length > 0 && 
        <div className='btn-cart-counter flex'>
          {this.props.cartItems.length}
        </div>}        
      </div>

      <button aria-controls='primary-navigation'
              aria-expanded='false'
              className='btn btn-menu' 
              id='btn-menu'
              onClick={(e)=> {
                          if (this.props.cartModalIsShown) {
                            this.props.toggleCartModal();
                          }
                          this.toggleMenu(e);
                       }}>
                Menu
        </button>
        <nav className='nav'
             aria-hidden='true'>
          <ul className='primary-navigation flex' 
              id='primary-navigation'
              aria-labelledby='btn-menu'
              data-visible='false'>
              {products}
          </ul>
        </nav>
      </header>
      {this.props.cartModalIsShown && 
      <CartModal cartItems={this.props.cartItems}
                 addToCart={this.props.addToCart}
                 removeFromCart={this.props.removeFromCart}
                 toggleCartModal={this.props.toggleCartModal}
                 currentCurrency={this.props.currentCurrency}
                 selectProductAttributes={this.props.selectProductAttributes}
                 totalPrice={this.props.totalPrice}
                 offsetHeight={headerOffsetHeight}
      />}
      </>
    )
  }
}