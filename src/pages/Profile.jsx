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
        "http://localhost:5000/api/users/update",
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
      const res = await axios.get("http://localhost:5000/api/posts/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPosts(res.data);
    } catch (err) {
      console.error("Error fetching my posts:", err);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/followers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowers(res.data);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/following", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowing(res.data);
    } catch (err) {
      console.error("Error fetching following:", err);
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
    if (isLoggedIn) {
      fetchMyPosts();
      fetchFollowers();
      fetchFollowing();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <p className="text-center mt-10">Please login.</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Profile</h2>
        <button
          onClick={handleLogout}
          className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        {editingProfile ? (
          <>
            <input
              type="text"
              className="border p-2 rounded w-full mb-2"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
            />
            <textarea
              className="border p-2 rounded w-full mb-2"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Bio"
            />
            <div className="flex gap-2">
              <button
                onClick={handleProfileUpdate}
                className="bg-green-600 text-white px-4 py-1 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="bg-gray-400 text-white px-4 py-1 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-gray-600">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
            )}
            <button
              onClick={() => setEditingProfile(true)}
              className="text-blue-600 hover:underline mt-2 block"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-around border-b border-gray-200">
        {["Posts", "Followers", "Following"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-medium ${
              activeTab === tab
                ? "text-black font-semibold border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4 space-y-4">
        {activeTab === "Posts" &&
          (myPosts.length === 0 ? (
            <p className="text-center text-gray-500">No posts yet.</p>
          ) : (
            myPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white p-4 rounded-xl shadow relative"
              >
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
                    <div className="flex items-center mt-3 space-x-2">
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
                    </div>
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
            ))
          ))}

        {activeTab === "Followers" && (
          <ul className="bg-white p-4 rounded-xl shadow">
            {followers.length === 0 ? (
              <p className="text-center text-gray-500">No followers yet.</p>
            ) : (
              followers.map((f) => (
                <li key={f._id} className="py-2 border-b last:border-none">
                  <span className="font-medium">{f.name}</span> @{f.username}
                </li>
              ))
            )}
          </ul>
        )}

        {activeTab === "Following" && (
          <ul className="bg-white p-4 rounded-xl shadow">
            {following.length === 0 ? (
              <p className="text-center text-gray-500">
                Not following anyone yet.
              </p>
            ) : (
              following.map((f) => (
                <li key={f._id} className="py-2 border-b last:border-none">
                  <span className="font-medium">{f.name}</span> @{f.username}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;
