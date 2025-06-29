'use strict';

const db = require('./db');
const dayjs = require("dayjs");


const convertPostFromDbRecord = (dbRecord) => {
  const post = {};
  post.title = dbRecord.title;
  post.authorName = dbRecord.authorName;
  post.authorID = dbRecord.authorID;
  post.text = dbRecord.text;
  post.maximum_comments = dbRecord.maximum_comments;
  post.number_actual_comments = dbRecord.commentCount;
  post.timestamp = dayjs(dbRecord.timestamp).format("YYYY-MM-DD HH:mm:ss");
  return post;
}

const convertCommentFromDbRecord = (dbRecord) => {
  const comment = {};
  comment.id = dbRecord.id;
  comment.text = dbRecord.text;
  comment.timestamp = dayjs(dbRecord.timestamp).format("YYYY-MM-DD HH:mm:ss");
  comment.authorID = dbRecord.authorID;
  comment.authorName = dbRecord.authorName;
  if(dbRecord.authorID == null){
    comment.authorName = "Anonymous user"
  }
  comment.postTitle = dbRecord.postTitle;

  return comment;
}


const convertLikesFromDbRecord = (dbRecord) => {
  const like = {};
  like.postTitle = dbRecord.postTitle;
  like.commentID = dbRecord.commentID;
  
  return like;
}

// This function retrieves the whole list of posts from the database.
// I perform a join with the user database to find the correct name of the author associated to the comment
exports.listPosts = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
      posts.*, 
      users.name AS authorName,
      COUNT(comments.postTitle) AS commentCount
      FROM posts
      LEFT JOIN users ON posts.authorID = users.id
      LEFT JOIN comments ON comments.postTitle = posts.title
      GROUP BY posts.title, users.name
      ORDER BY posts.timestamp DESC;
    `;


    db.all(sql, (err, rows) => {
      if (err) { reject(err); }

      const posts = rows.map((e) => {
        const post = convertPostFromDbRecord(e);
        
        return post;
      });

      resolve(posts);
    });
  });
};


// This function retrieves a post given its title.
exports.getPostByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT posts.*, users.name AS authorName
        FROM posts
        LEFT JOIN users ON posts.authorID = users.id
        WHERE posts.title = ?
      `;
    db.get(sql, title, (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Post not found.' });
      } else {
        const post = convertPostFromDbRecord(row);
        resolve(post);
      }
    });
  });
};


exports.createPost = (post) => {
 
  if (post.maximum_comments === undefined || post.maximum_comments === '')
    post.maximum_comments = null;

  post.timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss")

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO posts (title, authorID, text, maximum_comments, timestamp) VALUES(?, ?, ?, ?, ?)';
    db.run(sql, [post.title, post.authorID, post.text, post.maximum_comments, post.timestamp], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object to the client.
      resolve(exports.getPostByTitle(post.title));
    });
  });
};




// This function retrieves a comment given its id.
exports.getCommentById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM comments WHERE id=?';
    db.get(sql, id, (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Comment not found.' });
      } else {
        const comment = convertCommentFromDbRecord(row);
        resolve(comment);
      }
    });
  });
};


// This function retrieves all the comments associated to a post title
exports.getPostComments = (postTitle) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        comments.*, 
        users.name AS authorName
      FROM comments
      LEFT JOIN users ON comments.authorID = users.id
      WHERE comments.postTitle = ?
      ORDER BY comments.timestamp DESC
    `;
    db.all(sql, postTitle, (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Comment not found.' });
      } else {
        const comments = row.map((e) => {
        const comment = convertCommentFromDbRecord(e);
        
        return comment;
          });
        resolve(comments);
      }
    });
  });
};


// This function retrieves all the comments associated to a post title
exports.getPostCommentsAnonymous = (postTitle) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM comments
        WHERE postTitle = ? AND authorID IS NULL
        ORDER BY comments.timestamp DESC
      `;
    db.all(sql, postTitle, (err, row) => {
      if (err) {
        reject(err);
      }
      if (row == undefined) {
        resolve({ error: 'Comment not found.' });
      } else {
        const comments = row.map((e) => {
        const comment = convertCommentFromDbRecord(e);
        
        return comment;
          });
        resolve(comments);
      }
    });
  });
};

//this function retrive the number of comments associated to a post
exports.getCommentsNumber = (postTitle) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) AS count
      FROM comments
      WHERE postTitle = ?
    `;
    db.get(sql, [postTitle], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
    });
  });

};


//function to create the comment
exports.createComment = (comment) => {
  
  if (!comment.authorID)
    comment.authorID = null;

  comment.timestamp = dayjs().format("YYYY-MM-DD HH:mm:ss")

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO comments (text, timestamp, authorID, postTitle) VALUES(?, ?, ?, ?)';
    db.run(sql, [comment.text, comment.timestamp, comment.authorID, comment.postTitle], function (err) {
      if (err) {
        reject(err);
      }
      // Returning the newly created object to the client.
      resolve(exports.getCommentById(this.lastID));
    });
  });
};


// This function deletes an existing post given its title. 
//after the post delete will be deleted also the comments and the "like" associated to the previous post
exports.deletePost = (authorID, title) => {
  return new Promise((resolve, reject) => {
    const deletePostSQL = 'DELETE FROM posts WHERE title = ? AND authorID = ?';
    const deleteCommentsSQL = 'DELETE FROM comments WHERE postTitle = ?';
    const deleteLikesSQL = 'DELETE FROM likes WHERE postTitle = ?';

    db.run(deletePostSQL, [title, authorID], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        // No post deleted: (probably because the user logged is different to the owner of the post)
        reject('Not Authorized');
      } else {
        const deletedPosts = this.changes;
        // Post eliminated, now we eliminate the comments
        db.run(deleteCommentsSQL, [title], function (err2) {
          if (err2) {
            reject(err2);
          } else {
            const deletedComments = this.changes;
            // Comments eliminated, now we eliminate the likes
            db.run(deleteLikesSQL, [title], function (err3) {
              if (err3) {
                reject(err3);
              } else {
                const deletedLikes = this.changes;
                const totalDeleted = deletedPosts + deletedComments + deletedLikes;
                resolve(totalDeleted);
              }
            });
          }
        });
      }
    });
  });
};

// This function deletes an existing post given its title.
exports.deletePostAdmin = (title) => {
  return new Promise((resolve, reject) => {
    const deletePostSQL = 'DELETE FROM posts WHERE title = ?';
    const deleteCommentsSQL = 'DELETE FROM comments WHERE postTitle = ?';
    const deleteLikesSQL = 'DELETE FROM likes WHERE postTitle = ?';

    db.run(deletePostSQL, [title], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject('Not Authorized');
      } else {
        const deletedPosts = this.changes;
        // Post deleted, now delete comments
        db.run(deleteCommentsSQL, [title], function (err2) {
          if (err2) {
            reject(err2);
          } else {
            const deletedComments = this.changes;
            // Comments deleted, now delete likes
            db.run(deleteLikesSQL, [title], function (err3) {
              if (err3) {
                reject(err3);
              } else {
                const deletedLikes = this.changes;
                const totalDeleted = deletedPosts + deletedComments + deletedLikes;
                resolve(totalDeleted); 
              }
            });
          }
        });
      }
    });
  });
};



// This function deletes an existing comment given its id.
//after the comment delete we will remove also the "like" associated to the comment
exports.deleteComment = (authorID, id) => {
  return new Promise((resolve, reject) => {
    const deleteCommentSQL = 'DELETE FROM comments WHERE id = ? AND authorID = ?';
    const deleteLikesSQL = 'DELETE FROM likes WHERE commentID = ?';

    db.run(deleteCommentSQL, [id, authorID], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject('Not Authorized');
      } else {

        const deletedComments = this.changes;
        // Comment deleted, now delete likes related to that comment
        db.run(deleteLikesSQL, [id], function (err2) {
          if (err2) {
            reject(err2);
          } else {
            const deletedLikes = this.changes;
            const totalDeleted = deletedComments + deletedLikes;
            resolve(totalDeleted); //total elements deleted
          }
        });
      }
    });
  });
};


// This function deletes an existing comment given its id.
exports.deleteCommentAdmin = (id) => {
  return new Promise((resolve, reject) => {
    const deleteCommentSQL = 'DELETE FROM comments WHERE id = ?';
    const deleteLikesSQL = 'DELETE FROM likes WHERE commentID = ?';

    db.run(deleteCommentSQL, [id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        reject('Not Authorized');
      } else {

        const deletedComments = this.changes;
        // Comment deleted, now delete likes related to that comment
        db.run(deleteLikesSQL, [id], function (err2) {
          if (err2) {
            reject(err2);
          } else {
            const deletedLikes = this.changes;
            const totalDeleted = deletedComments + deletedLikes;
            resolve(totalDeleted); //total elements deleted
          }
        });
      }
    });
  });
};


// This function updates an existing comment given its id and the new text.
exports.updateComment = (userId, commentId, commentText) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE comments SET text = ? WHERE id = ? AND authorID = ?';
    db.run(sql, [commentText, commentId, userId], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        reject({ error: 'Not Authorized' });
      } else {
        resolve(exports.getCommentById(commentId));
      }
    });
  });
};

// This function updates an existing comment given its id and the new text.
exports.updateCommentAdmin = (commentId, commentText) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE comments SET text = ? WHERE id = ?';
    db.run(sql, [commentText, commentId], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1) {
        reject({ error: 'Not Authorized' });
      } else {
        resolve(exports.getCommentById(commentId));
      }
    });
  });
};


//store the interesting flag inserted by the user 
exports.createLike = (like) => {

  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO likes (authorID, commentID, postTitle) VALUES(?, ?, ?)';
    db.run(sql, [like.authorID, like.commentID, like.postTitle], function (err) {
      if (err) {
        reject(err);
      }
      resolve("Like inserted");
    });
  });
};


// delete the interesting flag previously inserted by the user 
exports.deleteLike = (like) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM likes WHERE authorID=? and commentID=? and postTitle=?';
    db.run(sql, [like.authorID, like.commentID, like.postTitle], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        // No post was deleted: wrong authorID
        reject('Not Authorized');
      }
      else
        resolve(this.changes);
    });
  });
}



// This function retrieves all the "likes" inserted by the user logged for the comments of the specific post
exports.getPostLikes = (postTitle, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM likes
        WHERE authorID = ? AND postTitle = ?
      `;

    db.all(sql, [userId, postTitle], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row || row.length === 0) {
        resolve([]); // if no "likes" return a empty array
      } else {
        const likes = row.map((e) => convertLikesFromDbRecord(e));
        resolve(likes);
      }
    });
  });
};



// This function retrieve the number of likes received for each comment
exports.getCommentLikeCountsByPostTitle = (postTitle) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT commentID, COUNT(*) as count
      FROM likes
      WHERE postTitle = ?
      GROUP BY commentID
    `;

    db.all(sql, [postTitle], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        
        resolve(rows);
      }
    });
  });
};