import Link from 'next/link';

import NavStyles from './styles/NavStyles';
import SignOut from './SignOut';

const Nav = (props) => {
  return (
    <NavStyles>
      {props.user && props.user.email}
      {props.user && (
        <>
          <Link href="/products">
            <a>Products</a>
          </Link>
          <Link href="/">
            <a>Sales</a>
          </Link>
          <Link href="/inventories">
            <a>Inventories</a>
          </Link>
          <Link href="/customers">
            <a>Customers</a>
          </Link>
          <Link href="/me">
            <a>Account</a>
          </Link>
          <SignOut />
        </>
      )}
      {!props.user && (
        <Link href="/signup">
          <a>Sign In</a>
        </Link>

      )}
    </NavStyles>
  );
}

export default Nav;