// src/components/PostCard.jsx
import React from "react";
import CommentsSection from "./CommentsSection";

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
        <div className="flex items-center gap-3 mb-4">
          {post.user?.profilePicture ? (
            <img
              src={post.user.profilePicture}
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {post.user?.name?.charAt(0)?.toUpperCase() ||
                post.user?.username?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{post.user?.name}</p>
            <p className="text-sm text-gray-500">@{post.user?.username}</p>
          </div>
        </div>

        <textarea
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={editedCaption}
          onChange={(e) => setEditedCaption(e.target.value)}
          placeholder="Edit your caption..."
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={saveEdit}
            className="inline-flex cursor-pointer items-center px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 font-medium rounded-lg transition-colors duration-200"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Save
          </button>

          <button
            onClick={cancelEdit}
            className="inline-flex cursor-pointer items-center px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors duration-200"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        {post.user?.profilePicture ? (
          <img
            src={post.user.profilePicture}
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {post.user?.name?.charAt(0)?.toUpperCase() ||
              post.user?.username?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{post.user?.name}</p>
          <p className="text-sm text-gray-500">@{post.user?.username}</p>
        </div>
      </div>
      <p className="text-lg text-gray-900 mb-3">{post.caption}</p>

      {(post.images?.length > 0 || post.video) && (
        <div className="mb-4 space-y-4">
          {post.images?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.images.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Post image ${idx + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {post.video && (
            <video
              controls
              src={post.video}
              className="w-full rounded-lg max-h-[400px] object-contain"
            />
          )}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">
        {new Date(post.createdAt).toLocaleString("en-US")}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
        <button
          onClick={onLike}
          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto text-center
          ${
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
          <span className="whitespace-nowrap">
            {post.likeCount} {post.likeCount === 1 ? "Like" : "Likes"}
          </span>
        </button>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
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
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this post?")
              ) {
                onDelete();
              }
            }}
            className="inline-flex items-center justify-center px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
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

      {/* Comments Section */}
      <CommentsSection postId={post._id} />
    </div>
  );
};

export default PostCard;
