import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Container, Row, Col, Button, Alert, Breadcrumb, Card, Form } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <header className="App-header">

        <Container>
        <Form>
          <Row>
            <Col md>
              <Form.Group controlId="formEmail">
                <Form.Label>email address</Form.Label>
                <Form.Control type="email" placeholder="example@email.com" />
              </Form.Group>
            </Col>
            <Col md>
              <Form.Group controlId='formPassword'>
                <Form.Label>password</Form.Label>
                <Form.Control type="password" placeholder="password" />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="secondary" type="submit" className="mt-3">login</Button>
        </Form>

        <Card className="mb-3 mt-3">
          <Card.Img src="https://b2255521.smushcdn.com/2255521/wp-content/uploads/2018/01/playa-dominical-surf-spots-costa-rica-2.jpg?lossy=2&strip=1&webp=1" style={{ height: "10%" }} />
          <Card.Body>
            <Card.Title>
              Card example
            </Card.Title>
            <Card.Text>
              This is an example of React Bootstrap cards
            </Card.Text>
            <Button variant="primary">read more</Button>
          </Card.Body>
        </Card>

        <Breadcrumb>
          <Breadcrumb.Item>test 1</Breadcrumb.Item>
          <Breadcrumb.Item>test 2</Breadcrumb.Item>
          <Breadcrumb.Item active variant="success">test 3</Breadcrumb.Item>
        </Breadcrumb>

        <Alert variant="success">this is a button</Alert>

        <Button>test button</Button>
        </Container>
        
      </header>
    </div>
  );
}

export default App;
