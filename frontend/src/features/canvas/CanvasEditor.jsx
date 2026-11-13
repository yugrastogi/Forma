
import { forwardRef, useState, useRef, useImperativeHandle } from "react";
import { boardService } from "../../services/boardService";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { normalizeElements } from "./canvasUtils";

const CanvasEditor = forwardRef(function CanvasEditor(
  { boardId, initialElements = [], initialAppState = {}, onSaveStatusChange },
  ref
) {
  const [elements, setElements] = useState(initialElements);
  const [appState, setAppState] = useState(initialAppState);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const savedElementsRef = useRef(
    JSON.stringify(normalizeElements(initialElements))
  );

  const handleCanvasChange = (updatedElements, updatedAppState) => {
    setElements(updatedElements);
    setAppState(updatedAppState);

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
        initialData={{
          elements,
          appState: {
            ...appState,
            collaborators: new Map(),
          },
        }}
        onChange={handleCanvasChange}
      />
    </div>
  );
});

export default CanvasEditor;
