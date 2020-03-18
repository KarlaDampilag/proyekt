import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link'

import Title from './styles/Title';
import ProductStyles from './styles/ProductStyles';
import PriceTag from './styles/PriceTag';
import DeleteItem from './DeleteProduct';
import AddToCart from './AddToCart';

const Product = (props) => {
    Product.propTypes = {
        product: PropTypes.object.isRequired
    };

    return (
        <ProductStyles>
            {props.product.image && <img src={props.product.image} alt={props.product.title} />}
            <Title>
                <Link href={{
                    pathname: '/product',
                    query: { id: props.product.id }
                }}>
                    <a>{props.product.name}</a>
                </Link>
            </Title>
            <PriceTag>{props.product.salePrice}</PriceTag>
            <p>{props.product.description}</p>
            <div className='buttonList'>
                <Link href={{
                    pathname: '/update',
                    query: { id: props.product.id }
                }}>
                    <a>Edit ✏️</a>
                </Link>
                <AddToCart id={props.product.id} />
                <DeleteItem id={props.product.id}>{'Delete Product'}</DeleteItem>
            </div>
        </ProductStyles>
    );
}
export default Product;