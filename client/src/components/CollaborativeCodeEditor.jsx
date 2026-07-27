import React, { useState, useEffect } from "react";
import {
  FaCode,
  FaPlay,
  FaCopy,
  FaCheck,
  FaTerminal,
  FaSync,
} from "react-icons/fa";

function CollaborativeCodeEditor({ code, language, onCodeChange, onLanguageChange, senderName }) {
  const [localCode, setLocalCode] = useState(code || "");
  const [localLang, setLocalLang] = useState(language || "javascript");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code !== undefined) {
      setLocalCode(code);
    }
  }, [code]);

  useEffect(() => {
    if (language !== undefined) {
      setLocalLang(language);
    }
  }, [language]);

  const handleTextChange = (e) => {
    const newCode = e.target.value;
    setLocalCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode, localLang);
    }
  };

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLocalLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(localCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    setOutput("Executing algorithm code...");

    setTimeout(() => {
      try {
        if (localLang === "javascript") {
          let logs = [];
          const customConsole = {
            log: (...args) => logs.push(args.join(" ")),
            error: (...args) => logs.push("[Error] " + args.join(" ")),
          };
          const runFn = new Function("console", localCode);
          runFn(customConsole);
          setOutput(logs.length > 0 ? logs.join("\n") : "Code executed successfully with no output.");
        } else {
          setOutput(
            `[Simulated Output - ${localLang.toUpperCase()}]\nCompilation successful.\nExecution time: 42ms\nOutput:\n> Array result: [0, 1]\n> Solution complexity: O(N) Time, O(N) Space`
          );
        }
      } catch (err) {
        setOutput(`Runtime Error: ${err.message}`);
      } finally {
        setIsExecuting(false);
      }
    }, 600);
  };

  const lineNumbers = localCode.split("\n").map((_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Editor Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <FaCode size={16} />
            <span>Collaborative Code Studio</span>
          </div>

          {/* Language Selector */}
          <select
            value={localLang}
            onChange={handleLangChange}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3.10</option>
            <option value="cpp">C++ (GCC 11)</option>
            <option value="java">Java 17</option>
            <option value="go">Go 1.21</option>
            <option value="rust">Rust 2021</option>
            <option value="sql">PostgreSQL SQL</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {senderName && (
            <span className="text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full animate-pulse">
              Live edit by {senderName}
            </span>
          )}

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            {isExecuting ? <FaSync className="animate-spin" /> : <FaPlay size={10} />}
            <span>Run Code</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div className="w-12 bg-slate-900/60 border-r border-slate-800/80 py-4 text-right pr-3 text-slate-600 font-mono text-xs select-none">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area Code Editor */}
        <textarea
          value={localCode}
          onChange={handleTextChange}
          placeholder="// Type collaborative code here..."
          spellCheck={false}
          className="flex-1 bg-transparent text-emerald-300 font-mono text-xs p-4 leading-6 focus:outline-none resize-none selection:bg-emerald-500/30 selection:text-white"
        />
      </div>

      {/* Execution Console Output Panel */}
      {output && (
        <div className="bg-slate-900 border-t border-slate-800 p-3 max-h-40 overflow-y-auto font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-bold mb-1">
            <FaTerminal size={12} className="text-emerald-500" />
            <span>Output Console:</span>
          </div>
          <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed">{output}</pre>
        </div>
      )}
    </div>
  );
}

export default CollaborativeCodeEditor;
