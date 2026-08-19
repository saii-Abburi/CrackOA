import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import {
  Upload, FileText, Download, CheckCircle2, AlertCircle, Loader2,
  Building2, Code2, Users, Database, Plus, Trash2, Edit3, RefreshCw,
  Search, ExternalLink, Sparkles, X, ChevronRight
} from 'lucide-react';
import {
  getAdminStatsApi,
  bulkImportProblemsApi,
  createCompanyApi,
  deleteCompanyApi,
  createProblemApi,
  deleteProblemApi
} from '../api/admin.api.js';
import api from '../api/axiosInstance.js';
import ProblemsTable from '../components/ProblemsTable.jsx';
import SEO from '../components/SEO.jsx';

const SAMPLE_CSV = `ID,Title,Acceptance,Difficulty,Frequency,Leetcode Question Link,Topics,Companies
1,Two Sum,49.1%,Easy,95.2%,https://leetcode.com/problems/two-sum/,"Array, Hash Table","Google, Amazon, Microsoft"
146,LRU Cache,42.1%,Medium,87.6%,https://leetcode.com/problems/lru-cache/,"Hash Table, Linked List, Design","Amazon, Google, Microsoft, Meta, Uber"
200,Number of Islands,57.5%,Medium,83.9%,https://leetcode.com/problems/number-of-islands/,"Array, DFS, BFS, Matrix","Amazon, Google, Microsoft"
127,Word Ladder,37.4%,Hard,76.3%,https://leetcode.com/problems/word-ladder/,"Hash Table, String, BFS","Google, Amazon, Microsoft"
42,Trapping Rain Water,59.2%,Hard,82.1%,https://leetcode.com/problems/trapping-rain-water/,"Array, Dynamic Programming","Amazon, Google, Meta, Microsoft"
56,Merge Intervals,46.3%,Medium,84.7%,https://leetcode.com/problems/merge-intervals/,"Array, Sorting","Google, Meta, Microsoft, Uber"
207,Course Schedule,45.6%,Medium,80.2%,https://leetcode.com/problems/course-schedule/,"DFS, BFS, Graph","Google, Uber, Flipkart, Amazon"
53,Maximum Subarray,49.5%,Medium,85.3%,https://leetcode.com/problems/maximum-subarray/,"Array, Dynamic Programming","Amazon, Apple, Microsoft, Google"`;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('csv'); // 'csv' | 'companies' | 'problems' | 'stats'
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // CSV Tab State
  const [csvText, setCsvText] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // Companies Tab State
  const [companiesList, setCompaniesList] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', description: '', logo: '' });
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);

  // Problems Tab State
  const [problemsList, setProblemsList] = useState([]);
  const [problemLoading, setProblemLoading] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDifficulty, setProblemDifficulty] = useState('All');
  const [problemCompanyFilter, setProblemCompanyFilter] = useState('All');
  const [problemPage, setProblemPage] = useState(1);
  const [problemPagination, setProblemPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [newProblem, setNewProblem] = useState({
    leetcodeId: '', title: '', difficulty: 'Medium', acceptanceRate: 50,
    frequency: 70, leetcodeUrl: '', topics: '', companies: '', description: ''
  });

  // Fetch system stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await getAdminStatsApi();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Companies
  const fetchCompanies = async () => {
    setCompanyLoading(true);
    try {
      const res = await api.get('/companies');
      setCompaniesList(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setCompanyLoading(false);
    }
  };

  // Fetch Problems
  const fetchProblems = async () => {
    setProblemLoading(true);
    try {
      const params = new URLSearchParams({
        page: problemPage,
        limit: 20,
      });
      if (problemDifficulty !== 'All') params.set('difficulty', problemDifficulty);
      if (problemCompanyFilter !== 'All') params.set('company', problemCompanyFilter);
      if (problemSearch) params.set('search', problemSearch);

      const res = await api.get(`/problems?${params.toString()}`);
      setProblemsList(res.data.data.problems || res.data.data || []);
      if (res.data.pagination) {
        setProblemPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setProblemLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCompanies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProblems, 250);
    return () => clearTimeout(timer);
  }, [problemPage, problemSearch, problemDifficulty, problemCompanyFilter]);

  // Reset page when filters change
  useEffect(() => {
    setProblemPage(1);
  }, [problemSearch, problemDifficulty, problemCompanyFilter]);

  // Parse CSV text whenever it changes
  const handleParseCsv = (text) => {
    setCsvText(text);
    setParseError('');
    setImportResult(null);

    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setParseError(`CSV Parse Warning: ${results.errors[0].message}`);
        }
        setParsedRows(results.data || []);
      },
      error: (err) => {
        setParseError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  // Trigger Sample CSV Download
  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'company_dsa_sheet_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Bulk Import to Backend
  const handleSubmitImport = async () => {
    if (parsedRows.length === 0) {
      setParseError('No rows to import. Please select or paste a valid CSV file.');
      return;
    }

    setIsUploading(true);
    setParseError('');
    setImportResult(null);

    try {
      const result = await bulkImportProblemsApi(parsedRows, selectedCompany);
      setImportResult(result);
      // Refresh stats & companies
      fetchStats();
      fetchCompanies();
      fetchProblems();
    } catch (err) {
      setParseError(err.message || 'Import failed. Check server logs.');
    } finally {
      setIsUploading(false);
    }
  };

  // Add Company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await createCompanyApi(newCompany);
      setShowAddCompanyModal(false);
      setNewCompany({ name: '', description: '', logo: '' });
      fetchCompanies();
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await deleteCompanyApi(id);
      fetchCompanies();
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  // Add Problem
  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProblem,
        leetcodeId: Number(newProblem.leetcodeId),
        topics: newProblem.topics ? newProblem.topics.split(',').map((t) => t.trim()) : [],
        companies: newProblem.companies ? newProblem.companies.split(',').map((c) => c.trim()) : [],
      };
      await createProblemApi(payload);
      setShowAddProblemModal(false);
      setNewProblem({
        leetcodeId: '', title: '', difficulty: 'Medium', acceptanceRate: 50,
        frequency: 70, leetcodeUrl: '', topics: '', companies: '', description: ''
      });
      fetchProblems();
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Problem
  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      await deleteProblemApi(id);
      fetchProblems();
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-bg-primary text-text-primary">
      <SEO title="Admin - CodeRank" description="Admin dashboard" noindex={true} />
      <div className="container-xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="section-badge">Admin Portal</span>
              <span className="text-xs text-accent font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                Superuser
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              DSA Sheet Management & CSV Import
            </h1>
          </div>

          <button
            onClick={() => { fetchStats(); fetchCompanies(); fetchProblems(); }}
            className="btn-secondary self-start md:self-auto text-sm py-2 px-4"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" /> Refresh Data
          </button>
        </div>

        {/* System Overview Stats Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Problems', value: stats?.totalProblems ?? '...', icon: Code2, color: 'text-accent' },
            { label: 'Companies', value: stats?.totalCompanies ?? '...', icon: Building2, color: 'text-sky-400' },
            { label: 'Registered Users', value: stats?.totalUsers ?? '...', icon: Users, color: 'text-emerald-400' },
            { label: 'Progress Records', value: stats?.totalProgress ?? '...', icon: Database, color: 'text-amber-400' },
          ].map((item) => (
            <div key={item.label} className="bg-bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-text-muted text-xs font-medium uppercase tracking-wider">{item.label}</span>
                <item.icon className={`w-5 h-5 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="text-3xl font-black text-white tabular-nums">
                {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-text-muted" /> : item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'csv', label: 'CSV Sheet Importer', icon: Upload },
            { id: 'companies', label: `Companies (${companiesList.length})`, icon: Building2 },
            { id: 'problems', label: `Problems (${problemsList.length})`, icon: Code2 },
            { id: 'stats', label: 'Overview & Health', icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 shrink-0 ${
                activeTab === tab.id
                  ? 'border-accent text-white bg-accent/5'
                  : 'border-transparent text-text-secondary hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: CSV SHEET IMPORT */}
        {activeTab === 'csv' && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column: CSV Input & Upload Controls */}
              <div className="lg:col-span-1 space-y-5">
                <div className="bg-bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent" /> Upload CSV File
                    </h2>
                    <button
                      onClick={handleDownloadSample}
                      className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center gap-1 transition-colors"
                      title="Download a formatted sample CSV template"
                    >
                      <Download className="w-3.5 h-3.5" /> Sample CSV
                    </button>
                  </div>

                  {/* Target Company Selector */}
                  <div className="mb-4 space-y-2">
                    <label className="block text-xs font-semibold text-text-secondary">
                      Assign Sheet to Company (Recommended)
                    </label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-xs focus:outline-none focus:border-accent"
                    >
                      <option value="">-- Select Target Company --</option>
                      {companiesList.map((c) => (
                        <option key={c._id} value={c.name}>
                          Assign all problems to {c.name}
                        </option>
                      ))}
                    </select>

                    <div className="pt-1">
                      <label className="block text-[11px] font-medium text-text-muted mb-1">
                        Or enter new company / sheet name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Google, Amazon, Meta, TCS, Striver Sheet"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-xs placeholder:text-text-muted focus:outline-none focus:border-accent"
                      />
                    </div>
                    <p className="text-[11px] text-text-muted mt-1">
                      Every problem in this sheet will be organized under this company.
                    </p>
                  </div>

                  {/* Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-accent/60 bg-bg-elevated/50 hover:bg-accent/5 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group mb-4"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-accent" />
                    </div>
                    <p className="text-white text-sm font-semibold mb-1">Click to select CSV file</p>
                    <p className="text-text-muted text-xs">Supports .csv format with headers</p>
                  </div>

                  <p className="text-text-muted text-xs mb-2">Or paste raw CSV text directly:</p>
                  <textarea
                    rows={6}
                    value={csvText}
                    onChange={(e) => handleParseCsv(e.target.value)}
                    placeholder="leetcodeId,title,difficulty,acceptanceRate,frequency,leetcodeUrl,topics,companies,description&#10;1,Two Sum,Easy,49.1,95.2,https://...,Array,Google"
                    className="w-full p-3 bg-bg-elevated border border-border rounded-xl text-white font-mono text-xs placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors mb-4"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleParseCsv(SAMPLE_CSV)}
                      className="btn-secondary text-xs flex-1 py-2"
                    >
                      Load Sample Data
                    </button>
                    <button
                      onClick={handleSubmitImport}
                      disabled={isUploading || parsedRows.length === 0}
                      className="btn-primary text-xs flex-1 py-2 justify-center disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Importing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Import Sheet ({parsedRows.length})
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Import Result Summary Card */}
                {importResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-card border border-emerald-500/30 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5 shrink-0" /> Import completed
                    </div>

                    <div className="bg-bg-elevated p-3 rounded-xl border border-border">
                      <p className="text-sm font-semibold text-white">
                        {importResult.successfulRows ?? (importResult.createdCount + importResult.updatedCount)} / {importResult.totalRows ?? ((importResult.successfulRows ?? 0) + (importResult.failedRows ?? 0))} problems imported successfully
                      </p>
                      {(importResult.failedRows > 0 || importResult.errorsCount > 0) && (
                        <p className="text-xs text-red-400 mt-1 font-medium">
                          {importResult.failedRows ?? importResult.errorsCount} row{(importResult.failedRows ?? importResult.errorsCount) > 1 ? 's' : ''} failed
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-bg-elevated p-2 rounded-lg">
                        <p className="text-lg font-bold text-emerald-400">{importResult.createdCount}</p>
                        <p className="text-[10px] text-text-muted">Created</p>
                      </div>
                      <div className="bg-bg-elevated p-2 rounded-lg">
                        <p className="text-lg font-bold text-amber-400">{importResult.updatedCount}</p>
                        <p className="text-[10px] text-text-muted">Updated</p>
                      </div>
                      <div className="bg-bg-elevated p-2 rounded-lg">
                        <p className="text-lg font-bold text-red-400">{importResult.failedRows ?? importResult.errorsCount ?? 0}</p>
                        <p className="text-[10px] text-text-muted">Failed</p>
                      </div>
                    </div>

                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-xs font-semibold text-red-400 mb-2">Failed Rows Details:</p>
                        <div className="text-xs text-text-secondary max-h-40 overflow-y-auto space-y-2 pr-1">
                          {importResult.errors.map((errItem, idx) => {
                            const rowNum = typeof errItem === 'object' ? errItem.row : null;
                            const errMsg = typeof errItem === 'object' ? errItem.error : String(errItem);
                            return (
                              <div key={idx} className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                                {rowNum ? (
                                  <span className="font-bold text-red-400 block mb-0.5">Row {rowNum}</span>
                                ) : null}
                                <span className="text-text-primary text-xs">{errMsg}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {parseError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Parsed CSV Preview Table */}
              <div className="lg:col-span-2">
                <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">CSV Live Data Preview</h2>
                      <p className="text-text-muted text-xs">
                        {parsedRows.length > 0
                          ? `Parsed ${parsedRows.length} problems ready to create sheet`
                          : 'Select a CSV file or paste raw CSV to preview problem records'}
                      </p>
                    </div>
                    {parsedRows.length > 0 && (
                      <span className="px-3 py-1 bg-accent/10 border border-accent/30 text-accent text-xs font-bold rounded-full">
                        {parsedRows.length} Records
                      </span>
                    )}
                  </div>

                  {parsedRows.length > 0 ? (
                    <div className="overflow-x-auto max-h-[520px]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-bg-elevated text-text-muted uppercase tracking-wider sticky top-0 font-semibold border-b border-border">
                          <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Acceptance</th>
                            <th className="px-4 py-3">Difficulty</th>
                            <th className="px-4 py-3">Frequency</th>
                            <th className="px-4 py-3">Topics</th>
                            <th className="px-4 py-3">Companies</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {parsedRows.map((row, idx) => {
                            const getRowVal = (r, ...keys) => {
                              for (const k of keys) {
                                if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
                                const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                                for (const rK of Object.keys(r)) {
                                  if (rK.toLowerCase().replace(/[^a-z0-9]/g, '') === normK) {
                                    if (r[rK] !== undefined && r[rK] !== null && String(r[rK]).trim() !== '') return r[rK];
                                  }
                                }
                              }
                              return undefined;
                            };

                            const rId = getRowVal(row, 'ID', 'leetcodeId', 'Leetcode ID', 'id') || idx + 1;
                            const rTitle = getRowVal(row, 'Title', 'title', 'Question Title') || 'Untitled';
                            const rUrl = getRowVal(row, 'Leetcode Question Link', 'leetcodeUrl', 'Leetcode Link', 'Question Link', 'Url', 'Link');
                            const rDiff = getRowVal(row, 'Difficulty', 'difficulty') || 'Medium';
                            const rAcc = getRowVal(row, 'Acceptance', 'acceptanceRate', 'Acceptance Rate') || '—';
                            const rFreq = getRowVal(row, 'Frequency', 'frequency') || '—';
                            const rTopics = getRowVal(row, 'Topics', 'topics') || '—';
                            const rCompanies = getRowVal(row, 'Companies', 'companies') || '—';

                            return (
                              <tr key={idx} className="hover:bg-bg-elevated/40 transition-colors">
                                <td className="px-4 py-3 font-mono font-bold text-accent">{rId}</td>
                                <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">
                                  {rUrl ? (
                                    <a
                                      href={rUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-accent flex items-center gap-1.5 font-medium"
                                    >
                                      <span>{rTitle}</span>
                                      <ExternalLink className="w-3 h-3 text-accent shrink-0" />
                                    </a>
                                  ) : (
                                    <span>{rTitle}</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-text-secondary">{String(rAcc)}</td>
                                <td className="px-4 py-3">
                                  <span className={
                                    String(rDiff).toLowerCase().startsWith('e') ? 'difficulty-easy' :
                                    String(rDiff).toLowerCase().startsWith('h') ? 'difficulty-hard' :
                                    'difficulty-medium'
                                  }>
                                    {rDiff}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-text-secondary">{String(rFreq)}</td>
                                <td className="px-4 py-3 text-text-muted max-w-[140px] truncate">
                                  {Array.isArray(rTopics) ? rTopics.join(', ') : String(rTopics)}
                                </td>
                                <td className="px-4 py-3 text-sky-400 font-medium max-w-[140px] truncate">
                                  {Array.isArray(rCompanies) ? rCompanies.join(', ') : String(rCompanies)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-20 text-center px-4">
                      <FileText className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
                      <p className="text-white font-semibold text-sm mb-1">No CSV Loaded Yet</p>
                      <p className="text-text-muted text-xs max-w-sm mx-auto mb-4">
                        Upload a file or click "Load Sample Data" to quickly populate 8 pre-configured LeetCode problems with Google, Amazon, Microsoft, and Meta metadata.
                      </p>
                      <button
                        onClick={() => handleParseCsv(SAMPLE_CSV)}
                        className="btn-secondary text-xs py-2 px-4"
                      >
                        Load Sample CSV Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY MANAGEMENT */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Company Directory</h2>
                <p className="text-text-muted text-xs">Manage target companies and view company problem sheets</p>
              </div>
              <button
                onClick={() => setShowAddCompanyModal(true)}
                className="btn-primary text-xs py-2 px-4"
              >
                <Plus className="w-4 h-4" /> Add Company
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {companiesList.map((comp) => (
                <div key={comp._id} className="bg-bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:border-border-subtle transition-colors group">
                  <Link
                    to={`/companies/${comp.slug}/problems`}
                    className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90"
                    title={`View ${comp.name} Problem Sheet`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center font-bold text-white group-hover:border-accent/40 transition-colors shrink-0">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate group-hover:text-accent transition-colors">
                        {comp.name}
                      </h3>
                      <p className="text-text-muted text-xs">{comp.totalProblems || 0} Problems</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Link
                      to={`/companies/${comp.slug}/problems`}
                      className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                      title={`View ${comp.name} Problem Sheet`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="hidden sm:inline">View Sheet</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteCompany(comp._id)}
                      className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROBLEM MANAGEMENT */}
        {activeTab === 'problems' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Problem List</h2>
                <p className="text-text-muted text-xs">View, search, filter, and edit individual DSA problems</p>
              </div>
              <button
                onClick={() => setShowAddProblemModal(true)}
                className="btn-primary text-xs py-2 px-4 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Single Problem
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search by title or LeetCode ID..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-card border border-border rounded-xl text-white text-xs placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {/* Company Filter Dropdown */}
                <select
                  value={problemCompanyFilter}
                  onChange={(e) => setProblemCompanyFilter(e.target.value)}
                  className="px-3 py-2 bg-bg-card border border-border rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-accent shrink-0"
                >
                  <option value="All">All Companies</option>
                  {companiesList.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filters */}
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setProblemDifficulty(diff)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                      problemDifficulty === diff
                        ? 'bg-accent text-white'
                        : 'bg-bg-card border border-border text-text-secondary hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Problems Table */}
            {problemLoading ? (
              <div className="py-20 flex flex-col items-center justify-center bg-bg-card border border-border rounded-2xl">
                <Loader2 className="w-8 h-8 text-accent animate-spin mb-3" />
                <p className="text-text-muted text-sm">Fetching DSA problems...</p>
              </div>
            ) : (
              <ProblemsTable
                problems={problemsList}
                columns={['id', 'title', 'difficulty', 'acceptance', 'frequency', 'companies', 'practice', 'actions']}
                currentPage={problemPagination.page || problemPage}
                totalPages={problemPagination.totalPages || 1}
                onPageChange={setProblemPage}
                onDelete={handleDeleteProblem}
                totalCount={problemPagination.total || 0}
                pageSize={20}
                emptyMessage="No problems found matching your query."
              />
            )}
          </div>
        )}

        {/* TAB 4: SYSTEM STATS & OVERVIEW */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">Platform Infrastructure Status</h2>
              <p className="text-text-secondary text-sm mb-6">
                All services (MongoDB database, Express API, and JWT authentication) are operating normally.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-bg-elevated rounded-xl border border-border">
                  <p className="text-xs text-text-muted uppercase font-bold mb-1">Database Engine</p>
                  <p className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> MongoDB Mongoose v8
                  </p>
                </div>
                <div className="p-4 bg-bg-elevated rounded-xl border border-border">
                  <p className="text-xs text-text-muted uppercase font-bold mb-1">Authentication</p>
                  <p className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> JWT Stateless Bearer Token
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD COMPANY MODAL */}
        {showAddCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Add New Company</h3>
                <button onClick={() => setShowAddCompanyModal(false)} className="text-text-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    placeholder="e.g. Google, Amazon, Meta"
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Description (Optional)</label>
                  <textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    placeholder="Brief description of company interview focus..."
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddCompanyModal(false)} className="btn-secondary text-xs flex-1 py-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs flex-1 py-2 justify-center">
                    Create Company
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD PROBLEM MODAL */}
        {showAddProblemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Add Single Problem</h3>
                <button onClick={() => setShowAddProblemModal(false)} className="text-text-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateProblem} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">LeetCode ID</label>
                    <input
                      type="number"
                      required
                      value={newProblem.leetcodeId}
                      onChange={(e) => setNewProblem({ ...newProblem, leetcodeId: e.target.value })}
                      placeholder="e.g. 1"
                      className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">Difficulty</label>
                    <select
                      value={newProblem.difficulty}
                      onChange={(e) => setNewProblem({ ...newProblem, difficulty: e.target.value })}
                      className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Problem Title</label>
                  <input
                    type="text"
                    required
                    value={newProblem.title}
                    onChange={(e) => setNewProblem({ ...newProblem, title: e.target.value })}
                    placeholder="e.g. Two Sum"
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Companies (Comma Separated)</label>
                  <input
                    type="text"
                    value={newProblem.companies}
                    onChange={(e) => setNewProblem({ ...newProblem, companies: e.target.value })}
                    placeholder="Google, Amazon, Microsoft"
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Topics (Comma Separated)</label>
                  <input
                    type="text"
                    value={newProblem.topics}
                    onChange={(e) => setNewProblem({ ...newProblem, topics: e.target.value })}
                    placeholder="Array, Hash Table"
                    className="w-full p-2.5 bg-bg-elevated border border-border rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button type="button" onClick={() => setShowAddProblemModal(false)} className="btn-secondary text-xs flex-1 py-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs flex-1 py-2 justify-center">
                    Add Problem
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
