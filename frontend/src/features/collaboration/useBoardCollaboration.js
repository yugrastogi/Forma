import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../../stores/authStore";

export function useBoardCollaboration({ boardId, excalidrawAPI, userRole, onRemoteSceneUpdate }) {
  const { user } = useAuthStore();
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [activeUsers, setActiveUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const socketRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);
  const lastCursorEmitRef = useRef(0);
  const pendingCanvasEmitRef = useRef(null);
  const collaboratorsMapRef = useRef(new Map());
  const onRemoteSceneUpdateRef = useRef(onRemoteSceneUpdate);

  useEffect(() => {
    onRemoteSceneUpdateRef.current = onRemoteSceneUpdate;
  });

  useEffect(() => {
    if (!boardId || !user) return;

    const socket = io(window.location.origin, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      setErrorMessage("");
      socket.emit("join-board", { boardId });
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err.message);
      setConnectionStatus("error");
      setErrorMessage(err.message || "Connection failed");
    });

    socket.on("reconnect_attempt", () => {
      setConnectionStatus("reconnecting");
    });

    socket.on("disconnect", (reason) => {
      setConnectionStatus("disconnected");
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("board-error", (data) => {
      setErrorMessage(data.message || "Board error occurred");
    });

    socket.on("joined-board", (data) => {
      if (data.users) {
        setActiveUsers(data.users);
      }
    });

    socket.on("presence-update", (data) => {
      if (data.boardId === boardId && data.users) {
        setActiveUsers(data.users);

        const currentActiveIds = new Set(data.users.map((u) => u.userId));
        let changed = false;
        for (const uid of collaboratorsMapRef.current.keys()) {
          if (!currentActiveIds.has(uid)) {
            collaboratorsMapRef.current.delete(uid);
            changed = true;
          }
        }
        if (changed && excalidrawAPI) {
          excalidrawAPI.updateScene({
            collaborators: new Map(collaboratorsMapRef.current),
          });
        }
      }
    });

    socket.on("cursor-update", (data) => {
      if (!excalidrawAPI || data.userId === user?.id) return;

      const userColor = data.color || "#3b82f6";
      collaboratorsMapRef.current.set(data.userId, {
        pointer: {
          x: data.x,
          y: data.y,
        },
        button: data.pointer?.button || "up",
        username: data.userName || "Collaborator",
        color: {
          background: userColor,
          stroke: userColor,
        },
      });

      excalidrawAPI.updateScene({
        collaborators: new Map(collaboratorsMapRef.current),
      });
    });

    socket.on("canvas-update", (data) => {
      if (data.userId === user?.id || !data.elements) return;

      isRemoteUpdateRef.current = true;
      if (onRemoteSceneUpdateRef.current) {
        onRemoteSceneUpdateRef.current(data.elements, data.appState);
      }
    });

    return () => {
      if (pendingCanvasEmitRef.current) {
        clearTimeout(pendingCanvasEmitRef.current);
      }
      socket.emit("leave-board", { boardId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [boardId, user, excalidrawAPI]);

  const broadcastCursor = useCallback(
    (x, y, button = "up") => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) return;

      const now = Date.now();
      if (now - lastCursorEmitRef.current < 35) return;
      lastCursorEmitRef.current = now;

      socket.emit("cursor-move", {
        boardId,
        x,
        y,
        pointer: { x, y, button },
      });
    },
    [boardId]
  );

  const broadcastCanvasChange = useCallback(
    (elements, appState) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) return;

      if (userRole === "VIEWER") return;

      if (isRemoteUpdateRef.current) {
        isRemoteUpdateRef.current = false;
        return;
      }

      if (pendingCanvasEmitRef.current) {
        clearTimeout(pendingCanvasEmitRef.current);
      }

      pendingCanvasEmitRef.current = setTimeout(() => {
        if (socket.connected) {
          socket.emit("canvas-change", {
            boardId,
            elements,
            appState: {
              viewBackgroundColor: appState?.viewBackgroundColor,
            },
          });
        }
      }, 50);
    },
    [boardId, userRole]
  );

  return {
    connectionStatus,
    activeUsers,
    errorMessage,
    broadcastCursor,
    broadcastCanvasChange,
    isRemoteUpdateRef,
  };
}
