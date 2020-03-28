import React from 'react';
import UpdateProduct from '../components/UpdateProduct';

const UpdateProductPage = (props) => {
    return (
        <>
            <UpdateProduct id={props.query.id} />
        </>
    )
}
export default UpdateProductPage;