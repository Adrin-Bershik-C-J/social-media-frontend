import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

const Profile = () => {
  const { user, isLoggedIn } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedCaption, setEditedCaption] = useState("");
  const token = localStorage.getItem("token");

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPosts(res.data);
    } catch (err) {
      console.error("Error fetching my posts:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMyPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/posts/edit/${id}`,
        { caption: editedCaption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPostId(null);
      setEditedCaption("");
      fetchMyPosts();
    } catch (err) {
      console.error("Error editing post:", err);
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMyPosts((prevPosts) =>
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
      console.error("Error toggling like:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchMyPosts();
  }, [isLoggedIn]);

  if (!isLoggedIn) return <p className="text-center mt-10">Please login.</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>

      {/* User Info */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-gray-600">@{user.username}</p>
      </div>

      {/* My Posts */}
      <div className="space-y-4">
        {myPosts.map((post) => (
          <div key={post._id} className="bg-white p-4 rounded-xl shadow relative">
            {editingPostId === post._id ? (
              <>
                <textarea
                  className="w-full p-2 border rounded-lg"
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(post._id)}
                    className="bg-green-600 text-white px-4 py-1 rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPostId(null)}
                    className="bg-gray-400 text-white px-4 py-1 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800">{post.caption}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(post.createdAt).toLocaleString()}
                </p>

                {/* Like Button */}
                <div className="flex items-center mt-3 space-x-2">
                  <button
                    onClick={() => handleLikeToggle(post._id)}
                    className={`text-sm font-medium ${
                      post.isLiked ? "text-red-600" : "text-gray-600"
                    }`}
                  >
                    {post.isLiked ? "❤️" : "🤍"} Like
                  </button>
                  <span className="text-sm text-gray-600">{post.likeCount} likes</span>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setEditingPostId(post._id);
                      setEditedCaption(post.caption);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
