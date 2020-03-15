import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { Modal, Button, Input, Form, Spin } from 'antd';

import formatMoney from '../lib/formatMoney';

const CREATE_PRODUCT_MUTATION = gql`
    mutation CREATE_PRODUCT_MUTATION(
        $name: String!
        $salePrice: String!
        $costPrice: String
        $unit: String
        $notes: String
        $image: String
        $largeImage: String
    ) {
        createProduct(
            name: $name
            salePrice: $salePrice
            costPrice: $costPrice
            unit: $unit
            notes: $notes
            image: $image
            largeImage: $largeImage
        ) {
            id
        }
    }
`;

const Products = (props) => {
    const [showAddProductModal, setShowAddProductModal] = React.useState();
    const [name, setName] = React.useState();
    const [salePrice, setSalePrice] = React.useState();
    const [costPrice, setCostPrice] = React.useState();
    const [unit, setUnit] = React.useState();
    const [notes, setNotes] = React.useState();
    const [image, setImage] = React.useState();
    const [largeImage, setLargeImage] = React.useState();
    const [isLoading, setIsLoading] = React.useState();

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
        setImage(file.secure_url);
        setLargeImage(file.eager[0].secure_url);
        setIsLoading(false);
    }

    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };
    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };

    console.log(salePrice)

    return (
        <Mutation mutation={CREATE_PRODUCT_MUTATION} variables={{ name, salePrice, costPrice, unit, notes, image, largeImage }}>
            {(createProduct, { loading, error }) => (
                <>
                    <Modal visible={showAddProductModal} onCancel={() => setShowAddProductModal(false)} footer={null}>
                        <Form {...layout} onFinish={async () => {
                            const response = await createProduct();
                            console.log(response);
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
                                <Button type="primary" htmlType="submit" disabled={isLoading}>Add Product</Button>
                                <Button onClick={() => setShowAddProductModal(false)}>Cancel</Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                    <Button onClick={() => setShowAddProductModal(true)}>Add Product</Button>
                </>
            )}
        </Mutation>
    )
}
export default Products;