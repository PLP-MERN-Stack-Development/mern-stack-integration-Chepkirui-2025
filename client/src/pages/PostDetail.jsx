
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  const { loading, error, execute: fetchPost } = useApi(postService.getPost);
  const { loading: commentLoading, execute: addComment } = useApi(
    postService.addComment
  );
  const { execute: deletePostApi } = useApi(postService.deletePost);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const data = await fetchPost(id);
      setPost(data.data);
    } catch (err) {
      console.error('Failed to load post:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const data = await addComment(post._id, { content: commentContent });
      setPost(data.data);
      setCommentContent('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePostApi(post._id);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading post...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">Post not found</div>
      </div>
    );
  }

  const canEditPost =
    isAuthenticated &&
    (user?.id === post.author?._id || user?.role === 'admin');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Back to Posts
      </Link>

      {/* Post Header */}
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="h-96 bg-gray-200">
            <img
              src={`/uploads/${post.featuredImage}`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          {/* Category Badge */}
          <div className="mb-4">
            <span
              className="inline-block px-4 py-1 rounded-full text-white text-sm"
              style={{ backgroundColor: post.category?.color }}
            >
              {post.category?.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          {/* Author and Date */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div className="flex items-center gap-3">
              <img
                src={`/uploads/${post.author?.avatar || 'default-avatar.jpg'}`}
                alt={post.author?.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold">{post.author?.name}</div>
                <div className="text-sm text-gray-500">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {post.viewCount} views
            </div>
          </div>

          {/* Edit/Delete Buttons */}
          {canEditPost && (
            <div className="mb-6 flex gap-2">
              <Link
                to={`/posts/${post._id}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Post
              </Link>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className="prose max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-8">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Bio */}
          {post.author?.bio && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold mb-2">About the Author</h3>
              <p className="text-gray-700">{post.author.bio}</p>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">
              Comments ({post.comments?.length || 0})
            </h2>

            {/* Add Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="mb-8">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Write a comment..."
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={commentLoading}
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentContent.trim()}
                  className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <Link to="/login" className="text-blue-600 hover:text-blue-800">
                  Log in
                </Link>{' '}
                to leave a comment
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={`/uploads/${comment.user?.avatar || 'default-avatar.jpg'}`}
                        alt={comment.user?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {comment.user?.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;