// src/components/PostCard.jsx
import React from "react";

const PostCard = ({
  post,
  onLike,
  onEdit,
  onDelete,
  isEditing,
  editedCaption,
  setEditedCaption,
  saveEdit,
  cancelEdit,
}) => {
  if (isEditing) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
        <textarea
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          value={editedCaption}
          onChange={(e) => setEditedCaption(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={saveEdit} className="btn btn-success">
            Save
          </button>
          <button onClick={cancelEdit} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <p className="text-lg text-gray-900 mb-3">{post.caption}</p>
      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.createdAt).toLocaleString("en-US")}
      </p>
      <div className="flex items-center justify-between">
        <button
          onClick={onLike}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
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

        <div className="flex gap-2 mt-4">
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium rounded-lg transition-colors duration-200"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors duration-200"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
