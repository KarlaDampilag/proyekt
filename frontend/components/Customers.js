import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Table } from 'antd';

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
            address {
                id
                country
                street1
                street2
                city
                state
                zipCode
            }
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
                                                dataIndex: 'address',
                                                render: (value) => {
                                                    const returnValue = {...value};
                                                    delete returnValue.id;
                                                    return (
                                                        _.filter(returnValue, parameter => parameter).join(', ')
                                                    )
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