import Products from '../components/Products';
const ProductsPage = (props) => {
    const page = parseInt(props.query.page);
    return <Products page={page || 1} />
}
export default ProductsPage;