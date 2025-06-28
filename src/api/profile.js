// src/api/profile.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const fetchMyPosts = (token) =>
  API.get("/posts/", { headers: { Authorization: `Bearer ${token}` } });

export const fetchFollowers = (token) =>
  API.get("/users/followers", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchFollowing = (token) =>
  API.get("/users/following", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateProfile = (data, token) =>
  API.put("/users/update", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deletePost = (id, token) =>
  API.delete(`/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const editPost = (id, caption, token) =>
  API.put(
    `/posts/edit/${id}`,
    { caption },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const toggleLike = (postId, token) =>
  API.post(
    `/posts/${postId}/like`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
