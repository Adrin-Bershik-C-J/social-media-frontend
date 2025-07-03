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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Add these new state variables after your existing useState declarations
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const postsPerPage = 5;

  // Following state
  const [followingStatus, setFollowingStatus] = useState({}); // Track follow status by userId
  const [followingUsers, setFollowingUsers] = useState(new Set()); // Set of user IDs being followed

  const token = localStorage.getItem("token");

  // Initialize following status from user data
  useEffect(() => {
    if (user && user.following) {
      setFollowingUsers(new Set(user.following));
      const initialStatus = {};
      user.following.forEach((userId) => {
        initialStatus[userId] = true;
      });
      setFollowingStatus(initialStatus);
    }
  }, [user]);

  // Add these functions before your existing handleCreatePost function
  // Add these functions before your existing handleCreatePost function
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types and limits
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || (isVideo && file.type === "video/mp4");
    });

    if (validFiles.length !== files.length) {
      alert(
        "Some files were skipped. Only JPEG, PNG, WebP images and MP4 videos are allowed."
      );
    }

    const images = validFiles.filter((f) => f.type.startsWith("image/"));
    const videos = validFiles.filter((f) => f.type.startsWith("video/"));

    if (images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    if (videos.length > 1) {
      alert("Only one video allowed");
      return;
    }

    setSelectedFiles(validFiles);

    // Create previews
    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "video",
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Clean up object URLs
    URL.revokeObjectURL(previews[index].url);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Fetch posts from feed with pagination
  const fetchFeedPosts = async (page = 1, reset = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/posts/feed?page=${page}&limit=${postsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const {
        posts: newPosts,
        totalPages: total,
        currentPage: current,
        hasMore,
      } = res.data;

      if (reset || page === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setCurrentPage(current);
      setTotalPages(total);
      setHasMore(hasMore);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load more posts
  const loadMorePosts = () => {
    if (hasMore && !loading) {
      fetchFeedPosts(currentPage + 1, false);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (targetUserId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/follow/${targetUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setFollowingStatus((prev) => ({
        ...prev,
        [targetUserId]: res.data.isFollowing,
      }));

      // Update following users set
      setFollowingUsers((prev) => {
        const newSet = new Set(prev);
        if (res.data.isFollowing) {
          newSet.add(targetUserId);
        } else {
          newSet.delete(targetUserId);
        }
        return newSet;
      });

      // Update posts to reflect new follow status
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.user._id === targetUserId
            ? { ...post, isFollowing: res.data.isFollowing }
            : post
        )
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
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
    if (!caption.trim() && selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      await axios.post("http://localhost:5000/api/posts/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form
      setCaption("");
      setSelectedFiles([]);
      setPreviews([]);

      // Clean up preview URLs
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));

      // Refresh the feed
      fetchFeedPosts(1, true);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsUploading(false);
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
        className={`${depth > 0 ? "ml-6 border-l-2 border-blue-100 pl-4" : ""}`}
      >
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex items-start gap-3">
            {comment.user.profilePicture ? (
              <img
                src={comment.user.profilePicture}
                alt="User"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {comment.user.name?.charAt(0)?.toUpperCase() ||
                  comment.user.username?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm">
                  {comment.user.name}
                </p>
                <p className="text-gray-500 text-sm">
                  @{comment.user.username}
                </p>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed mb-2">
                {comment.text}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center mt-3 gap-4">
            <button
              onClick={() => handleCommentLike(comment._id, postId)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors duration-200 ${
                comment.likes.includes(user._id)
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-gray-600 bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <svg
                className="w-3 h-3"
                fill={
                  comment.likes.includes(user._id) ? "currentColor" : "none"
                }
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {comment.likes.length}
            </button>

            <button
              onClick={() =>
                setShowReplyForm((prev) => ({
                  ...prev,
                  [comment._id]: !prev[comment._id],
                }))
              }
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm[comment._id] && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex gap-3">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={() => handleCreateComment(postId, comment._id)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
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
    if (isLoggedIn) fetchFeedPosts(1, true);
  }, [isLoggedIn]);

  if (!isLoggedIn)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-xl text-gray-700 font-medium">
            Please login to continue
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Home Feed</h1>
            <p className="text-gray-600 mt-1">
              Stay connected with your network
            </p>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </button>
        </div>

        {/* Create Post Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex items-start gap-4">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="User"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() ||
                    user.username?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <textarea
                  rows="4"
                  placeholder="What's on your mind?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                />
              </div>
            </div>

            {/* File Input */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg cursor-pointer transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Add Media
              </label>
              <span className="text-sm text-gray-500">
                Up to 5 images or 1 video (JPEG, PNG, WebP, MP4)
              </span>
            </div>

            {/* File Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {preview.type === "image" ? (
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={preview.url}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  (!caption.trim() && selectedFiles.length === 0) || isUploading
                }
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Share Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500">
                Follow some users or create your first post to get started!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                {/* Post Header */}
                <div className="flex items-start gap-4 mb-4">
                  {post.user.profilePicture ? (
                    <img
                      src={post.user.profilePicture}
                      alt="User"
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {post.user.name?.charAt(0)?.toUpperCase() ||
                        post.user.username?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {post.user.name}
                        </h3>
                        <span className="text-gray-500">
                          @{post.user.username}
                        </span>
                      </div>
                      {/* Follow/Unfollow Button */}
                      {post.user._id !== user._id && (
                        <button
                          onClick={() => handleFollowToggle(post.user._id)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                            followingStatus[post.user._id] ||
                            followingUsers.has(post.user._id)
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {followingStatus[post.user._id] ||
                          followingUsers.has(post.user._id) ? (
                            <>
                              <svg
                                className="w-4 h-4 inline mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Following
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 inline mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                {/* Post Content */}
                <div className="mb-6">
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {post.caption}
                  </p>

                  {/* Render Images if present */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {post.images.map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`Post image ${idx + 1}`}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  )}

                  {/* Render Video if present */}
                  {post.video && (
                    <div className="mt-4">
                      <video
                        controls
                        className="w-full max-w-full rounded-xl border border-gray-300"
                      >
                        <source src={post.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 pb-4 border-b border-gray-200">
                  <button
                    onClick={() => handleLikeToggle(post._id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      post.isLiked
                        ? "text-red-600 bg-red-50 hover:bg-red-100"
                        : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={post.isLiked ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    {post.likeCount} {post.likeCount === 1 ? "Like" : "Likes"}
                  </button>

                  <button
                    onClick={() => toggleComments(post._id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {showComments[post._id] ? "Hide Comments" : "Show Comments"}
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="mt-6 space-y-4">
                    {/* Add Comment Form */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() ||
                          user.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 flex gap-3">
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
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <button
                          onClick={() => handleCreateComment(post._id)}
                          disabled={!newComment[post._id]?.trim()}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          Comment
                        </button>
                      </div>
                    </div>

                    {/* Display Comments */}
                    <div className="space-y-3">
                      {comments[post._id] && comments[post._id].length > 0 ? (
                        renderComments(comments[post._id], post._id)
                      ) : (
                        <div className="text-center py-8">
                          <svg
                            className="w-12 h-12 text-gray-400 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <p className="text-gray-500 font-medium">
                            No comments yet
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Be the first to share your thoughts!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Pagination Controls */}
          {posts.length > 0 && (
            <div className="flex flex-col items-center gap-4 py-8">
              {/* Load More Button */}
              {hasMore && (
                <button
                  onClick={loadMorePosts}
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      Load More Posts
                    </>
                  )}
                </button>
              )}

              {/* Pagination Info */}
              <div className="text-sm text-gray-500">
                {!hasMore && posts.length > 0 && (
                  <p>
                    You've reached the end! Showing all {posts.length} posts.
                  </p>
                )}
                {hasMore && posts.length > 0 && (
                  <p>
                    Showing {posts.length} posts • Page {currentPage} of{" "}
                    {totalPages}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
