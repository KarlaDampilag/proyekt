import * as React from 'react';
import * as _ from 'lodash';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import ErrorMessage from './ErrorMessage';
import { Button, Input, Form, Spin, Select } from 'antd';

import { layout, tailLayout, ALL_CATEGORIES_QUERY, CREATE_CATEGORIES_MUTATION } from './Products';

const { Option } = Select;

const SINGLE_PRODUCT_QUERY = gql`
    query SINGLE_PRODUCT_QUERY($id: ID!) {
        product(where: { id: $id }) {
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

const UPDATE_PRODUCT_MUTATION = gql`
    mutation UPDATE_PRODUCT_MUTATION(
        $id: ID!
        $name: String
        $salePrice: String
        $costPrice: String
        $unit: String
        $notes: String
        $image: String
        $largeImage: String
        $categories: [String!]
    ) {
        updateProduct(
            id: $id
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
        }
    }
`;

const UpdateProduct = (props) => {
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

    const handleUpdateProduct = async (e, updateProductMutation) => {
        const response = await updateProductMutation({
            variables: {
                id: props.id,
                name,
                salePrice,
                costPrice,
                unit,
                notes,
                image,
                largeImage,
                categories
            }
        });
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


    return (
        <Query query={SINGLE_PRODUCT_QUERY} variables={{ id: props.id }}>
            {({ data, loading }) => {
                const productData = data;
                if (loading) return <p>Loading...</p>
                if (data && !data.product) return <p>No product found.</p>
                return (
                    <Mutation
                        mutation={UPDATE_PRODUCT_MUTATION}
                        variables={{ name, salePrice, costPrice, unit, notes, image, largeImage, categories }}
                    >
                        {(updateProduct, { loading, error }) => (
                            <Query query={ALL_CATEGORIES_QUERY}>
                                {({ data, loading, error }) => {
                                    const options = _.map(data.categories, category => category.name);
                                    return (
                                        <Mutation mutation={CREATE_CATEGORIES_MUTATION} variables={{ names: newCategories }}>
                                            {(createCategories, { loading, error }) => (
                                                <Form
                                                    {...layout}
                                                    onFinish={async e => {
                                                        handleUpdateProduct(e, updateProduct);
                                                        if (newCategories && newCategories.length > 0) {
                                                            const response = await createCategories();
                                                        }
                                                    }}
                                                >
                                                    <ErrorMessage error={error} />
                                                    <Form.Item
                                                        label="Name"
                                                        name="name"
                                                    >
                                                        <Input defaultValue={productData.product.name} onChange={e => setName(e.target.value)} />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Sale Price"
                                                        name="salePrice"
                                                    >
                                                        <Input type='number' defaultValue={productData.product.salePrice} onChange={e => setSalePrice(e.target.value.toString())} />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Cost Price"
                                                        name="costPrice"
                                                    >
                                                        <Input type='number' defaultValue={productData.product.costPrice} onChange={e => setCostPrice(e.target.value.toString())} />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Unit"
                                                        name="unit"
                                                    >
                                                        <Input defaultValue={productData.product.unit} onChange={e => setUnit(e.target.value)} />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Categories"
                                                        name="categories"
                                                    >
                                                        <Select defaultValue={productData.product.categories} mode='tags' onChange={value => {
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
                                                        <Input defaultValue={productData.product.notes} onChange={e => setNotes(e.target.value)} />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label="Image"
                                                        name="image"
                                                    >
                                                        <Input type='file' placeholder='Upload an image' onChange={uploadFile} />
                                                        {isLoading && <Spin />}
                                                        {image ? <img src={image} width='200' alt='upload preview' />
                                                            : productData.product.image && <img src={productData.product.image} width='200' alt='current image preview' />}
                                                    </Form.Item>

                                                    <Form.Item {...tailLayout}>
                                                        <Button type="primary" htmlType="submit" disabled={isLoading || loading}>
                                                            Updat{loading ? 'ing' : 'e'} Product
                                                        </Button>
                                                    </Form.Item>
                                                </Form>
                                            )}
                                        </Mutation>
                                    );
                                }}
                            </Query>
                        )}
                    </Mutation>
                )
            }}
        </Query>
    )
}

export default UpdateProduct;
export { UPDATE_PRODUCT_MUTATION };