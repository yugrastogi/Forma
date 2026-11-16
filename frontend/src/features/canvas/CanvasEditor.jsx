import {
  forwardRef,
  useState,
  useRef,
  useMemo,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
import { boardService } from "../../services/boardService";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { normalizeElements } from "./canvasUtils";
import { useBoardCollaboration } from "../collaboration/useBoardCollaboration";

/**
 * Merges incoming remote elements with current local scene elements using
 * Excalidraw's `version` and `versionNonce` so active local strokes are never wiped.
 */
function mergeElements(localElements = [], remoteElements = [], activeElementId = null) {
  const localMap = new Map(localElements.map((el) => [el.id, el]));
  const mergedMap = new Map();

  for (const remoteEl of remoteElements) {
    const localEl = localMap.get(remoteEl.id);

    // Never overwrite an element the local user is actively drawing/resizing right now
    if (localEl && remoteEl.id === activeElementId) {
      mergedMap.set(localEl.id, localEl);
      continue;
    }

    if (!localEl) {
      mergedMap.set(remoteEl.id, remoteEl);
      continue;
    }

    const localVersion = localEl.version ?? 0;
    const remoteVersion = remoteEl.version ?? 0;

    if (remoteVersion > localVersion) {
      mergedMap.set(remoteEl.id, remoteEl);
    } else if (remoteVersion < localVersion) {
      mergedMap.set(localEl.id, localEl);
    } else {
      // Deterministic tie-breaker when versions match
      const pickRemote =
        (remoteEl.versionNonce ?? 0) >= (localEl.versionNonce ?? 0);
      mergedMap.set(remoteEl.id, pickRemote ? remoteEl : localEl);
    }
  }

  // Keep local-only elements that haven't reached the remote peer yet
  for (const localEl of localElements) {
    if (!mergedMap.has(localEl.id)) {
      mergedMap.set(localEl.id, localEl);
    }
  }

  return Array.from(mergedMap.values());
}

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
  const [, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);

  const latestElementsRef = useRef(initialElements);
  const latestAppStateRef = useRef(initialAppState);
  const isApplyingRemoteRef = useRef(false);
  const lastSavedStatusRef = useRef("saved");

  const savedElementsRef = useRef(
    JSON.stringify(normalizeElements(initialElements))
  );

  // Stable initialData reference — only computed once on mount (key={id} resets on board switch)
  const initialData = useMemo(
    () => ({
      elements: initialElements,
      appState: {
        ...initialAppState,
        collaborators: new Map(),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleRemoteSceneUpdate = useCallback(
    (remoteElements) => {
      if (!excalidrawAPI || !Array.isArray(remoteElements)) return;

      const currentLocalElements = excalidrawAPI.getSceneElementsIncludingDeleted();
      const currentAppState = excalidrawAPI.getAppState();
      const activeElementId =
        currentAppState?.editingElement?.id ||
        currentAppState?.draggingElement?.id ||
        currentAppState?.resizingElement?.id ||
        null;

      const merged = mergeElements(
        currentLocalElements,
        remoteElements,
        activeElementId
      );

      latestElementsRef.current = merged;

      isApplyingRemoteRef.current = true;
      excalidrawAPI.updateScene({
        elements: merged,
      });
    },
    [excalidrawAPI]
  );

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
  }, [
    connectionStatus,
    activeUsers,
    errorMessage,
    onCollaborationChange,
  ]);

  const handleCanvasChange = useCallback(
    (updatedElements, updatedAppState) => {
      latestElementsRef.current = updatedElements;
      latestAppStateRef.current = updatedAppState;

      // Skip broadcasting when onChange was triggered by our own remote updateScene()
      if (isApplyingRemoteRef.current) {
        isApplyingRemoteRef.current = false;
        return;
      }

      broadcastCanvasChange(updatedElements, updatedAppState);

      const currentElements = JSON.stringify(
        normalizeElements(updatedElements)
      );
      const nextStatus =
        currentElements === savedElementsRef.current ? "saved" : "unsaved";

      if (nextStatus !== lastSavedStatusRef.current) {
        lastSavedStatusRef.current = nextStatus;
        onSaveStatusChange?.({
          status: nextStatus,
          lastSaved,
          isSaving: false,
        });
      }
    },
    [broadcastCanvasChange, lastSaved, onSaveStatusChange]
  );

  const handlePointerUpdate = useCallback(
    ({ pointer, button }) => {
      broadcastCursor(pointer.x, pointer.y, button);
    },
    [broadcastCursor]
  );

  const handleSaveCanvas = async () => {
    if (userRole === "VIEWER") {
      alert("Viewers cannot modify this canvas.");
      return;
    }

    const elementsToSave = excalidrawAPI
      ? excalidrawAPI.getSceneElements()
      : latestElementsRef.current;
    const appStateToSave = excalidrawAPI
      ? excalidrawAPI.getAppState()
      : latestAppStateRef.current;

    setIsSaving(true);
    lastSavedStatusRef.current = "saving";

    onSaveStatusChange?.({
      status: "saving",
      lastSaved,
      isSaving: true,
    });

    try {
      const result = await boardService.saveBoardCanvas(boardId, {
        elements: elementsToSave,
        appState: appStateToSave,
      });

      savedElementsRef.current = JSON.stringify(
        normalizeElements(elementsToSave)
      );

      const savedTime = new Date(result.updatedAt || Date.now());
      setLastSaved(savedTime);
      lastSavedStatusRef.current = "saved";

      onSaveStatusChange?.({
        status: "saved",
        lastSaved: savedTime,
        isSaving: false,
      });
    } catch (err) {
      lastSavedStatusRef.current = "error";
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
    <div className="forma-editor h-full w-full">
      {/* Keep your existing <style>{`...`}</style> block unchanged here */}
      <Excalidraw
        theme="light"
        viewModeEnabled={userRole === "VIEWER"}
        excalidrawAPI={setExcalidrawAPI}
        initialData={initialData}
        onChange={handleCanvasChange}
        onPointerUpdate={handlePointerUpdate}
      />
    </div>
  );
});

export default CanvasEditor;