import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useEffect, useState } from 'react'

function Header({ session, supabase }: { session: any, supabase: any }) {

  const [username, setUsername] = useState('')

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session) return;

      const { data: UsersData, error } = await supabase
        .from('UserData')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error) {
        console.log('Error: ', error.message);
      } else {
        setUsername(UsersData.username);
      }
    };

    fetchUserData();
  }, [supabase, session]);

  return (
    <Navbar bg="primary" variant="dark">
      <Container className="d-flex justify-content-between">
        <div style={{ width: '33%' }}></div>
        <Navbar.Brand href="/" style={{ width: '33%', textAlign: 'center' }}>Scrum AI</Navbar.Brand>
        <Nav className="d-flex align-items-end" style={{ width: '33%', justifyContent: 'flex-end' }}>
          {session ? (
            <>
              <Nav.Link eventKey="disabled" disabled>
                {username}
              </Nav.Link>
              <Nav.Link href="" onClick={handleLogout}>Logout</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link href="/login">Log in</Nav.Link>
              <Nav.Link href="/signup">Sign up for free!</Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;