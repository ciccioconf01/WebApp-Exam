import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3001/api/';



function getJson(httpResponsePromise) {
  
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

         
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          
          response.json()
            .then(obj => 
              reject(obj)
              ) 
            .catch(err => reject({ error: "Cannot parse server response" })) 
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) 
  });
}


const getPosts = async () => {
  return getJson(
    
    fetch(SERVER_URL + 'posts', { credentials: 'include' })
  ).then( json => {

    return json.map((post) => {
      const clientPost = {
        title: decodeURIComponent(post.title),
        authorName: post.authorName, 
        authorID: post.authorID,
        text: post.text,
        maximum_comments: post.maximum_comments, 
        actual_comments: post.number_actual_comments
      }

      clientPost.timestamp = dayjs(post.timestamp).format("YYYY-MM-DD HH:mm:ss");
      return clientPost;
    })
  })
  
}



const getCommentsByPostTitle = async (postTitle) => {
  const encodedTitle = encodeURIComponent(postTitle);
  return getJson(
    fetch(`${SERVER_URL}posts/${encodedTitle}/comments`, { credentials: 'include' })
  ).then(json => json);
};





function updateComment(comment) {
  
  return getJson(
    fetch(SERVER_URL + "comments/" + comment.id, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment)
    })
  )
}


function addPost(post) {
    

  return getJson(
    fetch(SERVER_URL + "posts/", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post) 
    })
  )
}


function addComment(comment) {
    

  return getJson(
    fetch(SERVER_URL + "comments/", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comment) 
    })
  )
}


function deletePost(postTitle) {
  const encodedTitle = encodeURIComponent(postTitle);
  return getJson(
    fetch(`${SERVER_URL}posts/${encodedTitle}`, {
      method: 'DELETE',
      credentials: 'include'
    })
  );
}


function deleteComment(commentID) {
  return getJson(
    fetch(SERVER_URL + "comments/" + commentID, {
      method: 'DELETE',
      credentials: 'include'
    })
  )
}


function insertLike(like) {
  const encodedTitle = encodeURIComponent(like.postTitle);
  return getJson(
    fetch(`${SERVER_URL}${encodedTitle}/comments/likes`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(like)
    })
  );
}


function deleteLike(like) {
  const encodedTitle = encodeURIComponent(like.postTitle);
  return getJson(
    fetch(`${SERVER_URL}${encodedTitle}/comments/likes?commentID=${like.commentID}`, {
      method: 'DELETE',
      credentials: 'include'
    })
  );
}





/*** Authentication functions ***/

/**
 * This function wants the TOTP code
 * It executes the 2FA.
 */
const totpVerify = async (totpCode) => {
  return getJson(fetch(SERVER_URL + 'login-totp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify({code: totpCode}),
  })
  )
};


/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwarded
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    // this parameter specifies that authentication cookie must be forwarded
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwarded
  })
  )
}

const API = { getPosts, getCommentsByPostTitle,  updateComment, addPost, addComment, deletePost, deleteComment,
              insertLike, deleteLike, logIn, getUserInfo, logOut, totpVerify };
export default API;