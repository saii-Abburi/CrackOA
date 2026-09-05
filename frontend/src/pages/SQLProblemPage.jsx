import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Database, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import { fetchProblemById, runCodeApi, submitCodeApi } from '../api/problem.api.js';
import SQLProblemPanel from '../components/sql/SQLProblemPanel.jsx';
import SQLEditorPanel from '../components/sql/SQLEditorPanel.jsx';
import SQLConsolePanel from '../components/sql/SQLConsolePanel.jsx';
import SEO from '../components/SEO.jsx';

const DIFF_COLORS = {
  Easy: 'text-emerald-400',
  Medium: 'text-amber-400',
  Hard: 'text-red-400',
};

export default function SQLProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data states
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor & Console states
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [activeConsoleTab, setActiveConsoleTab] = useState('result');
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mobile tab: 'problem' | 'code' | 'console'
  const [mobileActiveTab, setMobileActiveTab] = useState('problem');

  // Resizable split ratio
  const [splitRatio, setSplitRatio] = useState(() => {
    const saved = localStorage.getItem('cr_sql_workspace_split');
    return saved ? parseFloat(saved) : 45;
  });
  const [editorRatio, setEditorRatio] = useState(() => {
    const saved = localStorage.getItem('cr_sql_workspace_vertical');
    return saved ? parseFloat(saved) : 62;
  });

  const isDraggingH = useRef(false);
  const isDraggingV = useRef(false);
  const workspaceRef = useRef(null);
  const editorAreaRef = useRef(null);

  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load problem
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProblemById(id);
        if (res?.data) {
          // Redirect to DSA problem page if this isn't a SQL problem
          if (res.data.domain && res.data.domain !== 'sql') {
            navigate(`/problems/${id}`, { replace: true });
            return;
          }
          setProblem(res.data);
        } else {
          throw new Error('Problem not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Problem not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // Esc key exits fullscreen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  // Horizontal splitter
  const onHMouseDown = (e) => {
    e.preventDefault();
    isDraggingH.current = true;
    document.addEventListener('mousemove', onHMouseMove);
    document.addEventListener('mouseup', onHMouseUp);
  };
  const onHMouseMove = (e) => {
    if (!isDraggingH.current || !workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const ratio = Math.max(28, Math.min(68, ((e.clientX - rect.left) / rect.width) * 100));
    setSplitRatio(ratio);
  };
  const onHMouseUp = () => {
    isDraggingH.current = false;
    document.removeEventListener('mousemove', onHMouseMove);
    document.removeEventListener('mouseup', onHMouseUp);
    localStorage.setItem('cr_sql_workspace_split', String(splitRatio));
  };

  // Vertical splitter
  const onVMouseDown = (e) => {
    e.preventDefault();
    isDraggingV.current = true;
    document.addEventListener('mousemove', onVMouseMove);
    document.addEventListener('mouseup', onVMouseUp);
  };
  const onVMouseMove = (e) => {
    if (!isDraggingV.current || !editorAreaRef.current) return;
    const rect = editorAreaRef.current.getBoundingClientRect();
    const ratio = Math.max(30, Math.min(82, ((e.clientY - rect.top) / rect.height) * 100));
    setEditorRatio(ratio);
  };
  const onVMouseUp = () => {
    isDraggingV.current = false;
    document.removeEventListener('mousemove', onVMouseMove);
    document.removeEventListener('mouseup', onVMouseUp);
    localStorage.setItem('cr_sql_workspace_vertical', String(editorRatio));
  };

  // Run handler
  const handleRun = async () => {
    if (running || !problem) return;
    setRunning(true);
    setRunResult(null);
    setConsoleOpen(true);
    setActiveConsoleTab('result');
    try {
      const res = await runCodeApi(problem._id || problem.slug, { language: 'sql', code, testCases: [] });
      setRunResult(res.data);
    } catch (err) {
      setRunResult({ status: 'Runtime Error', errorOutput: err.response?.data?.message || 'Execution error' });
    } finally {
      setRunning(false);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (submitting || !problem) return;
    setSubmitting(true);
    setSubmitResult(null);
    setConsoleOpen(true);
    setActiveConsoleTab('result');
    try {
      const res = await submitCodeApi(problem._id || problem.slug, { language: 'sql', code });
      setSubmitResult(res.data);
      if (res.data?.status === 'Accepted') {
        setActiveTab('submissions');
      }
    } catch (err) {
      setSubmitResult({ status: 'Wrong Answer', errorOutput: err.response?.data?.message || 'Error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#07090e] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-mono text-zinc-400">Loading SQL Workspace...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-screen bg-[#07090e] flex flex-col items-center justify-center text-center p-6 gap-4">
        <Database className="w-12 h-12 text-indigo-500/30" />
        <h2 className="text-2xl font-bold text-white">Problem Not Found</h2>
        <p className="text-sm text-zinc-400">{error}</p>
        <Link to="/sql" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg">
          Back to SQL Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07090e] overflow-hidden text-zinc-100 select-none">
      <SEO title={`${problem.title} — SQL Workspace | CodeRank`} />

      {/* Navbar */}
      <div className="h-12 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between px-4 shrink-0 z-30">
        {/* Left: back + problem info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/sql"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            SQL
          </Link>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-2 min-w-0">
            <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-medium text-white truncate">{problem.title}</span>
            <span className={`text-[10px] font-bold shrink-0 ${DIFF_COLORS[problem.difficulty] || 'text-zinc-400'}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Right: fullscreen */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded hover:bg-white/5"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile tab switcher */}
      <div className="md:hidden h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-around text-xs font-semibold text-zinc-400 shrink-0">
        {['problem', 'code', 'console'].map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileActiveTab(tab)}
            className={`py-2 flex-1 text-center border-b-2 transition-all capitalize ${
              mobileActiveTab === tab ? 'text-indigo-400 border-indigo-500 bg-[#0d1117]' : 'border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div ref={workspaceRef} className="flex-1 flex overflow-hidden relative">
        {isFullscreen ? (
          <div className="w-full h-full flex flex-col z-40 bg-[#0d1117]">
            <SQLEditorPanel
              problem={problem}
              code={code}
              setCode={setCode}
              onRun={handleRun}
              onSubmit={handleSubmit}
              running={running}
              submitting={submitting}
              isFullscreen={true}
              onToggleFullscreen={() => setIsFullscreen(false)}
            />
          </div>
        ) : (
          <>
            {/* Left: Problem panel */}
            <div
              style={{ width: isDesktop ? `${splitRatio}%` : '100%' }}
              className={`h-full overflow-hidden shrink-0 ${mobileActiveTab === 'problem' ? 'block w-full' : 'hidden md:block'}`}
            >
              <SQLProblemPanel
                problem={problem}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>

            {/* Horizontal splitter */}
            <div
              onMouseDown={onHMouseDown}
              className="w-1.5 bg-[#161b22] hover:bg-indigo-500/50 border-x border-[#30363d] cursor-col-resize hidden md:flex items-center justify-center transition-colors group z-20 shrink-0"
            >
              <div className="w-0.5 h-6 bg-zinc-600 group-hover:bg-indigo-400 rounded-full" />
            </div>

            {/* Right: Editor + Console */}
            <div
              ref={editorAreaRef}
              style={{ width: isDesktop ? `${100 - splitRatio}%` : '100%' }}
              className={`h-full flex flex-col overflow-hidden shrink-0 ${mobileActiveTab !== 'problem' ? 'block w-full' : 'hidden md:flex'}`}
            >
              {/* Editor */}
              <div
                style={{
                  height: !isDesktop
                    ? (mobileActiveTab === 'code' ? '100%' : '0%')
                    : (consoleOpen ? `${editorRatio}%` : '100%')
                }}
                className={`overflow-hidden ${!isDesktop && mobileActiveTab === 'console' ? 'hidden' : 'block'}`}
              >
                <SQLEditorPanel
                  problem={problem}
                  code={code}
                  setCode={setCode}
                  onRun={handleRun}
                  onSubmit={handleSubmit}
                  running={running}
                  submitting={submitting}
                  consoleOpen={consoleOpen}
                  setConsoleOpen={setConsoleOpen}
                  isFullscreen={false}
                  onToggleFullscreen={() => setIsFullscreen(true)}
                />
              </div>

              {/* Vertical splitter */}
              {consoleOpen && isDesktop && (
                <div
                  onMouseDown={onVMouseDown}
                  className="h-1 bg-[#161b22] hover:bg-indigo-500/50 border-y border-[#30363d] cursor-row-resize hidden md:flex items-center justify-center transition-colors group z-20 shrink-0"
                >
                  <div className="h-0.5 w-8 bg-zinc-600 group-hover:bg-indigo-400 rounded-full" />
                </div>
              )}

              {/* Console */}
              {(consoleOpen || !isDesktop) && (
                <div
                  style={{
                    height: !isDesktop
                      ? (mobileActiveTab === 'console' ? '100%' : '0%')
                      : `${100 - editorRatio}%`
                  }}
                  className={`overflow-hidden ${!isDesktop && mobileActiveTab !== 'console' ? 'hidden' : 'block'}`}
                >
                  <SQLConsolePanel
                    runResult={runResult}
                    submitResult={submitResult}
                    running={running}
                    submitting={submitting}
                    activeConsoleTab={activeConsoleTab}
                    setActiveConsoleTab={setActiveConsoleTab}
                    problem={problem}
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
