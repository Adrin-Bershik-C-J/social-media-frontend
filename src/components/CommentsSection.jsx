import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import config from "../config";
import Spinner from "./Spinner";

const URL = config.API_URL;

const CommentsSection = ({ postId }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});
  const [showReplyForm, setShowReplyForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [editLoading, setEditLoading] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [showComments, setShowComments] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${URL}/api/comments/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (parentId = null) => {
    const text = parentId ? replyText[parentId] : newComment;
    if (!text?.trim()) return;

    try {
      await axios.post(
        `${URL}/api/comments/${postId}`,
        { text, parent: parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (parentId) {
        setReplyText((prev) => ({ ...prev, [parentId]: "" }));
        setShowReplyForm((prev) => ({ ...prev, [parentId]: false }));
      } else {
        setNewComment("");
      }
      fetchComments();
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleCommentLike = async (commentId) => {
    setLikeLoading((prev) => ({ ...prev, [commentId]: true }));

    try {
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                likes: comment.likes.includes(user.id)
                  ? comment.likes.filter((id) => id !== user.id)
                  : [...comment.likes, user.id],
              }
            : comment
        )
      );

      await axios.post(
        `${URL}/api/comments/like/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error liking comment:", err);
    } finally {
      setLikeLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    setDeleteLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      await axios.delete(`${URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const startEditing = (commentId, text) => {
    setEditingCommentId(commentId);
    setEditedText(text);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditedText("");
  };

  const handleEditComment = async (commentId) => {
    if (!editedText.trim()) return;
    setEditLoading((prev) => ({ ...prev, [commentId]: true }));
    try {
      await axios.put(
        `${URL}/api/comments/${commentId}`,
        { text: editedText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditedText("");
      fetchComments();
    } catch (err) {
      console.error("Failed to edit comment:", err);
    } finally {
      setEditLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const renderComments = (parentId = null, depth = 0) => {
    const filtered = comments.filter(
      (c) => (c.parent?._id || null) === parentId
    );

    return filtered.map((comment) => (
      <div
        key={comment._id}
        className={`mt-3 sm:mt-4 ${
          depth > 0
            ? "ml-3 sm:ml-4 md:ml-6 border-l border-blue-100 pl-2 sm:pl-3 md:pl-4"
            : ""
        }`}
      >
        <div className="bg-gray-50 border rounded-xl p-2 sm:p-3">
          <div className="flex items-start gap-2 sm:gap-3">
            {comment.user.profilePicture ? (
              <img
                src={comment.user.profilePicture}
                alt="User"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                {comment.user.name?.charAt(0).toUpperCase() ||
                  comment.user.username?.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs sm:text-sm">
                <p className="font-semibold truncate">{comment.user.name}</p>
                <span className="text-gray-400 text-xs">
                  @{comment.user.username}
                </span>
              </div>

              {editingCommentId === comment._id ? (
                <div className="mt-2">
                  <textarea
                    rows={3}
                    className="w-full border px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm resize-none"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      disabled={editLoading[comment._id]}
                      className="bg-green-600 cursor-pointer text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex-shrink-0"
                    >
                      {editLoading[comment._id] ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 cursor-pointer text-gray-800 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm flex-shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs sm:text-sm text-gray-800 mt-1 break-words">
                    {comment.text}
                  </p>

                  <div className="flex items-center mt-2 gap-2 sm:gap-4 text-xs flex-wrap">
                    <button
                      onClick={() => handleCommentLike(comment._id)}
                      className={`inline-flex cursor-pointer items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors duration-200 flex-shrink-0 ${
                        comment.likes.includes(user.id)
                          ? "text-red-600 bg-red-50 hover:bg-red-100"
                          : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {likeLoading[comment._id] ? (
                        <Spinner />
                      ) : (
                        <>
                          <svg
                            className="w-3 h-3 flex-shrink-0"
                            fill={
                              comment.likes.includes(user.id)
                                ? "currentColor"
                                : "none"
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
                          <span className="min-w-0">
                            {comment.likes.length}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        setShowReplyForm((prev) => ({
                          ...prev,
                          [comment._id]: !prev[comment._id],
                        }))
                      }
                      className="inline-flex cursor-pointer items-center gap-1 px-2 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs transition-colors duration-200"
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

                    {comment.user._id?.toString() === user.id?.toString() && (
                      <>
                        <button
                          onClick={() =>
                            startEditing(comment._id, comment.text)
                          }
                          className="inline-flex cursor-pointer items-center gap-1 px-2 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs transition-colors duration-200"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="inline-flex cursor-pointer items-center gap-1 px-2 py-1 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs transition-colors duration-200"
                        >
                          {deleteLoading[comment._id]
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}

              {showReplyForm[comment._id] && (
                <div className="mt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={replyText[comment._id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [comment._id]: e.target.value,
                      }))
                    }
                    className="w-full border px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm resize-none"
                    placeholder="Write a reply..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateComment(comment._id)}
                      className="bg-blue-600 cursor-pointer text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm flex-shrink-0"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() =>
                        setShowReplyForm((prev) => ({
                          ...prev,
                          [comment._id]: false,
                        }))
                      }
                      className="bg-gray-300 cursor-pointer text-gray-800 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm flex-shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {renderComments(comment._id, depth + 1)}
      </div>
    ));
  };

  const handleToggleComments = () => {
    const newState = !showComments;
    setShowComments(newState);
    if (newState && comments.length === 0) {
      fetchComments();
    }
  };

  return (
    <div className="mt-4 sm:mt-6">
      <button
        onClick={handleToggleComments}
        className="mb-3 sm:mb-4 px-3 cursor-pointer sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm rounded-lg w-full sm:w-auto"
      >
        {showComments ? "Hide Comments" : "Show Comments"}
      </button>

      {showComments && (
        <div className="space-y-4">
          {/* Comment input section */}
          <div className="flex gap-2 sm:gap-3">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="User"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() ||
                  user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm resize-none"
                placeholder="Write a comment..."
              />
              <button
                onClick={() => handleCreateComment()}
                disabled={!newComment.trim()}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                Comment
              </button>
            </div>
          </div>

          {/* Comments display */}
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
              No comments yet. Be the first!
            </p>
          ) : (
            <div className="space-y-2 sm:space-y-4">{renderComments()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
