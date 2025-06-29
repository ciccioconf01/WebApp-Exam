import { Link } from 'react-router';
import { Card, Table, Badge, Button, Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import { useState } from 'react';

function CommentSection(props) {

  // state to show/hide the form to add the comment
  const [showForm, setShowForm] = useState(false);

  //state for the text of the new comment
  const [newComment, setNewComment] = useState('');

  //state used to save the id of the comment to edit
  const [editingCommentId, setEditingCommentId] = useState(null);

  //state for the edited text
  const [editedText, setEditedText] = useState('');

    
  
   if (props.loading) {
    return (
      <Container className="my-4 text-center py-5">
        <Spinner animation="border" variant="primary" />
        <div className="mt-2 text-muted">Loading post and comments...</div>
      </Container>
    );
  }



  const handleSaveEdit = () => {
    const comment = { "id": editingCommentId, "text": editedText, }
    props.editComment(comment); 
    setEditingCommentId(null);
    setEditedText('');
  };



  const handleInsertLike = (commentId) => {
  const like = {
    "commentID": commentId,
    "postTitle": props.post.title
    };

    props.insertLike(like); // chiama il metodo passato dal parent
  };



  const handleDeleteLike = (commentId) => {
   const like = {
      "commentID": commentId,
      "postTitle": props.post.title
    };

    props.deleteLike(like);
  };


  const handleToggleForm = () => {
    setShowForm(prev => !prev);
    setNewComment('');
  };
 
  

  const handleSubmit = (event) => {
    event.preventDefault();

    const comment = { "postTitle": props.post.title, "text": newComment }    
    // some first checks
    if (comment.text.length == 0) {
      setErrorMsg('Text length cannot be 0');
    } 
    else {
        props.addComment(comment);
        setNewComment('');
        }
    }

  

  return (
    <Container className="my-4">
      {/* Card with the details of the posts */}
      <Row className="justify-content-center mb-4">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                Post Details
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>Title:</strong> {props.post.title}
                  </p>
                  <p>
                    <strong>Author:</strong> {props.post.authorName}
                  </p>
                  <p>
                    <strong>Text:</strong>
                  </p>
                  <Card.Text className="fst-italic bg-light p-3 rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {props.post.text}
                  </Card.Text>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Comments:</strong> {props.Ncomments} / {props.post.maximum_comments === null
                      ? <i className="bi bi-infinity fs-7"></i>
                      : props.post.maximum_comments}
                  </p>

                  <p>
                    <strong>Timestamp:</strong> {props.post.timestamp}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Card for the comment section */}
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white d-flex align-items-center justify-content-between">
              <h5 className="mb-0 d-flex align-items-center">
                <i className="bi bi-chat-left-text me-2"></i>
                Comments for the post: {props.post.title}
              </h5>
              {/* Button for adding comments */}
              <Button
                variant="light"
                size="sm"
                onClick={handleToggleForm}
                className="text-success"
                title={showForm ? "Close form" : "Add comment"}
                
              >
                {showForm ? "Close form" : "Add comment"}
              </Button>
            </Card.Header>

            {/* Form to insert the comment */}
            {showForm && (
              <Card.Body className="border-bottom">
                <Form onSubmit={handleSubmit}>
                  <Row className="gy-2">
                    <Col md={12}>
                      <Form.Group controlId="commentText">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Write your comment"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12} className="text-end mt-2">
                      <Button
                      type="submit"
                      variant="success"
                      disabled={
                        props.post.maximum_comments !== null &&
                        props.Ncomments >= props.post.maximum_comments
                      }
                    >
                      Send Comment
                    </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            )}

            {/* table for showing all the comments*/}
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '20%' }}>Author</th>
                    <th>Comment</th>
                    <th style={{ width: '20%' }}>Timestamp</th>
                    <th style={{ width: '15%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  { props.comments.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        <i className="bi bi-chat-left-dots display-6 d-block mb-2"></i>
                        No Comments Present
                      </td>
                    </tr>
                  ) : props.comments.map(comment => {
                      
                    // variable that store if the comment was marked as intersting
                      const isInteresting = props.interestingComments.some(
                        like => like.commentID === comment.id
                      );

                    // variable that store the total number of "interesting flag" for the comment
                      const likeEntry = props.Nlikes.find(
                        like => like.commentID === comment.id
                      );
                      const totalLikes = likeEntry ? likeEntry.count : 0;

                      return (
                        <tr key={comment.id} className="align-middle">
                          <td>
                            {/* show the author of the comment */}
                            <Badge bg="info">{comment.authorName}</Badge>
                          </td>
                          {/* if the comment is in edit mode show the text area to modify it, otherwise show the comment*/}
                          <td> 
                            {editingCommentId === comment.id ? (
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                              />
                            ) : (
                              <div style={{ whiteSpace: 'pre-wrap' }}>
                                {comment.text}
                              </div>
                            )}
                          </td>
                          <td>
                            {/* show the timestamp of the comment */}
                            <small className="text-muted">
                              <i className="bi bi-calendar3 me-1"></i>
                              {comment.timestamp}
                            </small>
                          </td>
                          <td>
                            {/* button for set/unset the interesting flag, if the comment is already marked with the click we remove the flag, otherwise we add the flag */}
                            <div className="d-flex gap-2 align-items-center">
                              <Button
                                variant={isInteresting ? "danger" : "outline-danger"}
                                size="sm"
                                title={isInteresting ? "Unmark as Interesting" : "Mark as Interesting"}
                                onClick={() => {
                                  if (isInteresting) {
                                    handleDeleteLike(comment.id);
                                  } else {
                                    handleInsertLike(comment.id);
                                  }
                                }}
                                disabled={!props.loggedIn} 
                              > {/* the number of interesting flag are shown only if i am an authenticated user */}
                                <span className="d-flex flex-column align-items-center">
                                <i className={isInteresting ? "bi bi-heart-fill" : "bi bi-heart"}></i>
                                {props.loggedIn && (
                                  <small className={isInteresting ? "text-white" : "text-danger"}>
                                    {totalLikes}
                                  </small>
                                )}
                              </span>
                              </Button>

                                {/* if i already clicked the first time the button edit for the comment the click will save the modification, otherwise the click fill some state to open the text area */}
                              {editingCommentId === comment.id ? (
                                <Button
                                  variant="success"
                                  size="sm"
                                  title="Save"
                                  onClick={handleSaveEdit}
                                  disabled={!props.loggedInTotp && (!props.loggedIn || props.user.id !== comment.authorID)}
                                >
                                  <i className="bi bi-check-lg"></i>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  title="Edit Comment"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditedText(comment.text);
                                  }}
                                  disabled={!props.loggedInTotp && (!props.loggedIn || props.user.id !== comment.authorID)}
                                >
                                  <i className="bi bi-pencil-fill"></i>
                                </Button>
                              )}
                              {/* button for delete the comment */}
                              <Button
                                variant="outline-danger"
                                size="sm"
                                title="Delete Comment"
                                onClick={() => props.deleteComment(comment.id)}
                                disabled={!props.loggedInTotp && (!props.loggedIn || props.user.id !== comment.authorID)}
                              >
                                <i className="bi bi-trash-fill"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>


              </Table>

            </Card.Body>

            <Card.Footer className="text-end">
              <Link to={"/"}>
                <Button variant="secondary" className="mb-3">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to posts
                </Button>
              </Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export { CommentSection };
