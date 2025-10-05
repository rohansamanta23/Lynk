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

import FriendList from "../components/friendships/FriendList";
import FriendRequests from "../components/friendships/FriendRequests";
import SentRequests from "../components/friendships/SentRequests";
import FriendSearch from "../components/friendships/FriendSearch";
import BlockList from "../components/friendships/BlockList";

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
