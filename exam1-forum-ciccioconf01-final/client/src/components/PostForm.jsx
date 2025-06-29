import { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Link } from 'react-router';

const PostForm = (props) => {

  // states for the creation form
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [maximum_comments, setMaximum_comments] = useState('');
  
  //state for the error
  const [errorMsg, setErrorMsg] = useState('');




  
  const handleSubmit = (event) => {
    event.preventDefault();
    const post = { "title": title, "text": text, }
    
    // some first checks

   // If maximum_comments is provided, convert it to a number and check that it's valid and non-negative
    if (maximum_comments.trim() !== '') {
      const parsed = parseInt(maximum_comments);
      if (Number.isNaN(parsed)) {
        setErrorMsg('Maximum Comments must be a number');
        return;
      }
      if (parsed < 0) {
        setErrorMsg('Maximum Comments cannot be negative');
        return;
      }
      post.maximum_comments = parsed;
    }
    
    if (post.title.length == 0) {
      setErrorMsg('Title length cannot be 0');
    }
    else if (post.text.length == 0) {
      setErrorMsg('Text length cannot be 0');
    }
    else {
      props.addPost(post);
    }
  }





  return (
    <Card className="shadow-sm mt-4">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Create New Post
        </h5>
      </Card.Header>
      <Card.Body>
        {errorMsg && (
          <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {errorMsg}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-card-text me-2"></i>
              Title
            </Form.Label>
            <Form.Control 
              type="text" 
              required={true} 
              value={title} 
              onChange={event => setTitle(event.target.value)}
              placeholder="Enter post title"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-file-text me-2"></i>
              Content
            </Form.Label>
            <Form.Control 
              as="textarea"
              rows={4}
              required={true} 
              value={text} 
              onChange={event => setText(event.target.value)}
              placeholder="Write your post content here..."
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>
              <i className="bi bi-chat-dots me-2"></i>
              Maximum Comments
            </Form.Label>
            <Form.Control 
              type="number" 
              step={1} 
              required={false} 
              value={maximum_comments} 
              onChange={event => setMaximum_comments(event.target.value)}
              placeholder="Set maximum number of comments (optional)"
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit">
              <i className="bi bi-check-circle me-2"></i>
              Save Post
            </Button>
            <Link to={"/"}>
              <Button variant="outline-danger">
                <i className="bi bi-x-circle me-2"></i>
                Cancel
              </Button>
            </Link>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export { PostForm };