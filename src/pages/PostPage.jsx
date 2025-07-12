import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import PostCard from "../components/PostCard";
import { useAuth } from "../contexts/AuthContext";

const URL = config.API_URL;

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");

  const token = localStorage.getItem("token");

  /* ---------------- Helpers ---------------- */
  const enrichPost = useCallback(
    (raw) => ({
      ...raw,
      likeCount: raw.likes?.length || 0,
      isLiked: raw.likes?.includes(user?.id) || false,
    }),
    [user?.id]
  );

  /* -------------- Fetch Post --------------- */
  useEffect(() => {
    if (user === null) return; // still loading auth from storage
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await axios.get(`${URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(enrichPost(res.data));
        setEditedCaption(res.data.caption || "");
      } catch (err) {
        console.error("Failed to load post:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, isLoggedIn, user, navigate, token, enrichPost]);

  /* -------------- Handlers ----------------- */
  const handleLike = async () => {
    try {
      const res = await axios.post(`${URL}/api/posts/${post._id}/like`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost((prev) => ({
        ...prev,
        isLiked: res.data.isLiked,
        likeCount: res.data.likeCount,
      }));
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    setIsEditing(false);
    setEditedCaption(post.caption || "");
  };

  const saveEdit = async () => {
    try {
      const res = await axios.patch(
        `${URL}/api/posts/${post._id}`,
        { caption: editedCaption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost(enrichPost(res.data));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to edit post:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${URL}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/");
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  /* -------------- Render ------------------- */
  if (loading) return <p className="text-center py-10">Loading…</p>;
  if (!post)
    return <p className="text-center py-10 text-gray-600">Post not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <PostCard
        post={post}
        onLike={handleLike}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isEditing={isEditing}
        editedCaption={editedCaption}
        setEditedCaption={setEditedCaption}
        saveEdit={saveEdit}
        cancelEdit={cancelEdit}
      />
    </div>
  );
}
