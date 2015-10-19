// generate sudo UUID
var generate = function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}; 

var Post = React.createClass({
	loadCommentsFromServer: function() {
		$.ajax({
			url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
		});
	},
	handleCommentSubmit: function(comment) {
    const comments = this.state.data;
    const newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    const actions = this.handleCommentSubmit; 
    return (
      <div className="post">
        <h1>Comments</h1>
        <CommentList data={this.state.data} actions={actions}/>
      </div>
    );
  }
});

var CommentList = React.createClass({
	
	render: function() { 
    
    const a = _.filter(this.props.data, (com) => {
       return com.depth === '1'; 
    });

    const that = this; 

    let subComments = [];

    const commentNodes = a.map((comment, index) => {
    	
      return (
        <Comment data={that.props.data} actions={that.props.actions} author={comment.author} body={comment.text} key={index} depth={comment.depth} id={comment.id} subComments={subComments} parentid={comment.parentid}>
          {comment.text}
        </Comment>
      );
    });

    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var Comment = React.createClass({
  render: function() { 
  	const comments = this.props.data; 
  	const that = this; 

  	const replies = _.filter(comments, (replies) => {
  		return replies.parentid === that.props.id; 
  	});

  	console.log(replies); 
    return (
    	<div className="comment">
    		<h1>{this.props.author}</h1>
    		<CommentReplies data={this.props.data} replies={replies} actions={this.props.actions} />
    		<hr /> 
    		<CommentForm actions={this.props.actions} parentid={this.props.id} parentdepth={this.props.depth}></CommentForm>
    	</div> 
    )
    	
    
  }
});

var CommentReplies = React.createClass({
	render: function() {
		const that = this; 
		const replyList = this.props.replies; 
		let display = [];
		const replies = _.map(replyList, (reply) => {
			console.log(reply);
			return reply; 
		})
		console.log(replies + '*****');

		Object.keys(replies).map((rep) => {
			display.push(<li key={replies[rep].id} id={replies[rep].id} depth={replies[rep].depth}>{replies[rep].author} <CommentForm actions={that.props.actions} parentid={replies[rep].id} parentdepth={replies[rep].depth}></CommentForm></li>)
		});

		return (
			<div>

			 {display} 
			</div> 
		)
		
	}
})

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    const author = this.refs.author.value.trim();
    const text = this.refs.text.value.trim();
    const id = generate(); 
    const parentid = this.props.parentid;
    const depth = (parseInt(this.props.parentdepth) + 1) || 1; 

    if (!text || !author) {
      return;
    }
    this.props.actions({author: author, text: text, id: id, parentid: parentid, depth: depth});
    this.refs.author.value = '';
    this.refs.text.value = '';
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" ref="author" />
        <input type="text" placeholder="Say something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

ReactDOM.render(
  <Post url="/api/comments" pollInterval={6000} />,
  document.getElementById('content')
); 
