import * as React from 'react';
import * as _ from 'lodash';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Button, Input, Form, Spin, Select, message } from 'antd';

import { layout, tailLayout } from './AddProductButton';

const SINGLE_CUSTOMER_QUERY = gql`
    query SINGLE_CUSTOMER_QUERY($id: ID!) {
        customer(id: $id) {
            id
            name
        }
    }
`;

const UPDATE_CUSTOMER_MUTATION = gql`
    mutation UPDATE_CUSTOMER_MUTATION(
        $id: ID!
        $name: String
    ) {
        updateCustomer(
            id: $id
            name: $name
        ) {
            id
            name
        }
    }
`;

const UpdateCustomer = (props) => {
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
        <Query query={SINGLE_CUSTOMER_QUERY} variables={{ id: props.id }}>
            {({ data, loading, error }) => {
                if (loading) return <p>Loading...</p>
                if (error) return <ErrorMessage error={error} />
                if (data && !data.customer) return <p>No customer found.</p>
                return (
                    <Mutation
                        mutation={UPDATE_CUSTOMER_MUTATION}
                        variables={{ name }}
                    >
                        {(updateCustomer, { loading, error }) => (
                            <Form
                                {...layout}
                                onFinish={async e => {
                                    await handleUpdate(e, updateCustomer);
                                    if (!error) {
                                        message.success('Customer updated');
                                    }
                                }}
                            >
                                <ErrorMessage error={error} />
                                <Form.Item
                                    label="Name"
                                    name="name"
                                >
                                    <Input defaultValue={data.customer.name} onChange={e => setName(e.target.value)} />
                                </Form.Item>

                                <Form.Item {...tailLayout}>
                                    <Button type="primary" htmlType="submit" disabled={ loading}>Updat{loading ? 'ing' : 'e'} Customer</Button>
                                </Form.Item>
                            </Form>
                        )}
                    </Mutation>
                );
            }}
        </Query >
    );
}

export default UpdateCustomer;