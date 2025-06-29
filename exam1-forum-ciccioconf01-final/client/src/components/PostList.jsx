import 'dayjs';
import { Table, Button, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router';

function PostTable(props) {
  const { posts } = props;
  
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-chat-square-text me-2"></i>
          Posts ({posts.length})
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: '20%' }}>
                <i className="bi bi-card-text me-1"></i>
                Title
              </th>
              <th className="text-center" style={{ width: '10%' }}>
                <i className="bi bi-person me-1"></i>
                Author
              </th>
              <th style={{ width: '35%' }}>
                <i className="bi bi-file-text me-1"></i>
                Content
              </th>
              <th className="text-center" style={{ width: '8%' }}>
              <i className="bi bi-chat-left-text me-1"></i>
              Actual Comments
              </th>
              <th className="text-center" style={{ width: '10%' }}>
              <i className="bi bi-bar-chart me-1"></i>
              Max Comments
              </th>
              <th style={{ width: '13%' }}>
                <i className="bi bi-clock me-1"></i>
                Date
              </th>
              <th className="text-center" style={{ width: '10%' }}>
                <i className="bi bi-gear me-1"></i>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  <i className="bi bi-inbox display-4 d-block mb-2"></i>
                  No posts present
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                
                <PostRow 
                  postData={post} 
                  key={post.title} 
                  delete={props.delete} 
                  loggedIn={props.loggedIn}
                  user={props.user}
                  loggedInTotp={props.loggedInTotp}
                />
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

function PostRow(props) {
  const { postData } = props;
  return (
    <tr className="align-middle">
      <td>
        <div className="fw-bold text-primary mb-1">
          {postData.title}
        </div>
      </td>
      
      <td className="text-center">
        <Badge bg="secondary" className="px-2 py-1">
          Name: {postData.authorName}
        </Badge>
      </td>
      
      <td>
        <div className="text-muted small" style={{ whiteSpace: 'pre-wrap' }}>
          {postData.text}
        </div>
      </td>

      <td className="text-center">
        <Badge bg="info" className="px-2 py-1">
          {postData.actual_comments}
        </Badge>
      </td>
      
      <td className="text-center">
        <Badge 
          bg={
            postData.maximum_comments === undefined || postData.maximum_comments === null
              ? 'secondary'
              : postData.maximum_comments > 10
              ? 'success'
              : 'warning'
          } 
          className="px-2 py-1"
        >
          {postData.maximum_comments === undefined || postData.maximum_comments === null
            ? <i className="bi bi-infinity fs-7"></i>
            : postData.maximum_comments}
        </Badge>
      </td>

      
      <td>
        <small className="text-muted">
          <i className="bi bi-calendar3 me-1"></i>
          {postData.timestamp}
        </small>
      </td>
      
      <td className="text-center">
        <div className="d-flex gap-1 justify-content-center">
          <Link 
            to={`/posts/${encodeURIComponent(postData.title)}/comments` }
            className="btn btn-outline-primary btn-sm me-1"
            title="Visualizza commenti"
          >
            <i className="bi bi-chat-square"></i>
          </Link>
           
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => props.delete(postData.title)}
            title="Elimina post"
            disabled={!props.loggedInTotp && (!props.loggedIn || props.user.id !== postData.authorID)}
          >
            <i className="bi bi-trash"></i>
          </Button>
        </div>
      </td>
    </tr>
  );
}

export { PostTable };