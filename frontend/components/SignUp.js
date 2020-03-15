import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION($email: String!, $password: String!, $confirmPassword: String!) {
    signUp(email: $email, password: $password, confirmPassword: $confirmPassword) {
      id
      email
    }
  }
`;

const SignUp = () => {
  const [email, setEmail] = React.useState();
  const [password, setPassword] = React.useState();
  const [confirmPassword, setConfirmPassword] = React.useState();

  return (
    <Mutation
      mutation={SIGNUP_MUTATION}
      variables={{email, password, confirmPassword}}
      refetchQueries={[{ query: CURRENT_USER_QUERY }]}
    >
      {(signUp, { error, loading }) => (
        <Form
          method="post"
          onSubmit={async e => {
            e.preventDefault();
            await signUp();
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}
        >
          <fieldset disabled={loading} aria-busy={loading}>
            <h2>Sign Up for An Account</h2>
            <Error error={error} />
            <label htmlFor="email">
              Email
                <input
                type="email"
                name="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </label>
            <label htmlFor="password">
              Password
                <input
                type="password"
                name="password"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </label>
            <label htmlFor="confirmPassword">
              Confirm Password
                <input
                type="password"
                name="confirmPassword"
                placeholder="confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </label>

            <button type="submit">Sign Up!</button>
          </fieldset>
        </Form>
      )}
    </Mutation>
  );
}

export default SignUp;