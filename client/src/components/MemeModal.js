import { useState, useEffect} from 'react';
import { Modal, Form, Col, Row, Image, ButtonGroup, ToggleButton, Spinner, Button, Alert } from 'react-bootstrap';

import API from '../API'

function MemeModal (props) {
    const [loading, setLoading] = useState(true)
    const [images, setImages] = useState([])

    const [title, setTitle] = useState('')
    const [image, setImage] = useState(false)
    const [texts, setTexts] = useState([])
    const [priv, setPriv] = useState(false)
    const [font, setFont] = useState('');
    const [colour, setColour] = useState('')

    const [invalid, setInvalid] = useState(false)

    useEffect(() => {
        const getImages = () => {
            API.getImages().then(imgs => {
                setImages(imgs)
                setLoading(false)
            })
        }
        if (images.length === 0 && props.displayed)
            getImages()
    }, );

    useEffect(() => {
        const addTexts = (image) => {
            let texts = []
            if (image.pos1 != null)
                texts.push({meme: props.id, image: image.id, text: '', position: image.pos1})
            if (image.pos2 != null)
                texts.push({meme: props.id, image: image.id, text: '', position: image.pos2})
            if (image.pos3 != null)
                texts.push({meme: props.id, image: image.id, text: '', position: image.pos3})
            setTexts(texts)
        }
        if (image)
            addTexts(image)
    }, [image, props.id])

    const modifyText = (text) => {
        setTexts(texts.map(t => {
            if (t.meme === text.meme && t.position === text.position)
                t.text = text.text
            return t
        }))
    }

    const resetForm = () => {
        setImages([])
        setLoading(true)
        setImage(false)
        setTexts([])
        setPriv(false)
        setFont('')
        setColour('')
        setTitle('')
        setInvalid(false)
    };

    const submit = () => {
        var invalid = true;
        if (title === '' || image === false || texts.length === 0|| colour === '' || font === ''){
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
        if (!invalid){
            props.addOrUpMeme({id: props.id, creator: props.creator.id, image: image.id, private: priv, title: title, font: font, colour: colour}, texts)
            props.showModal(false)
            resetForm()
        }
    }

    return (
        <Modal className="ml-3"show={props.displayed} size='xl' backdrop='static' centered animation={false}>
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.meme ? `Edit meme number: #${props.meme.id} ` : `New meme #${props.id} `}
                    {loading ? <Spinner animation="border" role="status"></Spinner> : ''}
                </Modal.Title>
            </Modal.Header>
            {
                !loading ? <>
                    <Modal.Body>
                        <Form>
                            <Row>
                                <Col>
                                    <Form.Label>Choose the title of your meme:</Form.Label>
                                    <Form.Control value={title} type="text" placeholder="Insert the title of the meme" onChange={e => setTitle(e.target.value)}></Form.Control>
                                </Col>
                                <Col>
                                    <Form.Label>Is it private?</Form.Label>
                                    <Form.Check type="radio" checked={priv} label="Yes, it is" onClick={() => { setPriv(true) }} onChange={() => {}} />
                                    <Form.Check type="radio" checked={!priv} label="No, it isn't" onClick={() => { setPriv(false) }} onChange={() => {}} />
                                </Col>
                            </Row>
                            <Form.Group>
                                <Form.Label className="mt-2">Select a base image:</Form.Label>
                                    <Row>
                                    { images.map(img => {
                                        return ( <Col key={img.id} md={2}>
                                                    <Form.Check type="radio" label={img.id} name="group" onClick={() => setImage(img)}/>
                                                    <Image src={img.image} thumbnail />
                                                </Col>) }
                                    )}
                                    <Row>
                                    </Row>
                                    {
                                        texts.length > 0 ? <>
                                            <Form.Text className="text-muted">Insert at least one text (from right to left or from top to bottom)</Form.Text>
                                            { 
                                                texts.map((t, i) => {
                                                    return (
                                                        <Form.Group key={i}>
                                                            <Form.Label className={i === 0 ? '' : 'mt-2'}>Insert the text number {i}:</Form.Label>
                                                            <Form.Control type="text" placeholder={`Insert the ${i}th text of the meme`}
                                                                onChange={ev => modifyText({meme: t.meme, text: ev.target.value, position: t.position})}></Form.Control>
                                                        </Form.Group>
                                                    )
                                                })
                                            }   
                                        </>: ''
                                    }
                                    </Row>
                            </Form.Group>
                            <Row className="mt-2">
                                <Col>
                                    <Form.Label className="mt-2">Choose your font:</Form.Label>{' '}
                                    <ButtonGroup>
                                        <ToggleButton id='radio-1' type="radio" variant="outline-secondary" value={'1'} checked={font === '1'} onChange={(e) => setFont(e.currentTarget.value) }> Arial</ToggleButton>
                                        <ToggleButton id='radio-2' type="radio" variant="outline-secondary" value={'2'} checked={font === '2'} onChange={(e) => setFont(e.currentTarget.value) }> Times new roman</ToggleButton>
                                    </ButtonGroup>
                                </Col>
                                <Col>
                                    <Form.Label className="mt-2">Choose your font colour:</Form.Label>{' '}
                                    <ButtonGroup>
                                        <ToggleButton id='radio-3' type="radio" variant="outline-danger" value={'red'} checked={colour === 'red'} onChange={(e) => setColour(e.currentTarget.value) }> Red</ToggleButton>
                                        <ToggleButton id='radio-4' type="radio" variant="outline-success" value={'green'} checked={colour === 'green'} onChange={(e) => setColour(e.currentTarget.value)}> Green</ToggleButton>
                                        <ToggleButton id='radio-5' type="radio" variant="outline-warning" value={'yellow'} checked={colour === 'yellow'} onChange={(e) => setColour(e.currentTarget.value)}> Yellow</ToggleButton>
                                        <ToggleButton id='radio-6' type="radio" variant="outline-primary" value={'blue'} checked={colour === 'blue'} onChange={(e) => setColour(e.currentTarget.value)}> Blue</ToggleButton>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form.Label>Go on <b>{props.creator.name}!</b></Form.Label>
                        <Button variant='secondary' onClick={() => { props.showModal(false); resetForm(); }}>Cancel</Button>
                        <Button variant='success' onClick={submit}>Add</Button>
                        { invalid ? <Alert variant="danger">Check your form!</Alert> : ''}
                    </Modal.Footer></>: ''
            }
        </Modal>
    )
}

export default MemeModal;