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
		var current_parent = 't1'; 
		var that = this; 
		var sorted_comments = _.sortBy(this.props.data, 'depth');
		var com = []; 
		for (var comment in sorted_comments) {
  		if (current_parent === sorted_comments[comment].parentid) {		
    		com.push(sorted_comments[comment]); 
  		}
  		current_parent = sorted_comments[comment].id; 
		}
		
		return (
			<Comment list={com}>
				
			</Comment> 
		);
	}
});

var Comment = React.createClass({
  render: function() {
  	var list = this.props.list;
  	console.log(list);
  	var hold = {}; 

    return (
    	<div>
    	{list.author}
    	</div> 
    )
    	
   
    
    
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.refs.author.value.trim();
    var text = this.refs.text.value.trim();
    var id = generate(); 
    var parentid = this.props.parentid || null; 
    var depth = (parseInt(this.props.parentdepth) + 1) || 1; 

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
