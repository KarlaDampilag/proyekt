import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';

import { endpoint, prodEndpoint } from '../config';
import { LOCAL_STATE_QUERY } from '../components/Products';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : prodEndpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers
      });
    },
    // // local data
    // clientState: {
    //   resolvers: {
    //     Mutation: {
    //       toggleAddProductModal(_, variables, { cache }) {
    //         // read the cartOpen value from the cache
    //         const { addProductModalOpen } = cache.readQuery({
    //           query: LOCAL_STATE_QUERY
    //         });
    //         // write the cart state to be the opposite
    //         const data = {
    //           data: { addProductModalOpen: !addProductModalOpen }
    //         }
    //         cache.writeData(data);
    //         return data;
    //       }
    //     }
    //   },
    //   defaults: {
    //     addProductModalOpen: false
    //   }
    // }
  });
}

export default withApollo(createClient);
