import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { Modal, Form, Input, Button, message, Spin } from 'antd';

import { layout, tailLayout } from './Products';
import ErrorMessage from './ErrorMessage';

const CREATE_INVENTORY_MUTATION = gql`
    mutation CREATE_INVENTORY_MUTATION($name: String!) {
        createInventory(name: $name) {
            id
            name
        }
    }
`;

const Inventories = () => {
    const [modalIsVisible, setModalIsVisible] = React.useState();
    const [inventoryName, setInventoryName] = React.useState();

    return (
        <div>
            <Mutation
                mutation={CREATE_INVENTORY_MUTATION}
                variables={{ name: inventoryName }}
            >
                {(createInventory, { loading, error }) => (
                    <Modal
                        title="Add an Inventory"
                        visible={modalIsVisible}
                        onCancel={() => setModalIsVisible(false)}
                        footer={null}
                    >
                        <Form
                            {...layout}
                            onFinish={async () => {
                                const response = await createInventory();
                                if (!error) {
                                    setModalIsVisible(false);
                                    message.success('Inventory added');
                                }
                            }}
                        >
                            <ErrorMessage error={error} />
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'This field is required' }]}
                            >
                                <Input value={inventoryName} onChange={e => setInventoryName(e.target.value)} />
                            </Form.Item>

                            <Form.Item {...tailLayout}>
                                <Button type="primary" htmlType="submit" disabled={loading}>
                                    Add{loading && 'ing'} Inventory
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                )}
            </Mutation>
            <Button onClick={() => setModalIsVisible(true)}>Add Inventory</Button>
        </div>
    )
}
export default Inventories;