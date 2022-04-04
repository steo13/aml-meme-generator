import { Modal, Form, Button, Alert, Col, Row, Spinner } from 'react-bootstrap';
import { useState } from 'react';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [validEmail, setValidEmail] = useState(true);
  const [validPass, setValidPass] = useState(true);
  
  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('')
      const credentials = { username, password };
      
      // SOME VALIDATION, ADD MORE!!!
      setValidEmail(validateEmail(username))
      setValidPass(validatePassword(password))

      if(validateEmail(username) && validatePassword(password)){
        props.login(credentials)
          .catch((err) => { setErrorMessage(err); } )
      }else
        // show a better error message...
        setErrorMessage('Error(s) in the form, please fix it.')
  };

  return (<>
      <div id="loading-screen">
        <h1>Loading...</h1> 
        <p>Stay connected with us!</p>
        <Spinner animation="border" role="status"></Spinner>
      </div>
      <Modal size="lg" show={true} backdrop='static' animation={false} centered>
          <Modal.Header>
              <Modal.Title id="contained-modal-title-vcenter">Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group as={Row} className="mb-2">
                      <Form.Label column sm="2">Email:</Form.Label>
                      <Col sm="10">
                          <Form.Control isInvalid={!validEmail} type='email' placeholder='Enter your email' value={username} onChange={ev => setUsername(ev.target.value)}></Form.Control>
                          <Form.Control.Feedback type="invalid">A valid email required.</Form.Control.Feedback>
                      </Col>
                  </Form.Group>
                  {' '}
                  <Form.Group as={Row}>
                      <Form.Label column sm="2">Password:</Form.Label>
                      <Col sm="10">
                          <Form.Control isInvalid={!validPass} type='password' placeholder='Enter your password' value={password} onChange={ev => setPassword(ev.target.value)}></Form.Control>
                          <Form.Control.Feedback type="invalid">A valid password is required.</Form.Control.Feedback>
                          <Form.Text id="passwordHelpBlock" muted>
                              Your password must be 6-20 characters long, contain letters 
                              (at least one upper case and one lower case letter) and numbers, 
                              and must not contain spaces, special characters, or emoji.
                          </Form.Text>
                      </Col>
                  </Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer>
              {errorMessage ? <Alert variant='danger'>{errorMessage}</Alert> : ''}
              {props.message ? <Alert variant='danger'>{props.message}</Alert> : ''}
              <Button variant='outline-success' onClick={handleSubmit}>Login</Button>
              <Button variant='outline-primary' onClick={props.user}>Continue as a user</Button>
          </Modal.Footer>
      </Modal>
    </>
  )
}

function validateEmail (username){
if (username === '' || !username.match('@'))
  return false;
else
  return true;
}

function validatePassword (password) {
  if (password.length < 6 || password.length > 20)
    return false

  var lower = false
  var upper = false
  var numbers = false
  var special = false

  String(password).split('').forEach(c => {
  if (Number(c)) 
      numbers = true
    else 
      if (c.toUpperCase() === c) 
          upper = true
      else 
          if (c.toLowerCase() === c) 
              lower = true
    else special = true
  })

  return lower && upper && numbers && !special
}

export default LoginForm;