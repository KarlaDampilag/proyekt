import * as _ from 'lodash';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Link from 'next/link'
import { Tag, Table, Button } from 'antd';

import { userContext } from './Page';
import { perPage } from '../config';
import ErrorMessage from './ErrorMessage';
import AddProductButton from './AddProductButton';

const ALL_PRODUCTS_QUERY = gql`
    query ALL_PRODUCTS_QUERY {
        products(orderBy: createdAt_DESC) {
            id
            name
            salePrice
            costPrice
            unit
            categories
            notes
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
                    <>
                        <div><AddProductButton /></div>
                        <Query query={ALL_PRODUCTS_QUERY} variables={{ skip: props.page * perPage - perPage }}>
                            {({ error, loading, data }) => {
                                if (error) return <ErrorMessage error={error} />
                                return (
                                    <div>
                                        <Table
                                            loading={loading}
                                            dataSource={data.products}
                                            rowKey='id'
                                            expandable={{
                                                expandedRowRender: record => {
                                                    if (record.notes) {
                                                        return <p style={{ margin: 0 }}>{record.notes}</p>
                                                    }
                                                    return <p style={{ margin: 0 }}>This product has no notes.</p>
                                                }
                                            }}
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
                                                    title: 'Sale Price',
                                                    dataIndex: 'salePrice'
                                                },
                                                {
                                                    title: 'Cost Price',
                                                    dataIndex: 'costPrice'
                                                },
                                                {
                                                    title: 'Categories',
                                                    dataIndex: 'categories',
                                                    render: (value) => {
                                                        return _.map(value, category => {
                                                            return <Tag key={category}>{category}</Tag>
                                                        })
                                                    }
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
                                                                <a><Button>Edit</Button></a>
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
                    </>
                );
            }}
        </userContext.Consumer>
    );
}
export default Products;
export { ALL_PRODUCTS_QUERY };