import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { fetchProblemById, runCodeApi, submitCodeApi } from '../api/problem.api.js';
import ProblemNavbar from '../components/problem/ProblemNavbar.jsx';
import ProblemPanel from '../components/problem/ProblemPanel.jsx';
import CodeEditorPanel from '../components/problem/CodeEditorPanel.jsx';
import TestcaseConsolePanel from '../components/problem/TestcaseConsolePanel.jsx';
import SEO from '../components/SEO.jsx';

export default function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data states
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor & Console states
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase');
  const [testCases, setTestCases] = useState([]);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile / Tablet Tab view ('problem' | 'code' | 'console')
  const [mobileActiveTab, setMobileActiveTab] = useState('problem');

  // Resizable split ratio states with localStorage persistence
  const [splitRatio, setSplitRatio] = useState(() => {
    const saved = localStorage.getItem('cr_workspace_split_ratio');
    return saved ? parseFloat(saved) : 45;
  });

  const [editorRatio, setEditorRatio] = useState(() => {
    const saved = localStorage.getItem('cr_workspace_vertical_split');
    return saved ? parseFloat(saved) : 65;
  });

  const isDraggingHorizontal = useRef(false);
  const isDraggingVertical = useRef(false);
  const workspaceRef = useRef(null);
  const editorAreaRef = useRef(null);

  // Load problem data on mount / ID change
  useEffect(() => {
    const loadProblem = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProblemById(id);
        if (res && res.data) {
          setProblem(res.data);
        } else {
          throw new Error('Problem data missing');
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
        setError(err.response?.data?.message || err.message || 'Problem not found');
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id]);

  // Fullscreen Esc key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Dragging handlers for Horizontal Splitter (Left vs Right)
  const handleHorizontalMouseDown = (e) => {
    e.preventDefault();
    isDraggingHorizontal.current = true;
    document.addEventListener('mousemove', handleHorizontalMouseMove);
    document.addEventListener('mouseup', handleHorizontalMouseUp);
  };

  const handleHorizontalMouseMove = (e) => {
    if (!isDraggingHorizontal.current || !workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    let ratio = (currentX / rect.width) * 100;
    // Constrain ratio between 30% and 65%
    ratio = Math.max(28, Math.min(68, ratio));
    setSplitRatio(ratio);
  };

  const handleHorizontalMouseUp = () => {
    isDraggingHorizontal.current = false;
    document.removeEventListener('mousemove', handleHorizontalMouseMove);
    document.removeEventListener('mouseup', handleHorizontalMouseUp);
    localStorage.setItem('cr_workspace_split_ratio', String(splitRatio));
  };

  const handleResetSplit = () => {
    setSplitRatio(45);
    localStorage.setItem('cr_workspace_split_ratio', '45');
  };

  // Dragging handlers for Vertical Splitter (Editor vs Console)
  const handleVerticalMouseDown = (e) => {
    e.preventDefault();
    isDraggingVertical.current = true;
    document.addEventListener('mousemove', handleVerticalMouseMove);
    document.addEventListener('mouseup', handleVerticalMouseUp);
  };

  const handleVerticalMouseMove = (e) => {
    if (!isDraggingVertical.current || !editorAreaRef.current) return;
    const rect = editorAreaRef.current.getBoundingClientRect();
    const currentY = e.clientY - rect.top;
    let ratio = (currentY / rect.height) * 100;
    // Constrain vertical ratio between 35% and 80%
    ratio = Math.max(30, Math.min(82, ratio));
    setEditorRatio(ratio);
  };

  const handleVerticalMouseUp = () => {
    isDraggingVertical.current = false;
    document.removeEventListener('mousemove', handleVerticalMouseMove);
    document.removeEventListener('mouseup', handleVerticalMouseUp);
    localStorage.setItem('cr_workspace_vertical_split', String(editorRatio));
  };

  // Execute / Run Code handler
  const handleRunCode = async () => {
    if (running || !problem) return;
    setRunning(true);
    setRunResult(null);
    setConsoleOpen(true);
    setActiveConsoleTab('result');

    try {
      const res = await runCodeApi(problem._id || problem.slug, {
        language,
        code,
        testCases
      });
      setRunResult(res.data);
    } catch (err) {
      console.error('Run failed:', err);
      setRunResult({
        status: 'Compile Error',
        errorOutput: err.response?.data?.message || 'Execution error'
      });
    } finally {
      setRunning(false);
    }
  };

  // Submit Solution handler
  const handleSubmitCode = async () => {
    if (submitting || !problem) return;
    setSubmitting(true);
    setSubmitResult(null);
    setConsoleOpen(true);
    setActiveConsoleTab('result');

    try {
      const res = await submitCodeApi(problem._id || problem.slug, {
        language,
        code
      });
      setSubmitResult(res.data);
      if (res.data?.status === 'Accepted') {
        setActiveTab('submissions');
      }
    } catch (err) {
      console.error('Submit failed:', err);
      setSubmitResult({
        status: 'Wrong Answer',
        errorOutput: err.response?.data?.message || 'Submission evaluation error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Window width listener for responsive layout calculation
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-[#07090e] text-zinc-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-mono text-zinc-400">Loading IDE Workspace...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-screen bg-[#07090e] text-zinc-100 flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Problem Not Found</h2>
        <p className="text-sm text-zinc-400">{error}</p>
        <button
          onClick={() => navigate('/problems')}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg"
        >
          Return to Problems Sheet
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07090e] overflow-hidden text-zinc-100 select-none">
      <SEO title={`${problem.title} — DSA Coding Workspace | CodeRank`} />

      {/* Top Navbar Header */}
      <ProblemNavbar
        problem={problem}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onResetCode={() => {
          if (window.confirm('Reset code to starter template?')) {
            setCode('');
          }
        }}
      />

      {/* Responsive Mobile / Tablet Tab Switcher Header Bar */}
      <div className="md:hidden h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-around text-xs font-semibold text-zinc-400 shrink-0">
        <button
          onClick={() => setMobileActiveTab('problem')}
          className={`py-2 flex-1 text-center border-b-2 transition-all ${
            mobileActiveTab === 'problem' ? 'text-indigo-400 border-indigo-500 bg-[#0d1117]' : 'border-transparent text-zinc-400'
          }`}
        >
          Problem
        </button>
        <button
          onClick={() => setMobileActiveTab('code')}
          className={`py-2 flex-1 text-center border-b-2 transition-all ${
            mobileActiveTab === 'code' ? 'text-indigo-400 border-indigo-500 bg-[#0d1117]' : 'border-transparent text-zinc-400'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setMobileActiveTab('console')}
          className={`py-2 flex-1 text-center border-b-2 transition-all ${
            mobileActiveTab === 'console' ? 'text-indigo-400 border-indigo-500 bg-[#0d1117]' : 'border-transparent text-zinc-400'
          }`}
        >
          Console
        </button>
      </div>

      {/* Master Workspace Container */}
      <div ref={workspaceRef} className="flex-1 flex overflow-hidden relative">
        {/* Fullscreen Mode Overlay Editor View */}
        {isFullscreen ? (
          <div className="w-full h-full flex flex-col z-40 bg-[#0d1117]">
            <CodeEditorPanel
              problem={problem}
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              onRun={handleRunCode}
              onSubmit={handleSubmitCode}
              running={running}
              submitting={submitting}
              consoleOpen={consoleOpen}
              setConsoleOpen={setConsoleOpen}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(false)}
            />
          </div>
        ) : (
          <>
            {/* Left Problem Panel */}
            <div
              style={{ width: isDesktop ? `${splitRatio}%` : '100%' }}
              className={`h-full overflow-hidden shrink-0 ${
                mobileActiveTab === 'problem' ? 'block w-full' : 'hidden md:block'
              }`}
            >
              <ProblemPanel
                problem={problem}
                onProblemUpdated={(updated) => setProblem(updated)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>

            {/* Horizontal Resizable Splitter Handle (Desktop only) */}
            <div
              onMouseDown={handleHorizontalMouseDown}
              onDoubleClick={handleResetSplit}
              title="Drag to resize panels (Double click to reset)"
              className="w-1.5 bg-[#161b22] hover:bg-indigo-500/50 border-x border-[#30363d] cursor-col-resize hidden md:flex items-center justify-center transition-colors group z-20 shrink-0"
            >
              <div className="w-0.5 h-6 bg-zinc-600 group-hover:bg-indigo-400 rounded-full" />
            </div>

            {/* Right Editor & Console Area */}
            <div
              ref={editorAreaRef}
              style={{ width: isDesktop ? `${100 - splitRatio}%` : '100%' }}
              className={`h-full flex flex-col overflow-hidden shrink-0 ${
                mobileActiveTab !== 'problem' ? 'block w-full' : 'hidden md:flex'
              }`}
            >
              {/* Code Editor Panel */}
              <div
                style={{
                  height: !isDesktop
                    ? (mobileActiveTab === 'code' ? '100%' : '0%')
                    : (consoleOpen ? `${editorRatio}%` : '100%')
                }}
                className={`overflow-hidden ${!isDesktop && mobileActiveTab === 'console' ? 'hidden' : 'block'}`}
              >
                <CodeEditorPanel
                  problem={problem}
                  code={code}
                  setCode={setCode}
                  language={language}
                  setLanguage={setLanguage}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  running={running}
                  submitting={submitting}
                  consoleOpen={consoleOpen}
                  setConsoleOpen={setConsoleOpen}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(true)}
                />
              </div>

              {/* Vertical Resizable Splitter Handle (Desktop only) */}
              {consoleOpen && isDesktop && (
                <div
                  onMouseDown={handleVerticalMouseDown}
                  title="Drag to resize console"
                  className="h-1 bg-[#161b22] hover:bg-indigo-500/50 border-y border-[#30363d] cursor-row-resize hidden md:flex items-center justify-center transition-colors group z-20 shrink-0"
                >
                  <div className="h-0.5 w-8 bg-zinc-600 group-hover:bg-indigo-400 rounded-full" />
                </div>
              )}

              {/* Testcase Console Panel */}
              {(consoleOpen || !isDesktop) && (
                <div
                  style={{
                    height: !isDesktop
                      ? (mobileActiveTab === 'console' ? '100%' : '0%')
                      : `${100 - editorRatio}%`
                  }}
                  className={`overflow-hidden ${!isDesktop && mobileActiveTab !== 'console' ? 'hidden' : 'block'}`}
                >
                  <TestcaseConsolePanel
                    testCases={testCases}
                    setTestCases={setTestCases}
                    runResult={runResult}
                    submitResult={submitResult}
                    running={running}
                    submitting={submitting}
                    activeConsoleTab={activeConsoleTab}
                    setActiveConsoleTab={setActiveConsoleTab}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
