const Home = props => (
    <div>
        Hello {props.query.page || 1}
    </div>
);

export default Home;