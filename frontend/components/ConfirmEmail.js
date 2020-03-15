import * as react from 'react';
import Router from 'next/router'
import ErrorMessage from './ErrorMessage';

const ConfirmEmail = (props) => {

  React.useEffect(() => {
    props.mutateIntegration().then(result => {
      Router.push('/');
    }).catch(err => console.log(err));
  }, []);

  return (
    <p>{`Successfully verified. Redirecting...`}</p>
  )
}

export default ConfirmEmail;