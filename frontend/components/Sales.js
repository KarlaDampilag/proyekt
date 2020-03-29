import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Link from 'next/link';
import { Table, Button } from 'antd';

import { userContext } from './Page';
import ErrorMessage from './ErrorMessage';
import AddSaleButton from './AddSaleButton';

const ALL_SALE_ITEMS_QUERY = gql`
    query ALL_SALE_ITEMS_QUERY {
        saleItems(orderBy: createdAt_DESC) {
            id
            product {
                name
                salePrice
                costPrice
            }
            quantity
            sale {
                timestamp
                customer {
                    name
                }
                discountType
                discountValue
                taxType
                taxValue
                shipping
                note
                createdAt
            }
        }
    }
`;

const Inventories = () => {
    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <div>
                        <div><AddSaleButton /></div>
                        <Query query={ALL_SALE_ITEMS_QUERY}>
                            {({ loading, data, error }) => {
                                if (error) return <ErrorMessage error={error} />
                                console.log(data)
                                return (
                                    <Table
                                        dataSource={data.saleItems}
                                        loading={loading}
                                        columns={[
                                            {
                                                title: 'Producs',
                                                dataIndex: 'product'
                                            },
                                            {
                                                title: 'Edit ✏️',
                                                dataIndex: 'id',
                                                key: 'edit',
                                                render: (value) => {
                                                    return (
                                                        <Link href={{
                                                            pathname: '/updateInventory',
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
                                        rowKey='id'
                                    />
                                )
                            }}
                        </Query>
                    </div>
                );
            }}
        </userContext.Consumer>
    );
}
export default Inventories;
export { ALL_SALE_ITEMS_QUERY };