import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Modal, Button, Input, Form, message } from 'antd';
import PhoneInput from 'react-phone-number-input';

import { layout, tailLayout } from './AddProductButton';
import { ALL_CUSTOMERS_QUERY } from './Customers';

const CREATE_CUSTOMER_MUTATION = gql`
mutation CREATE_CUSTOMER_MUTATION(
    $name: String!
    $email: String
    $phone: String
    $street1: String
    $street2: String
    $city: String
    $state: String
    $zipCode: Int
    $country: String
) {
    createCustomer(
        name: $name
        email: $email
        phone: $phone
        street1: $street1
        street2: $street2
        city: $city
        state: $state
        zipCode: $zipCode
        country: $country
    ) {
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

const AddCustomerButton = () => {
    const [name, setName] = React.useState();
    const [email, setEmail] = React.useState();
    const [phone, setPhone] = React.useState();
    const [addressId, setAddressId] = React.useState();
    const [street1, setStreet1] = React.useState();
    const [street2, setStreet2] = React.useState();
    const [city, setCity] = React.useState();
    const [state, setState] = React.useState();
    const [zipCode, setZipCode] = React.useState();
    const [country, setCountry] = React.useState();
    const [isShowingModal, setIsShowingModal] = React.useState(false);

    const [form] = Form.useForm();

    const update = (cache, payload) => {
        const data = cache.readQuery({ query: ALL_CUSTOMERS_QUERY });
        data.customers.push(payload.data.createCustomer);
        data.customers = _.sortBy(data.customers, 'createdAt');
        cache.writeQuery({ query: ALL_CUSTOMERS_QUERY, data })
    }

    const renderTriggerButton = () => {
        return (
            <Button onClick={() => setIsShowingModal(true)}>Add Customer</Button>
        );
    }
    return (
        <>
            <Mutation
                mutation={CREATE_CUSTOMER_MUTATION}
                variables={{ name, email, phone, street1, street2, city, state, zipCode, country }}
                update={update}
            >
                {(createCustomer, { loading, error }) => {
                    return (
                        <Modal title='Add a Customer' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
                            <Form {...layout} form={form} onFinish={async () => {
                                const response = await createCustomer();

                                if (error) {
                                    message.error(error.message.replace('GraphQL error: ', ''));
                                } else {
                                    setIsShowingModal(false);
                                    form.resetFields();
                                    message.success('Customer added');
                                }

                            }}>
                                <Form.Item
                                    label="Name"
                                    name="name"
                                    rules={[{ required: true, message: 'This field is required' }]}
                                >
                                    <Input value={name} onChange={e => setName(e.target.value)} />
                                </Form.Item>

                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[{ type: 'email' }]}
                                >
                                    <Input value={name} onChange={e => setEmail(e.target.value)} />
                                </Form.Item>

                                <Form.Item
                                    label="Phone"
                                    name="phone"
                                >
                                    <PhoneInput value={phone} onChange={setPhone} />
                                </Form.Item>

                                <Form.Item
                                    label="Street1"
                                    name="street1"
                                >
                                    <Input value={street1} onChange={e => setStreet1(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="Street2"
                                    name="street2"
                                >
                                    <Input value={street2} onChange={e => setStreet2(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="City"
                                    name="city"
                                >
                                    <Input value={city} onChange={e => setCity(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="State"
                                    name="state"
                                >
                                    <Input value={state} onChange={e => setState(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="Zip Code"
                                    name="zipCode"
                                >
                                    <Input type='number' value={zipCode} onChange={e => setZipCode(e.target.value)} />
                                </Form.Item>
                                <Form.Item
                                    label="Country"
                                    name="country"
                                >
                                    <Input value={country} onChange={e => setCountry(e.target.value)} />
                                </Form.Item>

                                <Form.Item {...tailLayout}>
                                    <Button type="primary" htmlType="submit" disabled={loading}>Add{loading && 'ing'} Customer</Button>
                                    <Button onClick={() => setIsShowingModal(false)}>Cancel</Button>
                                </Form.Item>
                            </Form>
                        </Modal>
                    );
                }}
            </Mutation>
            {renderTriggerButton()}
        </>
    )
}

export default AddCustomerButton;