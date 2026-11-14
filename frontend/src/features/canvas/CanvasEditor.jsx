import { forwardRef, useState, useRef, useImperativeHandle, useCallback, useEffect } from "react";
import { boardService } from "../../services/boardService";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { normalizeElements } from "./canvasUtils";
import { useBoardCollaboration } from "../collaboration/useBoardCollaboration";

const CanvasEditor = forwardRef(function CanvasEditor(
  {
    boardId,
    initialElements = [],
    initialAppState = {},
    userRole = "OWNER",
    onSaveStatusChange,
    onCollaborationChange,
  },
  ref
) {
  const [elements, setElements] = useState(initialElements);
  const [appState, setAppState] = useState(initialAppState);
  const [, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  const savedElementsRef = useRef(
    JSON.stringify(normalizeElements(initialElements))
  );

  const handleRemoteSceneUpdate = useCallback((remoteElements) => {
    setElements(remoteElements);
    if (excalidrawAPI) {
      excalidrawAPI.updateScene({
        elements: remoteElements,
      });
    }
  }, [excalidrawAPI]);

  const {
    connectionStatus,
    activeUsers,
    errorMessage,
    broadcastCursor,
    broadcastCanvasChange,
  } = useBoardCollaboration({
    boardId,
    excalidrawAPI,
    userRole,
    onRemoteSceneUpdate: handleRemoteSceneUpdate,
  });

  useEffect(() => {
    onCollaborationChange?.({
      connectionStatus,
      activeUsers,
      errorMessage,
    });
  }, [connectionStatus, activeUsers, errorMessage, onCollaborationChange]);

  const handleCanvasChange = (updatedElements, updatedAppState) => {
    setElements(updatedElements);
    setAppState(updatedAppState);

    // Broadcast change to other collaborators
    broadcastCanvasChange(updatedElements, updatedAppState);

    const currentElements = JSON.stringify(
      normalizeElements(updatedElements)
    );

    onSaveStatusChange?.({
      status:
        currentElements === savedElementsRef.current
          ? "saved"
          : "unsaved",
      lastSaved,
      isSaving: false,
    });
  };

  const handleSaveCanvas = async () => {
    if (userRole === "VIEWER") {
      alert("Viewers cannot modify this canvas.");
      return;
    }

    setIsSaving(true);

    onSaveStatusChange?.({
      status: "saving",
      lastSaved,
      isSaving: true,
    });

    try {
      const result = await boardService.saveBoardCanvas(boardId, {
        elements,
        appState,
      });

      savedElementsRef.current = JSON.stringify(
        normalizeElements(elements)
      );

      const savedTime = new Date(result.updatedAt || Date.now());
      setLastSaved(savedTime);

      onSaveStatusChange?.({
        status: "saved",
        lastSaved: savedTime,
        isSaving: false,
      });
    } catch (err) {
      onSaveStatusChange?.({
        status: "error",
        lastSaved,
        isSaving: false,
      });

      alert(err.response?.data?.message || "Failed to save canvas");
    } finally {
      setIsSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    saveCanvas: handleSaveCanvas,
  }));

  return (
    <div className="h-full w-full">
      <Excalidraw
        theme="light"
        viewModeEnabled={userRole === "VIEWER"}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements,
          appState: {
            ...appState,
            collaborators: new Map(),
          },
        }}
        onChange={handleCanvasChange}
        onPointerUpdate={({ pointer, button }) => {
          broadcastCursor(pointer.x, pointer.y, button);
        }}
      />
    </div>
  );
});

export default CanvasEditor;
