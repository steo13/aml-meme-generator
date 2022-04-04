const BASEURL = '/api';

async function logIn(credentials) {
  //call POST /api/sessions
  let response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if(response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    try {
      const errDetail = await response.json();
      throw errDetail.message;
    }
    catch(err) {
      throw err;
    }
  }
}

function getFilter(filter){
  //call GET /api/memes/:filter
  return new Promise((res, rej) => {
      fetch(`/api/memes/${String(filter)}`)
        .then(resp => resp.json())
        .then(memes => res(
            memes.map(m => {
                return m;
            })
        ))
        .catch(err => rej(err));
  });
}

function getImage(id) {
  //call GET /api/image?id=<id>
  return new Promise((res, rej) => {
    fetch(`/api/image?id=${id}`)
      .then(resp => resp.json())
      .then(images => res(
          images.map(img => {
              return img;
          })
      ))
      .catch(err => rej(err));
  });
}

function getImages() {
  //call GET /api/images
  return new Promise((res, rej) => {
    fetch('/api/images')
      .then(resp => resp.json())
      .then(images => res(
          images.map(img => {
              return img;
          })
      ))
      .catch(err => rej(err));
  });
}

function getCreator(id) {
  //call GET /api/creator?id=<id>
  return new Promise((res, rej) => {
    fetch(`/api/creator?id=${id}`)
      .then(resp => resp.json())
      .then(creators => res(
          creators.map(cre => {
              return cre;
          })
      ))
      .catch(err => rej(err));
  });
}

function getTexts(id) {
  //call GET /api/texts?meme=<id>
  return new Promise((res, rej) => {
    fetch(`/api/texts?meme=${id}`)
      .then(resp => resp.json())
      .then(texts => res(
          texts.map(txt => {
              return txt;
          })
      ))
      .catch(err => rej(err));
  });
}

function addMeme(meme) {
  //call POST /api/meme
  return new Promise((resolve, reject) => {
    fetch('/api/meme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creator: meme.creator,
        image: meme.image,
        private: Number(meme.private),
        title: meme.title,
        font: meme.font,
        colour: meme.colour})
      }).then((response) => {
        if (response.ok)
          resolve(response.json())
        else
          response.json().then((obj) =>{ reject(obj); })
      }).catch(err => { reject({'error': 'Cannot comunicate with the server'})})
    })
}

function addTexts(texts) {
  //call POST /api/text
  return new Promise((resolve, reject) => {
    texts.map(t => 
      t.text !== "" ? fetch('/api/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meme: t.meme,
          image: t.image,
          text: t.text,
          position: t.position})
        }).then((response) => {
          if (response.ok)
            resolve(null)
          else
            response.json().then((obj) =>{ reject(obj); })
        }).catch(err => { reject({'error': 'Cannot comunicate with the server'})
      }) : resolve(null)
    )
  })
}

function deleteTexts(id){
  // call DELETE /api/texts/:id
  return new Promise((res, rej) => {
      fetch(`/api/texts/${id}`, {method: 'DELETE'})
      .then(response => {
          if(response.ok) res(null);
          else response.json().then(obj => rej(obj));
      })
      .catch(err => rej({'error': 'Cannot comunicate with the server'}));
  });
}

function deleteMeme(id){
  // call DELETE /api/meme/:id
  return new Promise((res, rej) => {
      fetch(`/api/meme/${id}`, {method: 'DELETE'})
      .then(response => {
          if(response.ok) res(null);
          else response.json().then(obj => rej(obj));
      })
      .catch(err => rej({'error': 'Cannot comunicate with the server'}));
  });
}

async function logOut() {
  // call DELETE /api/sessions/current
  await fetch('/api/sessions/current', { method: 'DELETE' });
}

async function getUserInfo() {
  const response = await fetch(BASEURL + '/sessions/current');
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  // an object with the error coming from the server, mostly unauthenticated user
  }
}

const API = { logIn,  logOut, getUserInfo, getFilter, getImage, getImages, getCreator, getTexts, addMeme, addTexts, deleteTexts, deleteMeme }
export default API;