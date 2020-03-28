import React from 'react';
import UpdateInventory from '../components/UpdateInventory';

const UpdateInventoryPage = (props) => {
    return (
        <>
            <UpdateInventory id={props.query.id} />
        </>
    )
}
export default UpdateInventoryPage;