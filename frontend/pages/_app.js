import App from 'next/app';
import { ApolloProvider } from 'react-apollo';
import withData from '../lib/withData';
import Page from '../components/Page';

import 'antd/dist/antd.css';
import 'react-phone-number-input/style.css';

class MyApp extends App {
    static async getInitialProps({ Component, ctx }) { // special next.js lifecycle method
        let pageProps = {};
        if (Component.getInitialProps) {
            pageProps = await Component.getInitialProps(ctx);
        }
        pageProps.query = ctx.query;
        return { pageProps };
    }

    render () {
        const { Component, apollo, pageProps } = this.props;
        return (
                <ApolloProvider client={apollo}>
                    <Page>
                        <Component {...pageProps} />
                    </Page>
                </ApolloProvider>
        )
    }
}
export default withData(MyApp);