const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("./config/prisma");
const { getBoardAccess } = require("./controllers/boardController");

const USER_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
];

function getUserColor(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

// In-memory presence map: boardId -> Map(socketId -> UserInfo)
const activePresence = new Map();

function getBoardPresence(boardId) {
  const map = activePresence.get(boardId);
  if (!map) return [];
  // Deduplicate by userId so multiple tabs from the same user show as one presence entry with multiple connections
  const userMap = new Map();
  for (const user of map.values()) {
    if (!userMap.has(user.userId)) {
      userMap.set(user.userId, {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        color: user.color,
      });
    }
  }
  return Array.from(userMap.values());
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies.token || socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      socket.color = getUserColor(user.id);
      next();
    } catch (err) {
      next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    // Join a specific board room
    socket.on("join-board", async ({ boardId }) => {
      try {
        if (!boardId || typeof boardId !== "string") {
          socket.emit("board-error", { message: "Invalid board ID" });
          return;
        }

        const access = await getBoardAccess(boardId, socket.user.id);
        if (!access) {
          socket.emit("board-error", { message: "Unauthorized to access this board" });
          return;
        }

        socket.currentBoardId = boardId;
        socket.userRole = access.role;
        socket.join(`board:${boardId}`);

        if (!activePresence.has(boardId)) {
          activePresence.set(boardId, new Map());
        }

        activePresence.get(boardId).set(socket.id, {
          socketId: socket.id,
          userId: socket.user.id,
          name: socket.user.name,
          email: socket.user.email,
          role: access.role,
          color: socket.color,
        });

        // Broadcast updated presence list
        const presenceList = getBoardPresence(boardId);
        io.to(`board:${boardId}`).emit("presence-update", {
          boardId,
          users: presenceList,
        });

        socket.emit("joined-board", {
          boardId,
          role: access.role,
          users: presenceList,
        });
      } catch (err) {
        console.error("join-board error:", err);
        socket.emit("board-error", { message: "Failed to join board room" });
      }
    });

    // Cursor position updates
    socket.on("cursor-move", ({ boardId, x, y, pointer }) => {
      if (!socket.currentBoardId || socket.currentBoardId !== boardId) {
        return;
      }

      socket.to(`board:${boardId}`).emit("cursor-update", {
        userId: socket.user.id,
        userName: socket.user.name,
        color: socket.color,
        x,
        y,
        pointer,
      });
    });

    // Canvas scene updates
    socket.on("canvas-change", ({ boardId, elements, appState }) => {
      if (!socket.currentBoardId || socket.currentBoardId !== boardId) {
        return;
      }

      // Viewers cannot modify the canvas
      if (socket.userRole === "VIEWER") {
        socket.emit("board-error", {
          message: "Viewers are not permitted to edit this canvas",
        });
        return;
      }

      socket.to(`board:${boardId}`).emit("canvas-update", {
        boardId,
        elements,
        appState,
        userId: socket.user.id,
      });
    });

    // Explicit leave board
    socket.on("leave-board", ({ boardId }) => {
      const bId = boardId || socket.currentBoardId;
      if (bId && activePresence.has(bId)) {
        activePresence.get(bId).delete(socket.id);
        if (activePresence.get(bId).size === 0) {
          activePresence.delete(bId);
        }
        io.to(`board:${bId}`).emit("presence-update", {
          boardId: bId,
          users: getBoardPresence(bId),
        });
      }
      if (bId) {
        socket.leave(`board:${bId}`);
      }
      socket.currentBoardId = null;
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      const bId = socket.currentBoardId;
      if (bId && activePresence.has(bId)) {
        activePresence.get(bId).delete(socket.id);
        if (activePresence.get(bId).size === 0) {
          activePresence.delete(bId);
        }
        io.to(`board:${bId}`).emit("presence-update", {
          boardId: bId,
          users: getBoardPresence(bId),
        });
      }
    });
  });

  return io;
}

module.exports = { initSocket };
