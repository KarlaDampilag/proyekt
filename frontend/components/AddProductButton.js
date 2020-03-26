import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Modal, Button, Input, Form, Select, Spin, message } from 'antd';

import { ALL_PRODUCTS_QUERY } from './Products';
import CategoriesInput from './CategoriesInput';

const CREATE_PRODUCT_MUTATION = gql`
mutation CREATE_PRODUCT_MUTATION(
    $name: String!
    $salePrice: String!
    $costPrice: String
    $unit: String
    $notes: String
    $image: String
    $largeImage: String
    $categories: [String!]
) {
    createProduct(
        name: $name
        salePrice: $salePrice
        costPrice: $costPrice
        unit: $unit
        notes: $notes
        image: $image
        largeImage: $largeImage
        categories: $categories
    ) {
        id
        name
        salePrice
        costPrice
        unit
        notes
        image
        largeImage
        categories
        createdAt
    }
}
`;

const ALL_CATEGORIES_QUERY = gql`
    query ALL_CATEGORIES_QUERY {
        categories {
            id
            name
        }
    }
`;

const CREATE_CATEGORIES_MUTATION = gql`
    mutation CREATE_CATEGORIES_MUTATION($names: [String!]!) {
        createCategories(names: $names)
    }
`;

const AddProductButton = () => {
    const [name, setName] = React.useState();
    const [salePrice, setSalePrice] = React.useState();
    const [costPrice, setCostPrice] = React.useState();
    const [unit, setUnit] = React.useState();
    const [notes, setNotes] = React.useState();
    const [image, setImage] = React.useState();
    const [largeImage, setLargeImage] = React.useState();
    const [categories, setCategories] = React.useState();
    const [newCategories, setNewCategories] = React.useState();
    const [isShowingModal, setIsShowingModal] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState();

    const [form] = Form.useForm();

    const uploadFile = async (e) => {
        const files = e.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'sickfits'); // needed by Cloudinary

        setIsLoading(true);
        const response = await fetch('https://api.cloudinary.com/v1_1/dlki0o7xf/image/upload', {
            method: 'POST',
            body: data
        });

        const file = await response.json();
        if (file && file.secure_url && file.eager) {
            setImage(file.secure_url);
            setLargeImage(file.eager[0].secure_url);
        } else {
            setImage(null);
            setLargeImage(null);
        }
        setIsLoading(false);
    }

    const update = (cache, payload) => {
        // Read cache for the products
        const data = cache.readQuery({ query: ALL_PRODUCTS_QUERY });

        // Add the new product
        data.products.push(payload.data.createProduct);
        data.products = _.sortBy(data.products, 'createdAt');

        // Put the updated products back in the cache
        cache.writeQuery({ query: ALL_PRODUCTS_QUERY, data })
    }

    const renderTriggerButton = () => {
        return (
            <Button onClick={() => setIsShowingModal(true)}>AddProduct</Button>
        );
    }

    return (
        <>
            <Mutation
                mutation={CREATE_PRODUCT_MUTATION}
                variables={{ name, salePrice, costPrice, unit, notes, image, largeImage, categories }}
                update={update}
            >
                {(createProduct, { loading, error }) => (
                    <Mutation mutation={CREATE_CATEGORIES_MUTATION} variables={{ names: newCategories }}>
                        {(createCategories, { loading, error }) => (
                            <Modal title='Add a Product' visible={isShowingModal} onCancel={() => setIsShowingModal(false)} footer={null}>
                                <Form {...layout} form={form} onFinish={async () => {
                                    let response = await createProduct();

                                    if (newCategories && newCategories.length > 0) {
                                        response = await createCategories();
                                    }

                                    if (error) {
                                        message.error(error.message.replace('GraphQL error: ', ''));
                                    } else {
                                        setIsShowingModal(false);
                                        form.resetFields();
                                        message.success('Product added');
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
                                        label="Sale Price"
                                        name="salePrice"
                                        rules={[{ required: true, message: 'This field is required' }]}
                                    >
                                        <Input type='number' onChange={e => setSalePrice(e.target.value.toString())} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Cost Price"
                                        name="costPrice"
                                    >
                                        <Input type='number' onChange={e => setCostPrice(e.target.value.toString())} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Unit"
                                        name="unit"
                                    >
                                        <Input value={unit} onChange={e => setUnit(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Categories"
                                        name="categories"
                                    >
                                        <Query query={ALL_CATEGORIES_QUERY}>
                                            {({ data }) => {
                                                const options = _.map(data.categories, category => category.name);
                                                return (
                                                    <Select
                                                        value={categories}
                                                        mode='tags'
                                                        placeholder='Start typing to add...'
                                                        onChange={value => {
                                                            setCategories(value);
                                                            const newCategoriesToSave = _.filter(value, category => options.indexOf(category) < 0);
                                                            setNewCategories(newCategoriesToSave);
                                                        }}
                                                    >
                                                        {
                                                            _.map(options, (option, key) => (
                                                                <Select.Option value={option} key={key}>{option}</Select.Option>
                                                            ))
                                                        }
                                                    </Select>
                                                );
                                            }}
                                        </Query>
                                    </Form.Item>

                                    <Form.Item
                                        label="Notes"
                                        name="notes"
                                    >
                                        <Input value={notes} onChange={e => setNotes(e.target.value)} />
                                    </Form.Item>

                                    <Form.Item
                                        label="Image"
                                        name="image"
                                    >
                                        <Input type='file' placeholder='Upload an image' onChange={uploadFile} />
                                        {isLoading && <Spin />}
                                        {image && <img src={image} width='200' alt='upload preview' />}
                                    </Form.Item>

                                    <Form.Item {...tailLayout}>
                                        <Button type="primary" htmlType="submit" disabled={isLoading || loading}>Add{loading && 'ing'} Product</Button>
                                        <Button onClick={() => setIsShowingModal(false)}>Cancel</Button>
                                    </Form.Item>
                                </Form>
                            </Modal>
                        )}
                    </Mutation>
                )}
            </Mutation>
            {renderTriggerButton()}
        </>
    )
}

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

export default AddProductButton;
export { layout, tailLayout, ALL_CATEGORIES_QUERY, CREATE_CATEGORIES_MUTATION };