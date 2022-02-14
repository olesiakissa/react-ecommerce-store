import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../src/static/logo.svg';


export default class Header extends React.Component {

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

  showCartModal(e) {
    //TBA
  }

  render() {
    const products = 
    this.props.categories.map(
      category => <li key={category} className='flex'>
                    <Link className='nav-link' to={'/'}
                          onClick={this.props.filterProductsByCategory}>
                                  {category}
                    </Link>
                  </li>);

    return (
      <header className='header flex'>
      <Link to={'/'}>
        <img src={logo} alt='Homepage' className='header-logo'/>
      </Link>

      <select className='btn btn-currency'
              name='currency'
              onChange={this.props.switchCurrency}>
              {this.props.currencies.map(currency => 
                <option value={currency.symbol}>
                  {`${currency.symbol} ${currency.label}`}
                </option>)}
              </select>

      <button aria-label='Open cart'
              className='btn btn-cart'
              onClick={this.showCartModal}></button>

      <button aria-controls='primary-navigation'
              aria-expanded='false'
              className='btn btn-menu' 
              onClick={this.toggleMenu}>Menu</button>
        <nav>
          <ul className='primary-navigation flex' 
              id='primary-navigation'
              data-visible='false'>
              {products}
          </ul>
        </nav>
      </header>
    )
  }
}