import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Link from 'next/link';
import { Table, Button } from 'antd';

import { userContext } from './Page';
import ErrorMessage from './ErrorMessage';
import AddInventoryButton from './AddInventoryButton';

const ALL_INVENTORIES_QUERY = gql`
    query ALL_INVENTORIES_QUERY {
        inventories(orderBy: createdAt_DESC) {
            id
            name
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
                        <AddInventoryButton />
                        <Query query={ALL_INVENTORIES_QUERY}>
                            {({ loading, data, error }) => {
                                if (error) return <ErrorMessage error={error} />
                                return (
                                    <Table
                                        dataSource={data.inventories}
                                        loading={loading}
                                        columns={[
                                            {
                                                title: 'Name',
                                                dataIndex: 'name'
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
export { ALL_INVENTORIES_QUERY };