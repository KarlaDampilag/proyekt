import * as React from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: { id: $id }) {
            id
            title
            description
            price
        }
    }
`;

const UPDATE_ITEM_MUTATION = gql`
    mutation UPDATE_ITEM_MUTATION(
        $id: ID!
        $title: String
        $description: String
        $price: Int
    ) {
        updateItem(
            id: $id
            title: $title
            description: $description
            price: $price
        ) {
            id
            title
            description
            price
        }
    }
`;

const UpdateItem = (props) => {
    const [title, setTitle] = React.useState();
    const [description, setDescription] = React.useState();
    const [price, setPrice] = React.useState();

    const handleUpdateItem = async (e, updateItemMutation) => {
        e.preventDefault();
        const response = await updateItemMutation({
            variables: {
                id: props.id,
                title,
                description
            }
        })
    }
    
    return (
        <Query query={SINGLE_ITEM_QUERY} variables={{ id: props.id }}>
            {({data, loading}) => {
                if (loading) return <p>Loading...</p>
                if (!data.item) return <p>No item found!</p>
                return (
                    <Mutation
                        mutation={UPDATE_ITEM_MUTATION}
                        variables={{title, description, price}}
                    >
                        {(updateItem, { loading, error }) => ( 
                            <Form onSubmit={e => handleUpdateItem(e, updateItem)}>
                                <ErrorMessage error={error} />
                                <fieldset disabled={loading} aria-busy={loading}>
                                    <label htmlFor='title'>
                                        Title
                                        <input defaultValue={data.item.title} onChange={(e) => setTitle(e.target.value)} type='text' id='title' name='title' placeholder='title' required />
                                    </label>
                                    <label htmlFor='price'>
                                        Price
                                        <input defaultValue={data.item.price} onChange={(e) => setPrice(parseFloat(e.target.value))} type='text' inputMode='numeric' pattern='[0-9]*' id='price' name='price' placeholder='price' required />
                                    </label>
                                    <label htmlFor='description'>
                                        Description
                                        <textarea defaultValue={data.item.description} onChange={(e) => setDescription(e.target.value)} id='description' name='description' placeholder='description' />
                                    </label>
                                    <button type='submit'>{loading ? 'Saving' : 'Save Changes'}</button>
                                </fieldset>
                            </Form>
                        )}
                    </Mutation>
                )
            }}
        </Query>
    )
}

export default UpdateItem;
export { UPDATE_ITEM_MUTATION };