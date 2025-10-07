import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Friendship from "../pages/Main/Friendship";
import Chat from "../pages/Main/Chat";
import Home from "../pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "../pages/NotFound";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../socket/SocketProvider";

import FriendList from "../components/friendship/FriendList";
import FriendRequests from "../components/friendship/FriendRequests";
import SentRequests from "../components/friendship/SentRequests";
import FriendSearch from "../components/friendship/FriendSearch";
import BlockList from "../components/friendship/BlockList";
import ChatWindow from "../components/conversation/ChatWindow";

const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <ProtectedRoute>
          <SocketProvider>
            <MainLayout />
          </SocketProvider>
        </ProtectedRoute>
      </AuthProvider>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Navigate to='chat' replace />,
      },
      {
        path: "chat",
        element: <Chat />,
        children: [
          {
            index: true,
            element: (
              <div className='p-4 text-gray-400'>
                Select a conversation to start chatting
              </div>
            ),
          },
          {
            path: ":conversationId",
            element: <ChatWindow />,
          },
        ],
      },
      {
        path: "friendship",
        element: <Friendship />,
        children: [
          {
            index: true,
            element: <Navigate to='friendlist' replace />,
          },
          {
            path: "friendlist",
            element: <FriendList />,
          },
          {
            path: "request",
            element: <FriendRequests />,
          },
          {
            path: "sent",
            element: <SentRequests />,
          },
          {
            path: "search",
            element: <FriendSearch />,
          },
          {
            path: "blocklist",
            element: <BlockList />,
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <AuthProvider>
        <AuthLayout />
      </AuthProvider>
    ),
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
]);

export default AppRouter;
