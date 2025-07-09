// src/components/PostCard.jsx
import React, { useState } from "react";
import CommentsSection from "./CommentsSection";
import { useAuth } from "../contexts/AuthContext";

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
  const { user: loggedInUser } = useAuth(); // ⬅️ get current user

  const isOwner = loggedInUser?.id === post.user._id; // ⬅️ owner check
  const [activeImages, setActiveImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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
      {/* User Info */}
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

      {/* Media Display */}
      {(post.images?.length > 0 || post.video) && (
        <div className="mb-4 space-y-4">
          {post.images?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.images.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Post image ${idx + 1}`}
                  onClick={() => {
                    setActiveImages(post.images);
                    setActiveImageIndex(idx);
                    setShowImageModal(true);
                  }}
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
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
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          // hour: "2-digit",
          // minute: "2-digit",
        })}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
        <button
          onClick={async () => {
            setIsLiking(true);
            try {
              await onLike();
            } finally {
              setIsLiking(false);
            }
          }}
          className={`flex cursor-pointer items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto text-center ${
            post.isLiked
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-gray-600 bg-gray-100 hover:bg-gray-200"
          }`}
          disabled={isLiking}
        >
          {isLiking ? (
            <svg
              className="animate-spin w-5 h-5 text-current"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
              />
            </svg>
          ) : (
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
          )}
          <span className="whitespace-nowrap">
            {post.likeCount} {post.likeCount === 1 ? "Like" : "Likes"}
          </span>
        </button>

        {isOwner && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={onEdit}
              className="inline-flex cursor-pointer items-center justify-center px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this post?")
                ) {
                  onDelete();
                }
              }}
              className="inline-flex cursor-pointer items-center justify-center px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      <CommentsSection postId={post._id} />

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <img
              src={activeImages[activeImageIndex]}
              alt="Full view"
              className="max-h-[80vh] w-auto rounded-xl"
            />
            <div className="flex justify-between mt-4 w-full px-6">
              <button
                disabled={activeImageIndex === 0}
                onClick={() => setActiveImageIndex((i) => i - 1)}
                className="text-white text-2xl disabled:opacity-30"
              >
                ⬅
              </button>
              <button
                disabled={activeImageIndex === activeImages.length - 1}
                onClick={() => setActiveImageIndex((i) => i + 1)}
                className="text-white text-2xl disabled:opacity-30"
              >
                ➡
              </button>
            </div>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-6 text-white text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
