import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Header({ session, supabase }: { session: any, supabase: any }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Navbar bg="primary" variant="dark">
      <Container className="d-flex justify-content-between">
        <div style={{ width: '33%' }}></div>
        <Navbar.Brand href="/" style={{ width: '33%', textAlign: 'center' }}>Scrum AI</Navbar.Brand>
        <Nav className="d-flex align-items-end" style={{ width: '33%', justifyContent: 'flex-end' }}>
          {session ? (
            <>
              <Nav.Link href="#email">{session.user.email}</Nav.Link>
              <Nav.Link href="#logout" onClick={handleLogout}>Logout</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link href="#login">Log in</Nav.Link>
              <Nav.Link href="#signup">Sign up for free!</Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;