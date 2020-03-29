import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Modal, Form, Input, Select, Button, message, Spin } from 'antd';
import styled from 'styled-components';

import { layout, tailLayout } from './AddProductButton';
import { ALL_SALE_ITEMS_QUERY } from './Sales';
import { ALL_PRODUCTS_QUERY } from './Products';

const CREATE_SALE_MUTATION = gql`
    mutation CREATE_SALE_MUTATION($name: String!) {
        createSale(name: $name) {
            id
            name
            createdAt
        }
    }
`;

const FormRow = styled.div`
    margin-bottom: 15px;
    display: flex;
    justify-content: space-evenly;
    label {
        flex-grow: 1;
        flex-basis: 0;
    }
    .x-container {
        flex-grow: 0;
        align-self: flex-end;
        padding: 5px;
    }
    .first-label {
        flex-grow: 2;
        padding-right: 10px;
    }
`;

const AddSaleButton = () => {
    const [modalIsVisible, setModalIsVisible] = React.useState();
    const [saleItems, setSaleItems] = React.useState([{
        product: null,
        quantity: 1
    }]);
    const [customer, setCustomer] = React.useState();
    const [discountType, setDiscountType] = React.useState();
    const [discountValue, setDiscountValue] = React.useState();
    const [taxType, setTaxType] = React.useState();
    const [taxValue, setTaxValue] = React.useState();
    const [shipping, setShipping] = React.useState();
    const [note, setNote] = React.useState();

    const [form] = Form.useForm();

    const update = (cache, payload) => {
        const data = cache.readQuery({ query: ALL_SALE_ITEMS_QUERY });
        data.sales.push(payload.data.createSale);
        data.sales = _.sortBy(data.sales, 'createdAt');
        cache.writeQuery({ query: ALL_SALE_ITEMS_QUERY, data })
    }

    const handleSaleItemChange = (saleItem, value, property) => {
        const updatedSaleItems = [...saleItems];
        const updatedSaleItem = { ...saleItem };
        updatedSaleItem[property] = value;
        const index = _.findIndex(updatedSaleItems, saleItem);
        updatedSaleItems.splice(index, 1, updatedSaleItem);
        setSaleItems(updatedSaleItems);
    }

    return (
        <>
            <Mutation
                mutation={CREATE_SALE_MUTATION}
                variables={{ name }}
                update={update}
            >
                {(createSale, { loading, error }) => (
                    <Modal
                        title="Add a Sale Record"
                        visible={modalIsVisible}
                        onCancel={() => setModalIsVisible(false)}
                        footer={null}
                    >
                        <Form
                            form={form}
                            onFinish={async () => {
                                const response = await createSale();
                                if (error) {
                                    message.error(error.message.replace('GraphQL error: ', ''));
                                } else {
                                    setModalIsVisible(false);
                                    form.resetFields();
                                    message.success('Sale record added');
                                }
                            }}
                        >
                            <Query query={ALL_PRODUCTS_QUERY}>
                                {({ data, loading, error }) => {
                                    return (
                                        _.map(saleItems, (saleItem, key) => {
                                            return (
                                                <FormRow key={key}>
                                                    <label className='first-label'>
                                                        <span>Product</span>
                                                        <Select
                                                            style={{ width: '100%' }}
                                                            value={saleItem.product}
                                                            onChange={(value) => handleSaleItemChange(saleItem, value, 'product')}
                                                        >
                                                            {
                                                                _.map(data.products, product =>
                                                                    <Select.Option value={product.id} key={product.id}>{product.name}</Select.Option>
                                                                )
                                                            }
                                                        </Select>
                                                    </label>

                                                    <label>
                                                        <span>Quantity</span>
                                                        <Input
                                                            type='number'
                                                            value={saleItem.quantity}
                                                            onChange={(e) => handleSaleItemChange(saleItem, e.target.value, 'quantity')}
                                                        />
                                                    </label>

                                                    <div className='x-container'>
                                                        <span
                                                            style={{ 'cursor': 'pointer', 'fontSize': '13pt' }}
                                                            onClick={() => {
                                                                let newSaleItems = [...saleItems];
                                                                newSaleItems = _.filter(newSaleItems, newSaleItem => {
                                                                    return newSaleItem != saleItem
                                                                });
                                                                setSaleItems(newSaleItems);
                                                            }}
                                                        >❌</span>
                                                    </div>
                                                </FormRow>
                                            )
                                        })
                                    );
                                }}
                            </Query>

                            <Form.Item>
                                <Button
                                    style={{ 'marginTop': '15px' }}
                                    onClick={() => {
                                        const newSaleItems = [...saleItems];
                                        newSaleItems.push({
                                            product: null,
                                            quantity: 1
                                        });
                                        setSaleItems(newSaleItems);
                                    }}
                                >➕ Add Product</Button>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" disabled={loading} style={{ width: '100%' }}>
                                    Add{loading ? 'ing' : ' '} Sale Record
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                )}
            </Mutation>
            <div><Button onClick={() => setModalIsVisible(true)}>Add Sale Record</Button></div>
        </>
    )
}
export default AddSaleButton;