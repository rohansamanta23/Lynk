// src/socket/SocketProvider.jsx
import { createContext, useContext } from "react";
import { socket } from "./index";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // No auto-connect logic here. Socket will be connected/disconnected by AuthContext.

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
