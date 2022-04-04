import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import { React, useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router-dom';

import LoginForm from './components/Login';
import  CustomNavbar from './components/CustomNavbar'
import  Sidebar from './components/Sidebar'
import { MemeBoard } from './components/MemeBoard';

import API from './API'
import MemeModal from './components/MemeModal'
import { AddButton } from './components/AddButton';

function App() {
  const [loggedIn, setLoggedIn] = useState(false); // at the beginning, no user is logged in
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  
  const [creator, setCreator] = useState(null);
  const [user, setUser] = useState(false);
  const [filter, setFilter] = useState('public');

  const [memes, setMemes] = useState([]);
  const [showAddMeme, setShowAddMeme] = useState(false);

  // check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const creator = await API.getUserInfo();
        setCreator(creator);
        setLoggedIn(true);
      } catch (err) {
        console.log(err.error); // mostly unauthenticated user
      }
    };
    if (!user)
      checkAuth();
    else
      setUser(true)
  }, [user] );

  useEffect(() => {    
    const filterMemes = (filter) => {
      setLoading(true);
      API.getFilter(filter).then(ms => {
        setMemes(ms);
        setLoading(false)
      })
    }
    if (loggedIn || user)
      filterMemes(filter);
  }, [filter, user, loggedIn])

  useEffect (() => {
    const filterMemes = (filter) => {
      API.getFilter(filter).then(ms => {
        setMemes(ms);
        setDirty(false);
      });
    }
    if (dirty)
      filterMemes(filter);
  }, [filter, dirty]);

  const doLogIn = async (credentials) => {
    try {
      const creator = await API.logIn(credentials);
      setCreator(creator);
      setLoggedIn(true);
    }
    catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      // handleErrors(err)
      throw err;
    }
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setCreator(null);
    setFilter('public')
  }

  const addMeme = (meme, texts) => {
    if (!meme.status)
      meme.status = 'added'
    setMemes(old => [...old, meme]);
    API.addMeme(meme).then((res) =>{ texts.map(t =>{ t.meme=res.id; return t; }); API.addTexts(texts).finally(() => { setDirty(true) })})
  }

  const deleteMeme = (id) => {
    setMemes(memes => memes.map(m => {
      if(m.id === id)
        m.status = 'deleted';
      return m;
    }));

    API.deleteTexts(id).then(() =>{ API.deleteMeme(id).finally(() => setDirty(true)) });
  }

  return (
    <Router>
      <Switch>
        <Route path="/login">
          {loggedIn || user ?  <Redirect to="/" />  : <LoginForm login={doLogIn} user={() => setUser(true)}/>}
        </Route> 
        <Route path="/">
          {loggedIn || user ? <>
            <CustomNavbar loggedIn={loggedIn} creator={creator} logout={doLogOut} login={() => setUser(false)}/>
            { loading ? 
              <div id="loading-screen">
                <h1>Loading...</h1> 
                <p>Stay connected with us!</p>
                <Spinner animation="border" role="status"></Spinner>
            </div> : 
              <div className="d-flex flex-grow-1">
                <Sidebar loggedIn={loggedIn} load={(filter) => { setFilter(filter); }} filter={filter}/>
                <MemeBoard loggedIn={loggedIn} memes={memes} creator={creator} delete={deleteMeme} copy={(meme, texts) => addMeme(meme, texts)}/>
                <MemeModal 
                  id={memes.length !== 0 ? memes[memes.length - 1].id + 1 : 1}
                  displayed={showAddMeme} 
                  showModal={(value) => {setShowAddMeme(value)}}
                  addOrUpMeme={(meme, texts) => addMeme(meme, texts)}
                  creator={creator}/>
              </div> }
              { !loading && loggedIn ? <AddButton showModal={(value) => {setShowAddMeme(value)}} /> : '' }
          </>: <Redirect to="/login"/>}
        </Route>
      </Switch>
    </Router>
    
  );
}

export default App;
