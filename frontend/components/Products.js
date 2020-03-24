import * as _ from 'lodash';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Link from 'next/link'
import { Table, Modal, Button, Input, Form, Spin, Select, message } from 'antd';

import { userContext } from './Page';
import { perPage } from '../config';
import ErrorMessage from './ErrorMessage';

const ALL_PRODUCTS_QUERY = gql`
    query ALL_PRODUCTS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
        products(first: $first, skip: $skip, orderBy: createdAt_DESC) {
            id
            name
            salePrice
            unit
            categories
            image
        }
    }
`;

const Products = (props) => {
    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <Query query={ALL_PRODUCTS_QUERY} variables={{ skip: props.page * perPage - perPage }}>
                        {({ error, loading, data }) => {
                            if (error) return <ErrorMessage error={error} />
                            return (
                                <div>
                                    <Table
                                        loading={loading}
                                        dataSource={data.products}
                                        rowKey='id'
                                        columns={[
                                            {
                                                dataIndex: 'image',
                                                render: (value, record) => {
                                                    if (value) {
                                                        return <img src={value} alt={record.name} width='150px' />
                                                    }
                                                    return null;
                                                }
                                            },
                                            {
                                                title: 'Name',
                                                dataIndex: 'name'
                                            },
                                            {
                                                title: 'Cost Price',
                                                dataIndex: 'costPrice'
                                            },
                                            {
                                                title: 'Sale Price',
                                                dataIndex: 'salePrice'
                                            },
                                            {
                                                title: 'Edit ✏️',
                                                dataIndex: 'id',
                                                key: 'edit',
                                                render: (value) => {
                                                    return (
                                                        <Link href={{
                                                            pathname: '/update',
                                                            query: { id: value }
                                                        }}>
                                                            <a>Edit ✏️</a>
                                                        </Link>
                                                    );
                                                }
                                            },
                                            {
                                                title: 'Delete ',
                                                dataIndex: 'id',
                                                key: 'edit',
                                                render: (value) => {
                                                    return (
                                                        <Button>Delete</Button>
                                                    );
                                                }
                                            }
                                        ]}
                                    />
                                </div>
                            );
                        }}
                    </Query>
                );
            }}
        </userContext.Consumer>
    );
}
export default Products;
export { ALL_PRODUCTS_QUERY };