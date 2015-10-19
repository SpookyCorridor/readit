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
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
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
    var actions = this.handleCommentSubmit; 
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
		var that = this; 
		var com = []; 
		for (var comment in sorted_comments) {
  		if (current_parent === sorted_comments[comment].parentid) {		
    		com.push(sorted_comments[comment]); 
  		}
  		current_parent = sorted_comments[comment].id; 
  		console.log(current_parent)
		}
		
		return (
			<Comment author={comment.author} body={comment.text} key={index} id={comment.id} parentid={comment.parentid} actions={that.props.actions}>
				{comment.text}
			</Comment> 
		);
	}
});
