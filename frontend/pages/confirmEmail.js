import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { CURRENT_USER_QUERY } from '../components/User';
import ConfirmEmail from '../components/ConfirmEmail';
import ErrorMessage from '../components/ErrorMessage';

const CONFIRM_EMAIL_MUTATION = gql`
  mutation CONFIRM_EMAIL_MUTATION($confirmEmailToken: String!, $email: String!) {
    confirmEmail(confirmEmailToken: $confirmEmailToken, email: $email) {
        id
        email
    }
  }
`;

const ConfirmEmailPage = (props) => {
    return (
        <Mutation
            mutation={CONFIRM_EMAIL_MUTATION}
            variables={{ confirmEmailToken: props.query.confirmEmailToken, email: props.query.email }}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        >
            {(mutateIntegration, { data, loading, error }) => (
                <>
                    <ConfirmEmail mutateIntegration={mutateIntegration} />
                    <ErrorMessage error={error} />
                </>
            )}
        </Mutation>
    );
}
export default ConfirmEmailPage;