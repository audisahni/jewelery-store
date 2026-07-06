// GraphQL documents for the Shopify Storefront API.
// Kept as plain strings (no codegen) to stay dependency-light on the edge.

const MONEY_FRAGMENT = /* GraphQL */ `
  fragment Money on MoneyV2 {
    amount
    currencyCode
  }
`;

const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment Image on Image {
    url
    altText
    width
    height
  }
`;

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment Product on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    featuredImage { ...Image }
    images(first: 12) { nodes { ...Image } }
    priceRange { minVariantPrice { ...Money } maxVariantPrice { ...Money } }
    compareAtPriceRange { minVariantPrice { ...Money } }
    variants(first: 50) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        price { ...Money }
        compareAtPrice { ...Money }
        selectedOptions { name value }
      }
    }
    seo { title description }
    metafield(namespace: "custom", key: "material") { value }
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

const CART_FRAGMENT = /* GraphQL */ `
  fragment Cart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { ...Money }
      totalAmount { ...Money }
      totalTaxAmount { ...Money }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost { totalAmount { ...Money } subtotalAmount { ...Money } }
        merchandise {
          ... on ProductVariant {
            id
            title
            price { ...Money }
            selectedOptions { name value }
            product {
              handle
              title
              featuredImage { ...Image }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
`;

// ---- Catalog queries -------------------------------------------------------

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes { ...Product }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ...Product }
  }
  ${PRODUCT_FRAGMENT}
`;

export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) { nodes { ...Product } }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// ---- Cart mutations --------------------------------------------------------

export const CART_QUERY = /* GraphQL */ `
  query Cart($id: ID!) {
    cart(id: $id) { ...Cart }
  }
  ${CART_FRAGMENT}
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!], $buyerIdentity: CartBuyerIdentityInput) {
    cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
      cart { ...Cart }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...Cart }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...Cart }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...Cart }
      userErrors { field message }
    }
  }
  ${CART_FRAGMENT}
`;
