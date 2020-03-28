import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Link from 'next/link';
import { Table, Button } from 'antd';

import { userContext } from './Page';
import ErrorMessage from './ErrorMessage';
import AddCustomerButton from './AddCustomerButton';

const ALL_CUSTOMERS_QUERY = gql`
    query ALL_CUSTOMERS_QUERY {
        customers(orderBy: createdAt_DESC) {
            id
            user {
                id
            }
            name
            email
            phone
            street1
            street2
            city
            state
            zipCode
            country
            createdAt
        }
    }
`;

const Customers = () => {
    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <div>
                        <div><AddCustomerButton /></div>
                        <Query query={ALL_CUSTOMERS_QUERY}>
                            {({ loading, data, error }) => {
                                if (error) return <ErrorMessage error={error} />
                                const customers = data.customers;
                                return (
                                    <Table
                                        dataSource={customers}
                                        loading={loading}
                                        columns={[
                                            {
                                                title: 'Name',
                                                dataIndex: 'name'
                                            },
                                            {
                                                title: 'Email',
                                                dataIndex: 'email'
                                            },
                                            {
                                                title: 'Phone',
                                                dataIndex: 'phone'
                                            },
                                            {
                                                title: 'Address',
                                                dataIndex: 'id',
                                                key: 'address',
                                                render: (value, record) => {
                                                    const allowed = ['street1','street2','city','state','zipCode','country'];
                                                    const filteredObj = _.pick(record, allowed)
                                                    return (
                                                        _.filter(Object.values(filteredObj), value => value).join(', ')
                                                    )
                                                }
                                            },
                                            {
                                                title: 'Edit ✏️',
                                                dataIndex: 'id',
                                                key: 'edit',
                                                render: (value) => {
                                                    return (
                                                        <Link href={{
                                                            pathname: '/updateCustomer',
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
export default Customers;
export { ALL_CUSTOMERS_QUERY };