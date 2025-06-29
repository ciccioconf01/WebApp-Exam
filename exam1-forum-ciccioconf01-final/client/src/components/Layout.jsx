import { Row, Col, Button, Spinner, Alert, Toast } from 'react-bootstrap';
import { Outlet, Link, useParams } from 'react-router';

import { Navigation } from './Navigation';
import { PostTable } from './PostList';
import { PostForm } from './PostForm';
import { CommentSection } from './Comments';
import { useEffect, useState } from 'react';
import { LoginForm, TotpForm } from './Auth';

import API from '../API.js';



function NotFoundLayout(props) {
    return (
      <>
        <h2>This route is not valid!</h2>
        <Link to="/">
          <Button variant="primary">Go back to the main page!</Button>
        </Link>
      </>
    );
  }


function LoginLayout(props) {
  return (
    <Row>
      <Col>
        <LoginForm login={props.login} />
      </Col>
    </Row>
  );
}

function TotpLayout(props) {
  return (
    <Row>
      <Col>
        <TotpForm totpSuccessful={props.totpSuccessful} />
      </Col>
    </Row>
  );
}

function AddLayout(props) {
  return (
    <PostForm addPost={props.addPost} />
  );
}
  
  


function TableLayout(props) {
  
    
    useEffect(() => {
      if (props.dirty) {
        props.setWaiting(true);
        API.getPosts()   
        .then(posts => {
          props.setPostList(posts);
          props.setDirty(false);
          props.setWaiting(false);
        })
        .catch(e => { props.handleErrors(e);
                      props.setWaiting(false);
         } ); 
      }
    }, [props.dirty]);
    
    
    return (
      <>
        <div className="d-flex flex-row justify-content-between">
  
          <Link 
            to={props.loggedIn ? '/add' : '#'}
            style={{ pointerEvents: props.loggedIn ? 'auto' : 'none' }}
          >
            <Button variant="primary" className="my-2" disabled={!props.loggedIn}>
              Add Post
            </Button>
          </Link>
        </div>
        { props.waiting? <Spinner /> :
        <PostTable 
          posts={props.postList} delete={props.deletePost} loggedIn={props.loggedIn} user={props.user} loggedInTotp={props.loggedInTotp}/>
        }
      </>
    );
  }
  
  function GenericLayout(props) {
  
    return (
      <>
        <Row>
          <Col>
            <Navigation loggedIn={props.loggedIn} user={props.user} logout={props.logout} loggedInTotp={props.loggedInTotp} />
          </Col>
        </Row>

        <Row><Col>
          {props.message? <Alert className='my-1' onClose={() => props.setMessage('')} variant='danger' dismissible>
            {props.message}</Alert> : null}
          
        </Col></Row>

        <Row>
  
          <Col xs={12}>
            <Outlet />
  
          </Col>
        </Row>
      </>
    );
  }

  function CommentLayout(props) {

    const { postTitle } = useParams();
    const decodedTitle = decodeURIComponent(postTitle);

    const [post,setPost] = useState();

    const [loading, setLoading] = useState(true);

    const [interestingComments, setInterestingComments] = useState([]);
    const [likeNumbers, setLikeNumbers] = useState([]);

    const [commentsNumber, setCommentsNumber] = useState();
    

    useEffect(() => {
        
        setLoading(true);

        API.getCommentsByPostTitle(decodedTitle)   
          .then(info => {
            props.setComments(info.comments);
            setPost(info.postInfo);
            setLikeNumbers(info.number_of_likes);
            setInterestingComments(info.likeOfAuthUser);
            setCommentsNumber(info.commentsNumber);

            setLoading(false);
          })
          .catch(e => {
            props.handleErrors(e);
            setLoading(false);
          });
      
    }, [postTitle]);

    
    useEffect(() => {
      
      if (props.dirty2) {
        setLoading(true);

        API.getCommentsByPostTitle(decodedTitle)   
          .then(info => {
            props.setComments(info.comments);
            setPost(info.postInfo);
            setLikeNumbers(info.number_of_likes);
            setInterestingComments(info.likeOfAuthUser);
            setCommentsNumber(info.commentsNumber);

            props.setDirty2(false);
            setLoading(false);
          })
          .catch(e => {
            props.handleErrors(e);
            setLoading(false);
          });
      }
    }, [props.dirty2]);



  return (
    <Row>
      <Col>
        
        <CommentSection post={post} comments={props.comments} loading={loading} interestingComments={interestingComments}
         addComment={props.addComment} deleteComment={props.deleteComment} editComment={props.editComment}
         insertLike={props.insertLike} deleteLike={props.deleteLike} Nlikes={likeNumbers} Ncomments={commentsNumber}
         user={props.user} loggedIn={props.loggedIn} loggedInTotp={props.loggedInTotp}/>
       
      </Col>
    </Row>
  );
}


  export { GenericLayout, NotFoundLayout, TableLayout, AddLayout, LoginLayout, CommentLayout, TotpLayout };