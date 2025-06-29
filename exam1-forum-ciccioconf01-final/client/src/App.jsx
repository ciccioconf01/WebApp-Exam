import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route, Navigate, useNavigate } from 'react-router';


import { GenericLayout, NotFoundLayout, TableLayout, AddLayout, LoginLayout, CommentLayout, TotpLayout } from './components/Layout';
import API from './API.js';

function App() {

  const navigate = useNavigate(); 

  // This state keeps track if the user is currently logged-in.
  const [loggedIn, setLoggedIn] = useState(false);
  // This state contains the user's info.
  const [user, setUser] = useState(null);
  //This state keeps track if the user is currently logged-in with 2fa
  const [loggedInTotp, setLoggedInTotp] = useState(false);

  //States that contain the list of posts/comments
  const [postList, setPostList] = useState([]);
  const [comments, setComments] = useState([]);
  
  //state for error messages
  const [message, setMessage] = useState('');
  
  // states to handle the use effect for posts and comments
  const [dirty, setDirty] = useState(true);
  const [dirty2, setDirty2] = useState(false);

  const [waiting, setWaiting] = useState(false);


  // If an error occurs, the error message will be shown using the state.
 const handleErrors = (err) => {
    
    let msg = '';
    if (err.error)
      msg = err.error;
    else if (err.errors) {
      if (err.errors[0].msg)
        msg = err.errors[0].msg + " : " + err.errors[0].path;
    } else if (Array.isArray(err))
      msg = err[0].msg + " : " + err[0].path;
    else if (typeof err === "string") msg = String(err);
    else msg = "Unknown Error";

    setMessage(msg);

    if (msg === 'Not authenticated')
      setTimeout(() => {
        setUser(undefined); setLoggedIn(false); setLoggedInTotp(false); setDirty(true);
      }, 2000);
    else
      setTimeout(()=>setDirty(true), 2000);
  }

  // used to retrieve the user info, if already logged in
  useEffect(()=> {
    const checkAuth = async() => {
      try {
        
        const user = await API.getUserInfo();
        setLoggedIn(true);
        setUser(user);
        if (user.isTotp)
          setLoggedInTotp(true);
        
      } catch(err) {
        
      }
    };
    checkAuth();
  }, []);  // This useEffect is called only the first time the component is mounted.



  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setLoggedInTotp(false);
    setUser(null);
  };

  
  function addPost(post) {
    
    API.addPost(post)
      .then(()=>{setDirty(true); navigate('/');})
      .catch(err=>handleErrors(err));
  }

  function deletePost(postTitle) {
  
    API.deletePost(postTitle)
      .then(()=> setDirty(true))
      .catch(err=>handleErrors(err));
  }

  function deleteComment(commentId) {
  
    API.deleteComment(commentId)
      .then(()=>{setDirty2(true); setDirty(true)})//we also set the Dirty to true to reload the list of post to refresh the actual comments field
      .catch(err=>handleErrors(err));
  }

  function editComment(comment) {
    
    API.updateComment(comment)
      .then(()=>{setDirty2(true);})
      .catch(err=>handleErrors(err));
  }

  function addComment(comment) {
    
    
    API.addComment(comment)
      .then(()=>{setDirty2(true); setDirty(true)})//we also set the Dirty to true to reload the list of post to refresh the actual comments field
      .catch(err=>handleErrors(err));
  }

  function insertLike(like) {
    API.insertLike(like)
      .then(()=>{setDirty2(true);}) 
      .catch(err=>handleErrors(err));
  }

  function deleteLike(like) {
    API.deleteLike(like)
      .then(()=>{setDirty2(true);})
      .catch(err=>handleErrors(err));
  }

  return (
      <Container fluid>
        <Routes>
          <Route path="/" element={ <GenericLayout 
                                    message={message} setMessage={setMessage}
                                    loggedIn={loggedIn} user={user} loggedInTotp={loggedInTotp} logout={handleLogout} /> } >
            <Route index element={<TableLayout 
                 postList={postList} setPostList={setPostList} 
                 deletePost={deletePost} handleErrors={handleErrors} loggedIn={loggedIn} user={user} loggedInTotp={loggedInTotp}
                 dirty={dirty} setDirty={setDirty} waiting={waiting} setWaiting={setWaiting} /> } />
            <Route path="add" element={ <AddLayout addPost={addPost} /> } />
            <Route path="posts/:postTitle/comments" element={<CommentLayout comments={comments} setComments={setComments} handleErrors={handleErrors}
                                                                              dirty2={dirty2} setDirty2={setDirty2} addComment={addComment}
                                                                              deleteComment={deleteComment} editComment={editComment} insertLike={insertLike}
                                                                              deleteLike={deleteLike} user={user} loggedIn={loggedIn} loggedInTotp={loggedInTotp}/>} />
            <Route path="*" element={<NotFoundLayout />} />
          </Route>
          <Route path="/login" element={ <LoginWithTotp loggedIn={loggedIn} login={handleLogin} user={user} setLoggedInTotp={setLoggedInTotp}/> } />
        </Routes>
      </Container>
  );

}



function LoginWithTotp(props) {
  if (props.loggedIn) {
    if (props.user.canDoTotp) {
      if (props.loggedInTotp) {
        return <Navigate replace to='/' />;
      } else {
        return <TotpLayout totpSuccessful={() => props.setLoggedInTotp(true)} />;
      }
    } else {
      return <Navigate replace to='/' />;
    }
  } else {
    return <LoginLayout login={props.login} />;
  }
}
export default App;