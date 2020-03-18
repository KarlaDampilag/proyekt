import * as _ from 'lodash';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { Modal, Button, Input, Form, Spin, Select } from 'antd';

import { userContext } from './Page';
import { perPage } from '../config';
import ErrorMessage from './ErrorMessage';
import Pagination from './Pagination';
import Product from './Product';

const { Option } = Select;

const ALL_PRODUCTS_QUERY = gql`
    query ALL_PRODUCTS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
        products(first: $first, skip: $skip, orderBy: createdAt_DESC) {
            id
            name
            salePrice
            unit
            categories
            image
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

const CREATE_CATEGORIES_MUTATION = gql`
    mutation CREATE_CATEGORIES_MUTATION($names: [String!]!) {
        createCategories(names: $names)
    }
`;

const ProductsList = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 60px;
    max-width: ${props => props.theme.maxWidth};
    margin: 0 auto;
`;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

const Products = (props) => {
    const [showAddProductModal, setShowAddProductModal] = React.useState();
    const [name, setName] = React.useState();
    const [salePrice, setSalePrice] = React.useState();
    const [costPrice, setCostPrice] = React.useState();
    const [unit, setUnit] = React.useState();
    const [notes, setNotes] = React.useState();
    const [categories, setCategories] = React.useState();
    const [image, setImage] = React.useState();
    const [largeImage, setLargeImage] = React.useState();
    const [isLoading, setIsLoading] = React.useState();
    const [newCategories, setNewCategories] = React.useState();

    const update = (cache, payload) => {
        // Read cache for the products
        const data = cache.readQuery({ query: ALL_PRODUCTS_QUERY });

        // Add the new product
        data.products.push(payload.data.createProduct);
        data.products = _.sortBy(data.products, 'createdAt');

        // Put the updated products back in the cache
        cache.writeQuery({ query: ALL_PRODUCTS_QUERY, data })
    }

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

    // console.log(categories)
    const [form] = Form.useForm();

    return (
        <userContext.Consumer>
            {value => {
                if (!value) {
                    return <p>You must be logged in to access this page.</p>
                }
                return (
                    <>
                        <div><Button onClick={() => setShowAddProductModal(true)}>Add Product</Button></div>
                        <Pagination page={props.page} />
                        <Query query={ALL_PRODUCTS_QUERY} variables={{
                            skip: props.page * perPage - perPage
                        }}>
                            {({ data, error, loading }) => (
                                <>
                                    {
                                        loading ? <Spin />
                                            : error ? <ErrorMessage error={error} />
                                                : data.products && <ProductsList>{data.products.map(product => <Product product={product} key={product.id} />)}</ProductsList>
                                    }

                                    <Mutation
                                        mutation={CREATE_PRODUCT_MUTATION}
                                        variables={{ name, salePrice, costPrice, unit, notes, image, largeImage, categories }}
                                        update={update}
                                    >
                                        {(createProduct, { loading, error }) => {
                                            const createProductLoading = loading;
                                            return (
                                                <Query query={ALL_CATEGORIES_QUERY}>
                                                    {({ data, loading, error }) => {
                                                        if (data && data.categories) {
                                                            const options = _.map(data.categories, category => category.name);
                                                            return (
                                                                <Mutation mutation={CREATE_CATEGORIES_MUTATION} variables={{ names: newCategories }}>
                                                                    {(createCategories, { loading, error }) => (
                                                                        <>
                                                                            <Modal visible={showAddProductModal} onCancel={() => setShowAddProductModal(false)} footer={null}>
                                                                                <Form {...layout} form={form} onFinish={async () => {
                                                                                    let response = await createProduct();

                                                                                    if (newCategories && newCategories.length > 0) {
                                                                                        response = await createCategories();
                                                                                    }

                                                                                    setShowAddProductModal(false);
                                                                                    form.resetFields();
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

                                                                                        <Select value={categories} mode='tags' onChange={value => {
                                                                                            setCategories(value);
                                                                                            const newCategoriesToSave = value.filter(category => options.indexOf(category) < 0);
                                                                                            setNewCategories(newCategoriesToSave);
                                                                                        }}>
                                                                                            {
                                                                                                options.map((option, key) => (
                                                                                                    <Option value={option} key={key}>{option}</Option>
                                                                                                ))
                                                                                            }
                                                                                        </Select>

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
                                                                                        <Button type="primary" htmlType="submit" disabled={isLoading || loading || createProductLoading}>
                                                                                            Add{createProductLoading && 'ing'} Product
                                                                            </Button>
                                                                                        <Button onClick={() => setShowAddProductModal(false)}>Cancel</Button>
                                                                                    </Form.Item>
                                                                                </Form>
                                                                            </Modal>
                                                                        </>
                                                                    )}
                                                                </Mutation>
                                                            );
                                                        }
                                                        return null
                                                    }}
                                                </Query>
                                            );
                                        }}
                                    </Mutation>
                                </>
                            )}
                        </Query>
                        <Pagination page={props.page} />
                    </>
                );
            }}
        </userContext.Consumer>
    );
}
export default Products;
export { layout, tailLayout, ALL_CATEGORIES_QUERY, CREATE_CATEGORIES_MUTATION, ALL_PRODUCTS_QUERY };