import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Modal, Form, Input, Button, message, Spin } from 'antd';

import { layout, tailLayout } from './AddProductButton';
import { ALL_INVENTORIES_QUERY } from './Inventories';

const CREATE_INVENTORY_MUTATION = gql`
    mutation CREATE_INVENTORY_MUTATION($name: String!) {
        createInventory(name: $name) {
            id
            name
            createdAt
        }
    }
`;

const AddInventoryButton = () => {
    const [modalIsVisible, setModalIsVisible] = React.useState();
    const [name, setName] = React.useState();

    const [form] = Form.useForm();

    const update = (cache, payload) => {
        const data = cache.readQuery({ query: ALL_INVENTORIES_QUERY });
        data.inventories.push(payload.data.createInventory);
        data.inventories = _.sortBy(data.inventories, 'createdAt');
        cache.writeQuery({ query: ALL_INVENTORIES_QUERY, data })
    }

    return (
        <>
            <Mutation
                mutation={CREATE_INVENTORY_MUTATION}
                variables={{ name }}
                update={update}
            >
                {(createInventory, { loading, error }) => (
                    <Modal
                        title="Add an Inventory"
                        visible={modalIsVisible}
                        onCancel={() => setModalIsVisible(false)}
                        footer={null}
                    >
                        <Form
                            form={form}
                            {...layout}
                            onFinish={async () => {
                                const response = await createInventory();
                                if (error) {
                                    message.error(error.message.replace('GraphQL error: ', ''));
                                } else {
                                    setModalIsVisible(false);
                                    form.resetFields();
                                    message.success('Inventory added');
                                }
                            }}
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'This field is required' }]}
                            >
                                <Input value={name} onChange={e => setName(e.target.value)} />
                            </Form.Item>

                            <Form.Item {...tailLayout}>
                                <Button type="primary" htmlType="submit" disabled={loading}>
                                    Add{loading ? 'ing' : ' '} Inventory
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                )}
            </Mutation>
            <div><Button onClick={() => setModalIsVisible(true)}>Add Inventory</Button></div>
        </>
    )
}
export default AddInventoryButton;