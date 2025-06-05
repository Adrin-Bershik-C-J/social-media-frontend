import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({}); // Store comments by postId
  const [newComment, setNewComment] = useState({}); // Store new comment text by postId
  const [replyText, setReplyText] = useState({}); // Store reply text by commentId
  const [showComments, setShowComments] = useState({}); // Toggle comments visibility
  const [showReplyForm, setShowReplyForm] = useState({}); // Toggle reply form visibility

  const token = localStorage.getItem("token");

  // Fetch posts from feed
  const fetchFeedPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/comments/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  // Create a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim()) return;

    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        { caption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCaption("");
      fetchFeedPosts();
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  // Toggle like/unlike
  const handleLikeToggle = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likeCount: res.data.likeCount,
                isLiked: res.data.isLiked,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Error liking/unliking post:", err);
    }
  };

  // Create a comment
  const handleCreateComment = async (postId, parentId = null) => {
    const commentText = parentId ? replyText[parentId] : newComment[postId];
    if (!commentText?.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${postId}`,
        { text: commentText, parent: parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset the input
      if (parentId) {
        setReplyText((prev) => ({ ...prev, [parentId]: "" }));
        setShowReplyForm((prev) => ({ ...prev, [parentId]: false }));
      } else {
        setNewComment((prev) => ({ ...prev, [postId]: "" }));
      }

      // Refresh comments
      fetchComments(postId);
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  // Toggle comment like
  const handleCommentLike = async (commentId, postId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/comments/like/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh comments to get updated like count
      fetchComments(postId);
    } catch (err) {
      console.error("Error liking comment:", err);
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId) => {
    setShowComments((prev) => {
      const newState = { ...prev, [postId]: !prev[postId] };
      // Fetch comments when showing them for the first time
      if (newState[postId] && !comments[postId]) {
        fetchComments(postId);
      }
      return newState;
    });
  };

  // Render nested comments recursively
  const renderComments = (postComments, postId, parentId = null, depth = 0) => {
    const filteredComments = postComments.filter(
      (comment) =>
        comment.parent?._id === parentId || (!comment.parent && !parentId)
    );

    return filteredComments.map((comment) => (
      <div
        key={comment._id}
        className={`${depth > 0 ? "ml-6 border-l-2 border-gray-200 pl-3" : ""}`}
      >
        <div className="bg-gray-50 p-3 rounded-lg mb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-sm">
                {comment.user.name} (@{comment.user.username})
              </p>
              <p className="text-gray-800 mt-1">{comment.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center mt-2 space-x-3">
            <button
              onClick={() => handleCommentLike(comment._id, postId)}
              className={`text-xs ${
                comment.likes.includes(user._id)
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {comment.likes.includes(user._id) ? "❤️" : "🤍"}{" "}
              {comment.likes.length}
            </button>

            <button
              onClick={() =>
                setShowReplyForm((prev) => ({
                  ...prev,
                  [comment._id]: !prev[comment._id],
                }))
              }
              className="text-xs text-blue-600 hover:underline"
            >
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm[comment._id] && (
            <div className="mt-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText[comment._id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-1 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleCreateComment(postId, comment._id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700"
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Render nested replies */}
        {renderComments(postComments, postId, comment._id, depth + 1)}
      </div>
    ));
  };

  useEffect(() => {
    if (isLoggedIn) fetchFeedPosts();
  }, [isLoggedIn]);

  if (!isLoggedIn) return <p className="text-center mt-10">Please login.</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Home Feed</h2>
        <button
          onClick={() => navigate("/profile")}
          className="text-blue-600 hover:underline"
        >
          Go to Profile
        </button>
      </div>

      {/* Create Post */}
      <form onSubmit={handleCreatePost} className="mb-6">
        <textarea
          rows="3"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Post
        </button>
      </form>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-xl shadow">
            <p className="font-semibold">
              {post.user.name} (@{post.user.username})
            </p>
            <p className="text-gray-800 mt-1">{post.caption}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(post.createdAt).toLocaleString()}
            </p>

            {/* Like Button and Count */}
            <div className="flex items-center mt-3 space-x-4">
              <button
                onClick={() => handleLikeToggle(post._id)}
                className={`text-sm font-medium ${
                  post.isLiked ? "text-red-600" : "text-gray-600"
                }`}
              >
                {post.isLiked ? "❤️" : "🤍"} Like
              </button>
              <span className="text-sm text-gray-600">
                {post.likeCount} likes
              </span>

              <button
                onClick={() => toggleComments(post._id)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showComments[post._id] ? "Hide" : "Show"} Comments
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post._id] && (
              <div className="mt-4 border-t pt-3">
                {/* Add Comment Form */}
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment[post._id] || ""}
                      onChange={(e) =>
                        setNewComment((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCreateComment(post._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                    >
                      Comment
                    </button>
                  </div>
                </div>

                {/* Display Comments */}
                <div className="space-y-2">
                  {comments[post._id] && comments[post._id].length > 0 ? (
                    renderComments(comments[post._id], post._id)
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
