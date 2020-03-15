import Link from 'next/link';

import NavStyles from './styles/NavStyles';
import SignOut from './SignOut';

const Nav = (props) => {
  return (
    <NavStyles>
      {props.user && props.user.email}
      <Link href="/">
        <a>Shop</a>
      </Link>
      {props.user && (
        <>
          <Link href="/">
            <a>Sell</a>
          </Link>
          <Link href="/">
            <a>Orders</a>
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