import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, isLoggedIn } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");

  const [activeTab, setActiveTab] = useState("Posts");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditBio(user.bio || "");
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    try {
      const res = await axios.put(
        "https://social-media-backend-uv33.onrender.com/api/users/update",
        { name: editName, bio: editBio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(res.data));
      setEditingProfile(false);
      window.location.reload(); // optional
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get("https://social-media-backend-uv33.onrender.com/api/posts/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPosts(res.data);
    } catch (err) {
      console.error("Error fetching my posts:", err);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await axios.get("https://social-media-backend-uv33.onrender.com/api/users/followers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowers(res.data);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await axios.get("https://social-media-backend-uv33.onrender.com/api/users/following", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowing(res.data);
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://social-media-backend-uv33.onrender.com/api/posts/${id}`, {
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
        `https://social-media-backend-uv33.onrender.com/api/posts/edit/${id}`,
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
        `https://social-media-backend-uv33.onrender.com/api/posts/${postId}/like`,
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
    if (isLoggedIn) {
      fetchMyPosts();
      fetchFollowers();
      fetchFollowing();
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account and posts</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          {editingProfile ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleProfileUpdate}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.username?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.name}
                    </h2>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                </div>
                {user.bio && (
                  <p className="text-gray-700 leading-relaxed mb-4 max-w-2xl">
                    {user.bio}
                  </p>
                )}
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900">
                      {myPosts.length}
                    </div>
                    <div className="text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900">
                      {followers.length}
                    </div>
                    <div className="text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-gray-900">
                      {following.length}
                    </div>
                    <div className="text-gray-600">Following</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex">
              {["Posts", "Followers", "Following"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
                    activeTab === tab
                      ? "text-blue-600 bg-white border-b-2 border-blue-600 -mb-px"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "Posts" && (
              <div className="space-y-6">
                {myPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">No posts yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Share your first post to get started
                    </p>
                  </div>
                ) : (
                  myPosts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    >
                      {editingPostId === post._id ? (
                        <div className="space-y-4">
                          <textarea
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(post._id)}
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingPostId(null)}
                              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-900 text-lg leading-relaxed mb-3">
                            {post.caption}
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            {new Date(post.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleLikeToggle(post._id)}
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
                                {post.likeCount}{" "}
                                {post.likeCount === 1 ? "Like" : "Likes"}
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingPostId(post._id);
                                  setEditedCaption(post.caption);
                                }}
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
                                onClick={() => handleDelete(post._id)}
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
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "Followers" && (
              <div>
                {followers.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">No followers yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Start sharing content to gain followers
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followers.map((f) => (
                      <div
                        key={f._id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {f.name?.charAt(0)?.toUpperCase() ||
                            f.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {f.name}
                          </p>
                          <p className="text-gray-600">@{f.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Following" && (
              <div>
                {following.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      Not following anyone yet
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Discover and follow interesting people
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {following.map((f) => (
                      <div
                        key={f._id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                          {f.name?.charAt(0)?.toUpperCase() ||
                            f.username?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {f.name}
                          </p>
                          <p className="text-gray-600">@{f.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
