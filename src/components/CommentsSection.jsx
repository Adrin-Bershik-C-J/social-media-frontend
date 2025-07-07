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
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
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
        className={`mt-4 ${depth > 0 ? "ml-6 border-l border-blue-100 pl-4" : ""}`}
      >
        <div className="bg-gray-50 border rounded-xl p-3">
          <div className="flex items-start gap-3">
            {comment.user.profilePicture ? (
              <img
                src={comment.user.profilePicture}
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {comment.user.name?.charAt(0).toUpperCase() ||
                  comment.user.username?.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex gap-2 text-sm font-semibold">
                <p>{comment.user.name}</p>
                <span className="text-gray-400">@{comment.user.username}</span>
              </div>

              {editingCommentId === comment._id ? (
                <div className="mt-2">
                  <textarea
                    rows={2}
                    className="w-full border px-3 py-2 rounded-lg text-sm"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      disabled={editLoading[comment._id]}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      {editLoading[comment._id] ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-800 mt-1">{comment.text}</p>

                  <div className="flex items-center mt-2 gap-4 text-xs flex-wrap">
                    <button
                      onClick={() => handleCommentLike(comment._id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium transition-colors duration-200 ${
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
                            className="w-3 h-3"
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
                          {comment.likes.length}
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
                      className="text-blue-600 hover:underline"
                    >
                      Reply
                    </button>

                    {comment.user._id?.toString() === user.id?.toString() && (
                      <>
                        <button
                          onClick={() => startEditing(comment._id, comment.text)}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-red-600 hover:underline"
                        >
                          {deleteLoading[comment._id] ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}

              {showReplyForm[comment._id] && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText[comment._id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [comment._id]: e.target.value,
                      }))
                    }
                    className="flex-1 border px-3 py-2 rounded-lg text-sm"
                    placeholder="Write a reply..."
                  />
                  <button
                    onClick={() => handleCreateComment(comment._id)}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Reply
                  </button>
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
    <div className="mt-6">
      <button
        onClick={handleToggleComments}
        className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-lg"
      >
        {showComments ? "Hide Comments" : "Show Comments"}
      </button>

      {showComments && (
        <>
          <div className="flex gap-3 mb-4">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0).toUpperCase() ||
                  user.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border px-4 py-2 rounded-lg text-sm"
              placeholder="Write a comment..."
            />
            <button
              onClick={() => handleCreateComment()}
              disabled={!newComment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Comment
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">{renderComments()}</div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentsSection;
