import React from 'react';
import UpdateCustomer from '../components/UpdateCustomer';

const UpdateCustomerPage = (props) => {
    return (
        <>
            <UpdateCustomer id={props.query.id} />
        </>
    )
}
export default UpdateCustomerPage;