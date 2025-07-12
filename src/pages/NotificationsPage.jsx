import React, { useEffect, useState } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const {
    notifications,
    fetchNotifications,
    markAllRead,
    hasMore,
    unreadCount,
    markAsRead,
  } = useNotifications();

  const navigate = useNavigate();
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMarkedAllRead, setHasMarkedAllRead] = useState(false);

  /* first load */
  useEffect(() => {
    fetchNotifications(true);
  }, []);

  /* mark all read after a short delay to ensure user sees the count */
  // useEffect(() => {
  //   if (notifications.length > 0 && !hasMarkedAllRead) {
  //     const timer = setTimeout(() => {
  //       markAllRead();
  //       setHasMarkedAllRead(true);
  //     }, 1000); // 1 second delay to show user the unread count

  //     return () => clearTimeout(timer);
  //   }
  // }, [notifications.length, hasMarkedAllRead, markAllRead]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    await fetchNotifications();
    setLoadingMore(false);
  };

  /* navigate on click */
  const handleClick = (notif) => {
    if (!notif.read) {
      // optimistic – no need to await
      markAsRead(notif._id);
    }
    const { type, sender, post } = notif;
    const postId = typeof post === "string" ? post : post?._id;

    if (
      [
        "new_post",
        "like_post",
        "comment_post",
        "reply_comment",
        "like_comment",
      ].includes(type) &&
      postId
    ) {
      navigate(`/post/${postId}`);
    } else if (type === "follow" && sender?.username) {
      navigate(`/user/${sender.username}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
            {unreadCount} unread
          </span>
        )}
      </div>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet.</p>
      )}

      <ul className="space-y-2">
        {notifications.map((notif) => (
          <li
            key={notif._id}
            onClick={() => handleClick(notif)}
            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition
              ${
                notif.read
                  ? "bg-gray-50 hover:bg-gray-100"
                  : "bg-blue-50 hover:bg-blue-100"
              }
            `}
          >
            {/* avatar */}
            {notif.sender?.profilePicture ? (
              <img
                src={notif.sender.profilePicture}
                alt={notif.sender.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                              flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              >
                {(
                  notif.sender?.name?.[0] ||
                  notif.sender?.username?.[0] ||
                  "?"
                ).toUpperCase()}
              </div>
            )}

            {/* content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm leading-snug">
                  <span className="font-medium text-gray-900">
                    {notif.sender?.name || "Someone"}
                  </span>{" "}
                  <span className="text-gray-500">
                    @{notif.sender?.username || "unknown"}
                  </span>
                </p>
                {!notif.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </div>
              <p className="text-sm text-gray-800">{renderBody(notif.type)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded
                       hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loadingMore ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

/* only the action phrase */
const renderBody = (type) => {
  switch (type) {
    case "new_post":
      return "posted something new.";
    case "like_post":
      return "liked your post.";
    case "comment_post":
      return "commented on your post.";
    case "reply_comment":
      return "replied to your comment.";
    case "like_comment":
      return "liked your comment.";
    case "follow":
      return "started following you.";
    default:
      return "sent you a notification.";
  }
};

export default NotificationsPage;
