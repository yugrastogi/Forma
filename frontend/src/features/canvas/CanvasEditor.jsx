import {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  useCallback,
  useEffect,
} from "react";
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

  const handleRemoteSceneUpdate = useCallback(
    (remoteElements) => {
      setElements(remoteElements);

      if (excalidrawAPI) {
        excalidrawAPI.updateScene({
          elements: remoteElements,
        });
      }
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

  const handleCanvasChange = (updatedElements, updatedAppState) => {
    setElements(updatedElements);
    setAppState(updatedAppState);

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
    <div className="forma-editor h-full w-full">
      <style>{`
        .forma-editor .excalidraw {
          --color-primary: #D9786B;
          --color-primary-darker: #C5665A;
          --color-primary-darkest: #AD5146;
          --color-primary-light: #F5DAD6;

          --color-brand: #D9786B;
          --color-brand-hover: #D9786B;
          --color-brand-active: #C5665A;

          --button-hover-bg: #F8F8F8;
          --button-hover-border: #D9D9D9;
          --button-hover-color: #292929;

          --button-selected-bg: #F5DAD6;
          --button-selected-border: #D9786B;
          --button-selected-hover-bg: #F5DAD6;

          --color-surface-primary-container: #F5DAD6;
          --color-on-primary-container: #AD5146;

          /* Selection box, resize handles and rotation handle */
          --color-selection: #D9786B;
        }

        /* DRAWING TOOLBAR */

        .forma-editor .excalidraw .App-toolbar
        .ToolIcon_type_button:hover,
        .forma-editor .excalidraw .App-toolbar
        .ToolIcon_type_button:focus-visible {
          background-color: #F8F8F8 !important;
          border-color: #D9D9D9 !important;
        }

        .forma-editor .excalidraw .App-toolbar
        .ToolIcon_type_button.active,
        .forma-editor .excalidraw .App-toolbar
        .ToolIcon_type_button[aria-pressed="true"] {
          background-color: #F5DAD6 !important;
          border-color: #D9786B !important;
        }

        .forma-editor .excalidraw .App-toolbar
        .ToolIcon_type_button.active:hover,
        .forma-editor .excalidraw .App-toolbar
        .ToolIcon_type_button[aria-pressed="true"]:hover {
          background-color: #F5DAD6 !important;
          border-color: #D9786B !important;
        }

        /* PROPERTIES PANEL */

        .forma-editor .excalidraw .App-menu__left {
          --button-bg: #FFFFFF;
          --button-border: #E5E5E5;
          --button-color: #292929;

          --button-hover-bg: #F8F8F8;
          --button-hover-border: #D9D9D9;
          --button-hover-color: #292929;

          --button-active-bg: #F8F8F8;
          --button-active-border: #D9D9D9;

          --button-selected-bg: #F5DAD6;
          --button-selected-border: #D9786B;
          --button-selected-hover-bg: #F5DAD6;

          --color-primary: #D9786B;
          --color-primary-darker: #C5665A;
          --color-primary-darkest: #AD5146;
          --color-brand-hover: #D9786B;
        }

        /* SELECTED PROPERTY BUTTONS */

        .forma-editor .excalidraw .App-menu__left
        .buttonList label.active,
        .forma-editor .excalidraw .App-menu__left
        .buttonList button.active,
        .forma-editor .excalidraw .App-menu__left
        .buttonList .zIndexButton.active {
          background-color: #F5DAD6 !important;
          border-color: #D9786B !important;
          color: #AD5146 !important;
          box-shadow: none !important;
        }

        .forma-editor .excalidraw .App-menu__left
        .buttonList label.active svg,
        .forma-editor .excalidraw .App-menu__left
        .buttonList button.active svg,
        .forma-editor .excalidraw .App-menu__left
        .buttonList .zIndexButton.active svg {
          color: #AD5146 !important;
        }

        /* UNSELECTED PROPERTY BUTTONS */

        .forma-editor .excalidraw .App-menu__left
        .buttonList label:not(.active) svg,
        .forma-editor .excalidraw .App-menu__left
        .buttonList button:not(.active) svg,
        .forma-editor .excalidraw .App-menu__left
        .buttonList .zIndexButton:not(.active) svg {
          color: #292929 !important;
        }

        .forma-editor .excalidraw .App-menu__left
        .buttonList label:not(.active):hover,
        .forma-editor .excalidraw .App-menu__left
        .buttonList button:not(.active):hover,
        .forma-editor .excalidraw .App-menu__left
        .buttonList .zIndexButton:not(.active):hover {
          background-color: #F8F8F8 !important;
          border-color: #D9D9D9 !important;
        }

        .forma-editor .excalidraw .App-menu__left
        .buttonList label.active:hover,
        .forma-editor .excalidraw .App-menu__left
        .buttonList button.active:hover,
        .forma-editor .excalidraw .App-menu__left
        .buttonList .zIndexButton.active:hover {
          background-color: #F5DAD6 !important;
          border-color: #D9786B !important;
        }

        /* OPACITY SLIDER */

        .forma-editor .excalidraw .App-menu__left
        input[type="range"] {
          accent-color: #D9786B !important;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-webkit-slider-runnable-track {
          background: #F5DAD6 !important;
          border-radius: 999px;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-webkit-slider-thumb {
          background: #D9786B !important;
          border: none !important;
          box-shadow: none !important;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-moz-range-track {
          background: #F5DAD6 !important;
          border-radius: 999px;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-moz-range-progress {
          background: #D9786B !important;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-moz-range-thumb {
          background: #D9786B !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* OPACITY SLIDER: THIN TRACK + SMALL THUMB */

        .forma-editor .excalidraw .App-menu__left
        input[type="range"] {
          -webkit-appearance: none !important;
          appearance: none !important;
          height: 4px !important;
          background: transparent !important;
          border-radius: 999px;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-webkit-slider-runnable-track {
          height: 4px !important;
          border-radius: 999px;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 14px !important;
          height: 14px !important;
          margin-top: -5px !important;
          border-radius: 50% !important;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-moz-range-track {
          height: 4px !important;
          border-radius: 999px;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-moz-range-progress {
          height: 4px !important;
          border-radius: 999px;
        }

        .forma-editor .excalidraw .App-menu__left
        input[type="range"]::-moz-range-thumb {
          width: 14px !important;
          height: 14px !important;
          border-radius: 50% !important;
        }

        /* HAMBURGER, LIBRARY AND HELP */

        .forma-editor .excalidraw .main-menu-trigger,
        .forma-editor .excalidraw .sidebar-trigger,
        .forma-editor .excalidraw .help-icon {
          background: #F5DAD6 !important;
          border: 1px solid #E8E5E3 !important;
          box-shadow: none !important;
          color: #171716 !important;
        }

        .forma-editor .excalidraw .main-menu-trigger svg,
        .forma-editor .excalidraw .sidebar-trigger svg,
        .forma-editor .excalidraw .help-icon svg {
          color: #171716 !important;
          stroke: #171716 !important;
        }

        /* ZOOM CONTROL CONTAINER AND ALL DESCENDANT BUTTONS */

        .forma-editor .excalidraw .zoom-actions {
          background: #F5DAD6 !important;
          border: 1px solid #E8E5E3 !important;
          box-shadow: none !important;
        }

        .forma-editor .excalidraw .zoom-actions button,
        .forma-editor .excalidraw .zoom-actions button:focus,
        .forma-editor .excalidraw .zoom-actions button:focus-visible,
        .forma-editor .excalidraw .zoom-actions button:active {
          background: #F5DAD6 !important;
          background-color: #F5DAD6 !important;
          border-color: transparent !important;
          color: #171716 !important;
          box-shadow: none !important;
          outline-color: transparent !important;
        }

        .forma-editor .excalidraw .zoom-actions button svg {
          color: #171716 !important;
          stroke: #171716 !important;
        }

        /* UNDO / REDO CONTAINER AND ALL DESCENDANT BUTTONS */

        .forma-editor .excalidraw .undo-redo-buttons {
          background: #F5DAD6 !important;
          border: 1px solid #E8E5E3 !important;
          border-radius: var(--border-radius-lg);
          box-shadow: none !important;
        }

        .forma-editor .excalidraw .undo-redo-buttons button,
        .forma-editor .excalidraw .undo-redo-buttons button:focus,
        .forma-editor .excalidraw .undo-redo-buttons button:focus-visible,
        .forma-editor .excalidraw .undo-redo-buttons button:active {
          background: #F5DAD6 !important;
          background-color: #F5DAD6 !important;
          border-color: transparent !important;
          color: #171716 !important;
          box-shadow: none !important;
          outline-color: transparent !important;
        }

        .forma-editor .excalidraw .undo-redo-buttons button svg {
          color: #171716 !important;
          stroke: #171716 !important;
        }

        /* HOVER: ALL TOP CONTROLS + ZOOM + UNDO/REDO (same as hamburger) */

        .forma-editor .excalidraw .main-menu-trigger:hover,
        .forma-editor .excalidraw .sidebar-trigger:hover,
        .forma-editor .excalidraw .help-icon:hover {
          background: #FBECE9 !important;
          background-color: #FBECE9 !important;
          border-color: #E8E5E3 !important;
          color: #171716 !important;
          box-shadow: none !important;
        }

        .forma-editor .excalidraw .main-menu-trigger:hover svg,
        .forma-editor .excalidraw .sidebar-trigger:hover svg,
        .forma-editor .excalidraw .help-icon:hover svg {
          color: #171716 !important;
          stroke: #171716 !important;
        }

        .forma-editor .excalidraw .zoom-actions button:hover:not(:disabled),
        .forma-editor .excalidraw .zoom-actions button.ToolIcon_type_button:hover:not(:disabled),
        .forma-editor .excalidraw .undo-redo-buttons button:hover:not(:disabled),
        .forma-editor .excalidraw .undo-redo-buttons button.ToolIcon_type_button:hover:not(:disabled) {
          background: #FBECE9 !important;
          background-color: #FBECE9 !important;
          border-color: transparent !important;
          color: #171716 !important;
          box-shadow: none !important;
        }

        /* Excalidraw paints its own hover on the inner icon and via
           --button-hover-bg (#F8F8F8 above), so override both here */

        .forma-editor .excalidraw .zoom-actions,
        .forma-editor .excalidraw .undo-redo-buttons {
          --button-bg: #F5DAD6;
          --button-border: transparent;
          --button-hover-bg: #FBECE9;
          --button-hover-border: transparent;
          --button-hover-color: #171716;
          --button-active-bg: #FBECE9;
          --button-active-border: transparent;
        }

        .forma-editor .excalidraw .zoom-actions button .ToolIcon__icon,
        .forma-editor .excalidraw .zoom-actions button .ToolIcon__icon:hover,
        .forma-editor .excalidraw .undo-redo-buttons button .ToolIcon__icon,
        .forma-editor .excalidraw .undo-redo-buttons button .ToolIcon__icon:hover {
          background: transparent !important;
          background-color: transparent !important;
          border-color: transparent !important;
          box-shadow: none !important;
        }

        .forma-editor .excalidraw .undo-redo-buttons button:disabled {
          opacity: 0.4;
        }
      `}</style>

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