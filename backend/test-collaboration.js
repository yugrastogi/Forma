const http = require("http");
const jwt = require("jsonwebtoken");
const { io: ioClient } = require("socket.io-client");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const app = require("./src/app");
const { initSocket } = require("./src/socket");
const prisma = require("./src/config/prisma");

async function runTests() {
  console.log("=== STARTING FORMA COLLABORATION & SHARING TESTS ===");

  // 1. Start test server on random port
  const server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // 2. Setup test users and board
    const timestamp = Date.now();
    const ownerEmail = `owner_${timestamp}@example.com`;
    const editorEmail = `editor_${timestamp}@example.com`;
    const viewerEmail = `viewer_${timestamp}@example.com`;
    const strangerEmail = `stranger_${timestamp}@example.com`;

    const owner = await prisma.user.create({
      data: { name: "Board Owner", email: ownerEmail, password: "password123" },
    });
    const editor = await prisma.user.create({
      data: { name: "Board Editor", email: editorEmail, password: "password123" },
    });
    const viewer = await prisma.user.create({
      data: { name: "Board Viewer", email: viewerEmail, password: "password123" },
    });
    const stranger = await prisma.user.create({
      data: { name: "Stranger User", email: strangerEmail, password: "password123" },
    });

    const workspace = await prisma.workspace.create({
      data: { name: "Collab Workspace", ownerId: owner.id },
    });

    const board = await prisma.board.create({
      data: {
        title: "Multiplayer Test Board",
        workspaceId: workspace.id,
        ownerId: owner.id,
        elements: [{ id: "elem1", type: "rectangle", x: 10, y: 10 }],
      },
    });

    const ownerToken = jwt.sign({ userId: owner.id }, process.env.JWT_SECRET);
    const editorToken = jwt.sign({ userId: editor.id }, process.env.JWT_SECRET);
    const viewerToken = jwt.sign({ userId: viewer.id }, process.env.JWT_SECRET);
    const strangerToken = jwt.sign({ userId: stranger.id }, process.env.JWT_SECRET);

    console.log("✓ Test users and board created");

    // Helper for fetch with cookies
    async function apiRequest(path, method = "GET", body = null, token = ownerToken) {
      const headers = {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      };
      const res = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    }

    // TEST 1: Owner invites Editor
    console.log("\n[TEST 1] Owner invites user as EDITOR...");
    const inviteRes = await apiRequest(`/api/boards/${board.id}/collaborators`, "POST", {
      email: editorEmail,
      role: "EDITOR",
    }, ownerToken);
    if (inviteRes.status !== 201) throw new Error(`Invite failed: ${JSON.stringify(inviteRes.data)}`);
    console.log("✓ Editor invited successfully");

    // TEST 2: Owner invites Viewer
    console.log("\n[TEST 2] Owner invites user as VIEWER...");
    const inviteViewerRes = await apiRequest(`/api/boards/${board.id}/collaborators`, "POST", {
      email: viewerEmail,
      role: "VIEWER",
    }, ownerToken);
    if (inviteViewerRes.status !== 201) throw new Error(`Invite viewer failed: ${JSON.stringify(inviteViewerRes.data)}`);
    console.log("✓ Viewer invited successfully");

    // TEST 3: Prevent duplicate invitation
    console.log("\n[TEST 3] Prevent duplicate invitations...");
    const dupRes = await apiRequest(`/api/boards/${board.id}/collaborators`, "POST", {
      email: editorEmail,
      role: "EDITOR",
    }, ownerToken);
    if (dupRes.status !== 400) throw new Error("Expected 400 for duplicate invite");
    console.log("✓ Duplicate invitation rejected correctly");

    // TEST 4: Non-owner cannot invite
    console.log("\n[TEST 4] Editor cannot invite other users...");
    const nonOwnerInvite = await apiRequest(`/api/boards/${board.id}/collaborators`, "POST", {
      email: strangerEmail,
      role: "EDITOR",
    }, editorToken);
    if (nonOwnerInvite.status !== 403) throw new Error("Expected 403 for non-owner invite");
    console.log("✓ Non-owner invite rejected with 403 Forbidden");

    // TEST 5: Collaborator list
    console.log("\n[TEST 5] Fetch collaborator list...");
    const collabListRes = await apiRequest(`/api/boards/${board.id}/collaborators`, "GET", null, ownerToken);
    if (collabListRes.status !== 200) throw new Error("Failed to fetch collaborators");
    if (collabListRes.data.collaborators.length !== 2) throw new Error("Expected 2 collaborators");
    console.log(`✓ Collaborators fetched: ${collabListRes.data.collaborators.map(c => c.name + " (" + c.role + ")").join(", ")}`);

    // TEST 6: Change collaborator role
    console.log("\n[TEST 6] Change collaborator role...");
    const editorCollab = collabListRes.data.collaborators.find(c => c.email === editorEmail);
    const updateRoleRes = await apiRequest(
      `/api/boards/${board.id}/collaborators/${editorCollab.id}`,
      "PATCH",
      { role: "VIEWER" },
      ownerToken
    );
    if (updateRoleRes.status !== 200 || updateRoleRes.data.collaborator.role !== "VIEWER") {
      throw new Error("Failed to update collaborator role");
    }
    // Switch back to EDITOR
    await apiRequest(`/api/boards/${board.id}/collaborators/${editorCollab.id}`, "PATCH", { role: "EDITOR" }, ownerToken);
    console.log("✓ Collaborator role updated successfully");

    // TEST 7: Canvas editing permissions (Owner and Editor allowed, Viewer forbidden)
    console.log("\n[TEST 7] Canvas editing permissions...");
    // Editor can save canvas
    const editorSave = await apiRequest(`/api/boards/${board.id}/canvas`, "PUT", {
      elements: [{ id: "elem-editor", type: "line" }],
    }, editorToken);
    if (editorSave.status !== 200) throw new Error("Editor should be able to save canvas");
    console.log("✓ Editor successfully saved canvas");

    // Viewer cannot save canvas
    const viewerSave = await apiRequest(`/api/boards/${board.id}/canvas`, "PUT", {
      elements: [{ id: "elem-viewer", type: "line" }],
    }, viewerToken);
    if (viewerSave.status !== 403) throw new Error("Viewer saving canvas should be rejected with 403");
    console.log("✓ Viewer save canvas correctly rejected with 403 Forbidden");

    // Stranger cannot access canvas
    const strangerGet = await apiRequest(`/api/boards/${board.id}/canvas`, "GET", null, strangerToken);
    if (strangerGet.status !== 404) throw new Error("Unauthorized user should get 404");
    console.log("✓ Stranger access to board correctly rejected");

    // TEST 8: Socket.IO Authentication & Room Authorization
    console.log("\n[TEST 8] Socket.IO authentication and board room access...");

    // Helper to connect socket client
    function connectSocket(token) {
      return ioClient(baseUrl, {
        path: "/socket.io",
        extraHeaders: {
          Cookie: `token=${token}`,
        },
        transports: ["websocket"],
        reconnection: false,
      });
    }

    // Connect unauthenticated socket -> should fail
    const unauthSocket = ioClient(baseUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      reconnection: false,
    });

    const unauthError = await new Promise((resolve) => {
      unauthSocket.on("connect_error", (err) => resolve(err.message));
      unauthSocket.on("connect", () => resolve(null));
    });
    unauthSocket.disconnect();
    if (!unauthError) throw new Error("Unauthenticated socket should not connect");
    console.log(`✓ Unauthenticated socket rejected: "${unauthError}"`);

    // Connect owner socket and editor socket
    const socketOwner = connectSocket(ownerToken);
    const socketEditor = connectSocket(editorToken);
    const socketViewer = connectSocket(viewerToken);

    await Promise.all([
      new Promise((resolve) => socketOwner.on("connect", resolve)),
      new Promise((resolve) => socketEditor.on("connect", resolve)),
      new Promise((resolve) => socketViewer.on("connect", resolve)),
    ]);
    console.log("✓ Owner, Editor, and Viewer sockets connected successfully");

    // TEST 9: Stranger socket joining private board -> rejected
    console.log("\n[TEST 9] Unauthorized socket joining private board room...");
    const socketStranger = connectSocket(strangerToken);
    await new Promise((resolve) => socketStranger.on("connect", resolve));

    const strangerBoardError = await new Promise((resolve) => {
      socketStranger.on("board-error", (err) => resolve(err.message));
      socketStranger.emit("join-board", { boardId: board.id });
    });
    socketStranger.disconnect();
    if (!strangerBoardError.includes("Unauthorized")) {
      throw new Error(`Expected Unauthorized board-error, got: ${strangerBoardError}`);
    }
    console.log(`✓ Stranger room join rejected: "${strangerBoardError}"`);

    // TEST 10: Online Presence - Owner and Editor join board
    console.log("\n[TEST 10] Online Presence broadcast when users join...");
    const presencePromise = new Promise((resolve) => {
      socketOwner.on("presence-update", (data) => {
        if (data.users.length === 2) {
          resolve(data.users);
        }
      });
    });

    socketOwner.emit("join-board", { boardId: board.id });
    socketEditor.emit("join-board", { boardId: board.id });

    const activeUsers = await presencePromise;
    if (activeUsers.length !== 2) throw new Error("Expected 2 online users");
    console.log(`✓ Online presence broadcast working. Active users: ${activeUsers.map(u => u.name).join(", ")}`);

    // TEST 11: Real-time Live Cursors
    console.log("\n[TEST 11] Real-time Cursor Sharing...");
    const cursorPromise = new Promise((resolve) => {
      socketEditor.on("cursor-update", (data) => {
        resolve(data);
      });
    });

    socketOwner.emit("cursor-move", {
      boardId: board.id,
      x: 125,
      y: 350,
      pointer: { button: "down" },
    });

    const receivedCursor = await cursorPromise;
    if (receivedCursor.x !== 125 || receivedCursor.y !== 350 || receivedCursor.userName !== "Board Owner") {
      throw new Error(`Unexpected cursor data: ${JSON.stringify(receivedCursor)}`);
    }
    console.log(`✓ Cursor moved from Owner received on Editor: (${receivedCursor.x}, ${receivedCursor.y}) by ${receivedCursor.userName}`);

    // TEST 12: Real-time Canvas Synchronization
    console.log("\n[TEST 12] Real-time Canvas Scene Synchronization...");
    const canvasPromise = new Promise((resolve) => {
      socketOwner.on("canvas-update", (data) => {
        resolve(data);
      });
    });

    const newElements = [
      { id: "shape1", type: "rectangle", x: 100, y: 100, width: 200, height: 150 },
    ];

    socketEditor.emit("canvas-change", {
      boardId: board.id,
      elements: newElements,
      appState: { viewBackgroundColor: "#ffffff" },
    });

    const receivedCanvas = await canvasPromise;
    if (receivedCanvas.elements.length !== 1 || receivedCanvas.elements[0].id !== "shape1") {
      throw new Error(`Unexpected canvas update: ${JSON.stringify(receivedCanvas)}`);
    }
    console.log("✓ Canvas change broadcast from Editor received on Owner in real-time");

    // TEST 13: Viewer cannot broadcast canvas change
    console.log("\n[TEST 13] Viewer restricted from broadcasting canvas updates...");
    socketViewer.emit("join-board", { boardId: board.id });
    await new Promise((r) => setTimeout(r, 100));

    const viewerErrorPromise = new Promise((resolve) => {
      socketViewer.on("board-error", (data) => resolve(data.message));
    });

    socketViewer.emit("canvas-change", {
      boardId: board.id,
      elements: [{ id: "hacked", type: "ellipse" }],
    });

    const viewerError = await viewerErrorPromise;
    if (!viewerError.includes("Viewers are not permitted")) {
      throw new Error(`Expected viewer edit rejection, got: ${viewerError}`);
    }
    console.log(`✓ Viewer canvas change rejected: "${viewerError}"`);

    // TEST 14: Disconnect presence cleanup
    console.log("\n[TEST 14] Disconnect and presence cleanup...");
    const disconnectPresencePromise = new Promise((resolve) => {
      socketOwner.on("presence-update", (data) => {
        if (data.users.length === 1) {
          resolve(data.users);
        }
      });
    });

    socketEditor.disconnect();
    socketViewer.disconnect();

    const remainingUsers = await disconnectPresencePromise;
    if (remainingUsers.length !== 1 || remainingUsers[0].name !== "Board Owner") {
      throw new Error("Expected only Owner remaining after Editor disconnected");
    }
    console.log("✓ Presence automatically updated on disconnect. Remaining: Owner only");

    socketOwner.disconnect();

    // Clean up test data from DB
    await prisma.boardCollaborator.deleteMany({ where: { boardId: board.id } });
    await prisma.board.delete({ where: { id: board.id } });
    await prisma.workspace.delete({ where: { id: workspace.id } });
    await prisma.user.deleteMany({
      where: {
        id: { in: [owner.id, editor.id, viewer.id, stranger.id] },
      },
    });

    console.log("\n========================================================");
    console.log("ALL 14 MULTIPLAYER & COLLABORATION TESTS PASSED!");
    console.log("========================================================");

    server.close();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err);
    server.close();
    process.exit(1);
  }
}

runTests();
