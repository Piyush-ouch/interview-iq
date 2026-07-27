import React, { useRef, useState, useEffect } from "react";
import {
  FaPencilAlt,
  FaEraser,
  FaSquare,
  FaCircle,
  FaFont,
  FaArrowRight,
  FaTrash,
  FaDownload,
  FaLongArrowAltRight,
  FaStickyNote,
  FaEye,
} from "react-icons/fa";

function WhiteboardCanvas({ strokes, onDrawStroke, onClear, laserPoint, onLaserMove }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen"); // 'pen', 'eraser', 'rectangle', 'circle', 'text', 'arrow', 'laser'
  const [color, setColor] = useState("#10b981");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [localStrokes, setLocalStrokes] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null);

  // Sync props strokes with local canvas rendering
  useEffect(() => {
    if (strokes) {
      setLocalStrokes(strokes);
    }
  }, [strokes]);

  // Redraw canvas whenever localStrokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas background
    ctx.fillStyle = "#0f172a"; // dark theme canvas
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background for system design architecture layout
    drawGrid(ctx, canvas.width, canvas.height);

    // Render all strokes
    localStrokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });

    // Draw current active path if drawing
    if (currentPath.length > 0) {
      drawStroke(ctx, {
        type: tool,
        points: currentPath,
        color: tool === "eraser" ? "#0f172a" : color,
        size: strokeWidth,
      });
    }

    // Draw active laser pointer if present
    if (laserPoint) {
      ctx.beginPath();
      ctx.arc(laserPoint.x, laserPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [localStrokes, currentPath, laserPoint, color, strokeWidth, tool]);

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawStroke = (ctx, stroke) => {
    const { type, points, color, size, text } = stroke;
    if (!points || points.length === 0) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (type === "pen" || type === "eraser") {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    } else if (type === "rectangle" && points.length >= 2) {
      const start = points[0];
      const end = points[points.length - 1];
      const w = end.x - start.x;
      const h = end.y - start.y;
      ctx.strokeRect(start.x, start.y, w, h);
    } else if (type === "circle" && points.length >= 2) {
      const start = points[0];
      const end = points[points.length - 1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === "arrow" && points.length >= 2) {
      const start = points[0];
      const end = points[points.length - 1];
      const headlen = 12;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const angle = Math.atan2(dy, dx);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    } else if (type === "text" && text) {
      ctx.font = `${size * 4 + 10}px sans-serif`;
      ctx.fillText(text, points[0].x, points[0].y);
    }
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoords(e);

    if (tool === "laser") {
      if (onLaserMove) onLaserMove(coords);
      return;
    }

    if (tool === "text") {
      setTextPos(coords);
      return;
    }

    setIsDrawing(true);
    setCurrentPath([coords]);
  };

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e);

    if (tool === "laser") {
      if (onLaserMove) onLaserMove(coords);
      return;
    }

    if (!isDrawing) return;
    setCurrentPath((prev) => [...prev, coords]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 0) {
      const newStroke = {
        type: tool,
        points: currentPath,
        color: tool === "eraser" ? "#0f172a" : color,
        size: strokeWidth,
      };

      setLocalStrokes((prev) => [...prev, newStroke]);
      if (onDrawStroke) onDrawStroke(newStroke);
    }
    setCurrentPath([]);
  };

  const handleAddText = () => {
    if (!textPos || !textInput.trim()) return;
    const newStroke = {
      type: "text",
      points: [textPos],
      color,
      size: strokeWidth,
      text: textInput,
    };
    setLocalStrokes((prev) => [...prev, newStroke]);
    if (onDrawStroke) onDrawStroke(newStroke);
    setTextInput("");
    setTextPos(null);
  };

  // Preset Architecture Stencils
  const addStencil = (stencilType) => {
    const startX = 150;
    const startY = 150;
    let stencilStrokes = [];

    if (stencilType === "microservice") {
      stencilStrokes = [
        { type: "rectangle", points: [{ x: startX, y: startY }, { x: startX + 160, y: startY + 90 }], color: "#10b981", size: 3 },
        { type: "text", points: [{ x: startX + 20, y: startY + 50 }], color: "#10b981", size: 3, text: "Microservice API" },
      ];
    } else if (stencilType === "database") {
      stencilStrokes = [
        { type: "circle", points: [{ x: startX + 50, y: startY + 50 }, { x: startX + 90, y: startY + 50 }], color: "#3b82f6", size: 3 },
        { type: "text", points: [{ x: startX + 10, y: startY + 110 }], color: "#3b82f6", size: 3, text: "PostgreSQL DB" },
      ];
    } else if (stencilType === "cache") {
      stencilStrokes = [
        { type: "rectangle", points: [{ x: startX, y: startY }, { x: startX + 140, y: startY + 60 }], color: "#f59e0b", size: 3 },
        { type: "text", points: [{ x: startX + 15, y: startY + 38 }], color: "#f59e0b", size: 3, text: "Redis Cache Cluster" },
      ];
    }

    setLocalStrokes((prev) => [...prev, ...stencilStrokes]);
    stencilStrokes.forEach((s) => onDrawStroke && onDrawStroke(s));
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `whiteboard_system_design_${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl relative">
      {/* Toolbar Controls */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          {[
            { id: "pen", icon: <FaPencilAlt size={14} />, label: "Pen" },
            { id: "eraser", icon: <FaEraser size={14} />, label: "Eraser" },
            { id: "rectangle", icon: <FaSquare size={14} />, label: "Rectangle" },
            { id: "circle", icon: <FaCircle size={14} />, label: "Circle" },
            { id: "arrow", icon: <FaArrowRight size={14} />, label: "Arrow" },
            { id: "text", icon: <FaFont size={14} />, label: "Text" },
            { id: "laser", icon: <FaEye size={14} />, label: "Laser Pointer" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                tool === t.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "text-slate-300 hover:bg-slate-700/60"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Color:</span>
          {["#10b981", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#ffffff"].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition cursor-pointer border ${
                color === c ? "scale-110 border-white ring-2 ring-emerald-500" : "border-transparent opacity-80"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Stencil Shortcuts & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addStencil("microservice")}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-bold hover:bg-emerald-900 transition cursor-pointer"
          >
            + Service Node
          </button>
          <button
            onClick={() => addStencil("database")}
            className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800 text-[11px] font-bold hover:bg-blue-900 transition cursor-pointer"
          >
            + Database
          </button>
          <button
            onClick={() => addStencil("cache")}
            className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800 text-[11px] font-bold hover:bg-amber-900 transition cursor-pointer"
          >
            + Redis Cache
          </button>

          <button
            onClick={onClear}
            title="Clear Board"
            className="p-2 rounded-xl bg-red-950/60 text-red-400 hover:bg-red-900/80 border border-red-800 text-xs font-semibold transition cursor-pointer"
          >
            <FaTrash size={14} />
          </button>

          <button
            onClick={handleExportPNG}
            title="Download Canvas PNG"
            className="p-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <FaDownload size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas Canvas Element */}
      <div className="flex-1 relative w-full h-full min-h-[480px]">
        <canvas
          ref={canvasRef}
          width={1200}
          height={750}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Floating Text Input Box */}
        {textPos && (
          <div
            className="absolute bg-slate-900 border border-emerald-500 p-2 rounded-xl shadow-xl flex items-center gap-2 z-20"
            style={{ left: `${textPos.x / 1.5}px`, top: `${textPos.y / 1.5}px` }}
          >
            <input
              type="text"
              placeholder="Enter text annotation..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddText()}
              className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <button
              onClick={handleAddText}
              className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 cursor-pointer"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhiteboardCanvas;
