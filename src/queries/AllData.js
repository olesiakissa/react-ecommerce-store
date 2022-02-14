import { gql } from '@apollo/client';

const GET_ALL_DATA = {
  query: gql`
  # Write your query or mutation here
query {
	categories {
    name
    products {
      id
      name
      inStock
      gallery
      description
      category
      attributes {
        id
        name
        type
        items {
 					id
          value
          displayValue
        }
      }
      prices {
        currency {
          label
          symbol
        }
        amount
      }
      brand
    }
  }
  currencies{
    symbol
    label
  }
}`
}

export default GET_ALL_DATA;