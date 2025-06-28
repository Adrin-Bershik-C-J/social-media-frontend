import React from "react";

const UserCard = ({ user }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
        {user.name?.charAt(0)?.toUpperCase() ||
          user.username?.charAt(0)?.toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{user.name}</p>
        <p className="text-gray-600">@{user.username}</p>
      </div>
    </div>
  );
};

export default UserCard;
