import { ListGroup, Card, Button, Modal, Image, Form, Spinner, Col, Row, ButtonGroup, ToggleButton, Alert } from 'react-bootstrap';
import { useEffect, useState } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom';
import API from '../API'

function MemeBoard (props) {
    return (
        <div className='col mt-3 mr-3 ml-3'>
          <Switch>
            <Route path='/public'>
              <MemeList loggedIn={props.loggedIn} memes={props.memes} creator={props.creator} delete={props.delete} copy={props.copy}/>
            </Route>
            <Route path='/protected'>
              <MemeList loggedIn={props.loggedIn} memes={props.memes} creator={props.creator} delete={props.delete} copy={props.copy}/>
            </Route>
            <Route path='/'>
              <Redirect to='/public' />
            </Route>
          </Switch>
        </div>
      )
}

function MemeList (props) {
  return (
    <ListGroup variant="flush">
      {
        props.memes.map(meme => {
          return (<MemeComponent key={meme.id} meme={meme} loggedIn={props.loggedIn} creator={props.creator} delete={props.delete} copy={props.copy}/>)
        })
      }
    </ListGroup>
  )
}

function MemeComponent (props) {
  const [showMeme, setShowMeme] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showModalCopy, setShowModalCopy] = useState(false)

  let variant = null;
    switch(props.meme.status) {
      case 'added':
        variant = 'success';
        break;
      case 'copied':
        variant = 'warning';
        break;
      case 'deleted':
        variant = 'danger';
        break;
      default: break;
    }
  return (<>
      <Card border={variant} text={'dark'} className="text-center mb-2">
        <MemeTitle title={props.meme.title}/>
        <Card.Body>
          {!props.meme.status ? <Button variant="primary" onClick={() =>{ setShowMeme(props.meme.id); setShowModal(true); }}>Show the meme</Button> : <Spinner variant={variant} animation="border" role="status"/>}
        </Card.Body>
        {
          props.loggedIn && !props.meme.status ? <>
            <Card.Footer>
              {
                props.creator.id === props.meme.creator ? 
                  <>It <b>is your</b>!{' '}<DeleteMeme meme={props.meme} delete={props.delete}/>{' '}</>:
                  <>It <b>isn't your</b>!{' '}</>
              }
              <CopyMeme copy={() =>{ setShowMeme(props.meme.id); setShowModalCopy(true); }}/>
            </Card.Footer></> : props.meme.status ? 
            <Card.Footer>Loading...</Card.Footer> : ''
        }
      </Card>
      { showMeme === props.meme.id ?
        showModal ? <MemeBase show={showModal} close={() => setShowModal(false)} meme={props.meme}/> : 
        showModalCopy ?  <MemeBase show={showModalCopy} close={() => setShowModalCopy(false)} meme={props.meme} creator={props.creator} copy={props.copy}/> : '' : ''
      }
  </>)
}

function MemeTitle (props) {
  return (
    <Card.Header>{props.title}</Card.Header>
  )
}

function MemeBase (props) {
  const [texts, setTexts] = useState([])
  const [creator, setCreator] = useState(false)
  const [image, setImage] = useState(false)
  const [title, setTitle] = useState(props.meme.title)
  const [font, setFont] = useState(String(props.meme.font));
  const [colour, setColour] = useState(props.meme.colour)
  const [priv, setPriv] = useState(props.meme.private)

  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    const getImage = (id) => {
      API.getImage(id).then(img => {
        setImage(img)
      })
    }
    if (!image)
      getImage(props.meme.image)
  }, [props.meme.image, image]);

  useEffect(() => {
    const getCreator = (id) => {
      API.getCreator(id).then(crt => {
        setCreator(crt)
      })
    }

    if (!creator)
      getCreator(props.meme.creator)
    
  }, [props.meme.creator, creator])

  useEffect(() => {
    const getTexts = (id) => {
      API.getTexts(id).then(txts => {
        setTexts(txts)
      })
    }
    if (texts.length === 0 && image !== false)
      getTexts(props.meme.id)

  }, [image, props, texts])

  const modifyText = (text) => {
    setTexts(texts.map(t => {
        if (t.meme === text.meme && t.position === text.position)
            t.text = text.text
        return t
    }))
  }

  const submit = () => {
    var invalid = true;
    if (title === ''){
      invalid = true
      setInvalid(true)
    } else {
      texts.map(t => {
        if (t.text !== ''){
          invalid = false
          setInvalid(false)
        }
        return t
      })
    }
    if (invalid)
      setInvalid(true)
    else{
      props.copy({id: 0, creator: props.creator.id, image: image[0].id, private: priv, title: title, font: Number(font), colour: colour, status: 'copied'}, texts)
      props.close()
    }
    
}
  return (<>
    <Modal show={props.show} size='lg' backdrop='static' centered animation={false}>
      <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            { image && texts.length > 0 && creator && font && colour ? <>
              <Form.Group as={Row}>
                <Col><b>Title:</b></Col>
                { props.creator ? <Col md="8"><Form.Control type="text" value={title} onChange={e =>{ setTitle(e.target.value) }}></Form.Control></Col> : props.meme.title }
              </Form.Group>
            </> : <>
              <b>Title:</b> {props.meme.title} {' '}
              <Spinner animation="border" role="status"></Spinner>
            </> }
          </Modal.Title>
      </Modal.Header>
        { image && texts.length > 0 && creator ? <>
          <Modal.Body> 
            { props.creator ? 
                <Row>
                  <Col md={4}>
                    <Form.Label>Meme based on the image:</Form.Label>
                    <Image className='mt-2' src={image[0].image} thumbnail/>
                  </Col>
                  <Col>
                    {
                      texts.map((t, i) => {
                        return(
                        <Form.Group key={t.id}>
                          <Form.Label className='mt-2'>Change the text number {i}:</Form.Label>
                          <Form.Control className='mt-1' type="text" defaultValue={t.text} onChange={ev => modifyText({meme: t.meme, text: ev.target.value, position: t.position})}/>
                        </Form.Group>)
                      })
                    }
                    <Form.Label className='mt-2'>Change the colour of the texts:</Form.Label>
                    <ButtonGroup defaultChecked={texts[0].colour}>
                      <ToggleButton id='radio-3' type="radio" variant="outline-danger" value={'red'} checked={colour === 'red'} onChange={(e) => setColour(e.currentTarget.value) } > Red</ToggleButton>
                      <ToggleButton id='radio-4' type="radio" variant="outline-success" value={'green'} checked={colour === 'green'} onChange={(e) => setColour(e.currentTarget.value)}> Green</ToggleButton>
                      <ToggleButton id='radio-5' type="radio" variant="outline-warning" value={'yellow'} checked={colour === 'yellow'} onChange={(e) => setColour(e.currentTarget.value)}> Yellow</ToggleButton>
                      <ToggleButton id='radio-6' type="radio" variant="outline-primary" value={'blue'} checked={colour === 'blue'} onChange={(e) => setColour(e.currentTarget.value)}> Blue</ToggleButton>
                    </ButtonGroup>
                    <Form.Label className="mt-3">Change the font of the texts:</Form.Label>{' '}
                    <ButtonGroup>
                        <ToggleButton id='radio-1' type="radio" variant="outline-secondary" value={'1'} checked={font === '1'} onChange={(e) => setFont(e.currentTarget.value) }> Arial</ToggleButton>
                        <ToggleButton id='radio-2' type="radio" variant="outline-secondary" value={'2'} checked={font === '2'} onChange={(e) => setFont(e.currentTarget.value) }> Times new roman</ToggleButton>
                    </ButtonGroup>
                  </Col>
                </Row>
              : <> 
                <Image src={image[0].image}/> 
                {texts.map(t => {
                  return (<div key={t.id} className={`position-${t.position}-${t.image} ${colour}-${font}`}>{t.text}</div>)
                })}
              </>
            }
          </Modal.Body>
          <Modal.Footer>
            { props.creator ? props.creator.id === props.meme.creator ?
              <Col>
                <Form.Label className='mt-2'>Is it private?</Form.Label>{'\t'}
                <Form.Check inline type="radio" checked={priv} label="Yes, it is" onClick={() => { setPriv(true) }} onChange={() => {}} />
                <Form.Check inline type="radio" checked={!priv} label="No, it isn't" onClick={() => { setPriv(false) }} onChange={() => {}} />
              </Col> : 
              <>
                {
                  props.meme.private === 1 ?
                    <Col><Form.Label><b>You can't change the visibility</b></Form.Label></Col>
                  : <>
                  <Col>
                    <Form.Label className='mt-2'>Is it private?</Form.Label>{'\t'}
                    <Form.Check inline type="radio" checked={priv} label="Yes, it is" onClick={() => { setPriv(true) }} onChange={() => {}} />
                    <Form.Check inline type="radio" checked={!priv} label="No, it isn't" onClick={() => { setPriv(false) }} onChange={() => {}} />
                  </Col> </>
                }
              </> : ''
            }
            { invalid ? <Alert variant="danger">Check your form!</Alert> : ''}
            <Form.Label><b>Creator:</b> {creator[0].name}</Form.Label>
            <Button variant='secondary' onClick={() => { props.close() }}>Cancel</Button>
            { props.creator ? <Button variant='success' onClick={submit}>Copy</Button> : '' }
          </Modal.Footer>
        </> : '' }
    </Modal>
  </>)
}

function DeleteMeme (props){
  return (
      <span onClick={() => props.delete(props.meme.id)}>
        <img title="Delete" src="images/basket.png" id="action-img" height="20" alt=''/>
      </span>
  )
}

function CopyMeme (props){
  return (
      <span onClick={props.copy}>
        <img title="Copy" src="images/copy.png" id="action-img" height="20" alt=''/>
      </span>
  )
}

export {MemeBoard}