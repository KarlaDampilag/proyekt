import * as React from 'react';
import * as _ from 'lodash';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Button, Input, Form, Spin, Select, message } from 'antd';

import { layout, tailLayout } from './AddProductButton';

const SINGLE_INVENTORY_QUERY = gql`
    query SINGLE_INVENTORY_QUERY($id: ID!) {
        inventory(id: $id) {
            id
            name
        }
    }
`;

const UPDATE_INVENTORY_MUTATION = gql`
    mutation UPDATE_INVENTORY_MUTATION(
        $id: ID!
        $name: String
    ) {
        updateInventory(
            id: $id
            name: $name
        ) {
            id
            name
        }
    }
`;

const UpdateInventory = (props) => {
    const [name, setName] = React.useState();

    const handleUpdate = async (e, updateMutation) => {
        const response = await updateMutation({
            variables: {
                id: props.id,
                name,
            }
        });
    }

    return (
        <Query query={SINGLE_INVENTORY_QUERY} variables={{ id: props.id }}>
            {({ data, loading, error }) => {
                if (loading) return <p>Loading...</p>
                if (error) return <ErrorMessage error={error} />
                if (data && !data.inventory) return <p>No inventory found.</p>
                return (
                    <Mutation
                        mutation={UPDATE_INVENTORY_MUTATION}
                        variables={{ name }}
                    >
                        {(updateInventory, { loading, error }) => (
                            <Form
                                {...layout}
                                onFinish={async e => {
                                    await handleUpdate(e, updateInventory);
                                    if (!error) {
                                        message.success('Product updated');
                                    }
                                }}
                            >
                                <ErrorMessage error={error} />
                                <Form.Item
                                    label="Name"
                                    name="name"
                                >
                                    <Input defaultValue={data.inventory.name} onChange={e => setName(e.target.value)} />
                                </Form.Item>

                                <Form.Item {...tailLayout}>
                                    <Button type="primary" htmlType="submit" disabled={ loading}>Updat{loading ? 'ing' : 'e'} Inventory</Button>
                                </Form.Item>
                            </Form>
                        )}
                    </Mutation>
                );
            }}
        </Query >
    );
}

export default UpdateInventory;