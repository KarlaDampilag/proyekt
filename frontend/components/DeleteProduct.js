import * as React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Popconfirm, message } from 'antd';

import { ALL_PRODUCTS_QUERY } from './Products';

const DELETE_PRODUCT_MUTATION = gql`
    mutation DELETE_PRODUCT_MUTATION($id: ID!) {
        deleteProduct(id: $id) {
            id
        }
    }
`;

const DeleteItem = (props) => {
    const update = (cache, payload) => {
        // manually update cache on client so it matches the server

        // Read cache for the items
        const data = cache.readQuery({ query: ALL_PRODUCTS_QUERY });

        // Filter out the deleted item out of the page
        data.products = data.products.filter(product => product.id != payload.data.deleteProduct.id);

        // Put the items back in the cache
        cache.writeQuery({ query: ALL_ITEMS_QUERY, data })
    }

    return (
        <Mutation
            mutation={DELETE_PRODUCT_MUTATION}
            variables={{ id: props.id }}
            update={update}
        >
            {(deleteProduct, { error }) => (
                <Popconfirm
                    title="Are you sure to delete this product?"
                    onConfirm={() => {
                        deleteProduct().catch(error => message.error(error.message.replace('GraphQL error: ', '')));
                    }}
                    okText="Delete"
                    cancelText="Cancel"
                >
                    <a href="#">{props.children}</a>
                </Popconfirm>
            )}
        </Mutation>

    )
}

export default DeleteItem;