import React, { useState, useEffect } from "react";
import { dummyConnectionsData, DEFAULT_PROFILE_PICTURE } from "../assets/assets";
import { Eye, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "../components/Button";

const Messages = () => {
  const { connections } = useSelector((state) => state.connections);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
          <p className="text-slate-600">Talk to your friends and family</p>
        </div>
        {/* connected user */}
        <div className="flex flex-col gap-3">
          {!loading ? (
            connections.length > 0 ? (
              connections.map((user) => (
                <div
                  key={user._id}
                  className="max-w-xl flex flex-warp gap-5 p-6 bg-white shadow rounded-md hover:shadow-lg transition-shadow"
                >
                  <img
                    onClick={() => navigate(`/profile/${user._id}`)}
                    src={user.profile_picture || DEFAULT_PROFILE_PICTURE}
                    className="cursor-pointer rounded-full size-12 mx-auto"
                    alt=""
                  />
                  <div className="flex-1">
                    <p className="font-medium cursor-pointer text-slate-700">
                      {user.full_name}
                    </p>
                    <p className="text-slate-500">@{user.username}</p>
                    <p className="text-sm text-gray-600">{user.bio}</p>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => navigate(`/messages/${user._id}`)}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => navigate(`/profile/${user._id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">
                  No connections yet. Start connecting with people!
                </p>
              </div>
            )
          ) : (
            // Skeleton loaders
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="max-w-xl flex flex-warp gap-5 p-6 bg-white shadow rounded-md animate-pulse"
                >
                  <div className="rounded-full size-12 bg-gray-200 mx-auto"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="size-10 bg-gray-200 rounded"></div>
                    <div className="size-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
