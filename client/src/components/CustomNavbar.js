import  React  from 'react';
import { Navbar, Dropdown } from 'react-bootstrap';

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
      href="/"
      ref={ref}
      onClick={e => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {/* Render custom icon here */}
      <img src="images/user.png" title="User tools" height='40' id="action-img" alt=''/>
      {children}
    </a>
  ));

function CustomNavbar(props){
    return(
        <Navbar bg='secondary' variant='dark'>
            <Navbar.Brand className='d-flex flex-fill justify-content-center'>
                <img src='icon.png' width='60' height='40' alt=''/>
                <b className='mx-2'>Meme Generator</b>
                <Dropdown className="mr-2">
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components"/>
                    <Dropdown.Menu>
                        { props.loggedIn ? <>
                            <Dropdown.Header>Welcome {props.creator.name}!</Dropdown.Header>
                            <Dropdown.Divider/>
                            <Dropdown.Item onClick={() => props.logout()}>Logout</Dropdown.Item>
                            </> : 
                            <Dropdown.Item onClick={() => props.login()}>Login</Dropdown.Item>}
                    </Dropdown.Menu>
                </Dropdown>
            </Navbar.Brand>
        </Navbar>
    )
}

export default CustomNavbar;