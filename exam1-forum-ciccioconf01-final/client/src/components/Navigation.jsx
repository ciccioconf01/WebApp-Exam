import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navbar, Nav, Form, Button } from 'react-bootstrap';
import { LoginButton, LogoutButton } from './Auth';
import { useNavigate } from 'react-router';

const Navigation = (props) => {
  const navigate = useNavigate();

  return (
    <Navbar bg="primary" expand="md" variant="dark" className="navbar-padding shadow-sm">
      <Navbar.Brand className="mx-2">
        <i className="bi bi-chat-dots me-2" />
        <span className="fw-bold">FORUM</span>
      </Navbar.Brand>

      <Nav className="ms-auto align-items-center">
        <Button
          variant="light"
          className="mx-2"
          onClick={() => navigate('/')}
        >
          Home
        </Button>

        {props.user && props.user.name && (
          <Navbar.Text className="mx-2 fs-6">
            <i className="bi bi-person-circle me-2"></i>
            Welcome, <span className="fw-semibold">{props.user.name}</span>
            {props.loggedInTotp && <span className="text-warning">(2FA)</span>}
          </Navbar.Text>
        )}

        <Form className="mx-2">
          {props.loggedIn ? <LogoutButton logout={props.logout} /> : <LoginButton />}
        </Form>
      </Nav>
    </Navbar>
  );
}

export { Navigation };