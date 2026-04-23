/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, MapPin } from 'lucide-react';

// --- Types & Constants ---
const DEPARTMENT_OPTIONS = [
  '病房', '心臟超音波室', '肺功能室', '內視鏡室', '會診', '洗腎室', '放射科'
];
const TRANSFER_TOOLS = ['推床', '輪椅', '步行'];

type Urgency = 'A' | 'B' | 'C' | 'D';
type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'COMPLETED';

interface TransferTask {
  id: string;
  patientName: string;
  mrn: string; // Medical Record Number
  bedNumber?: string;
  tool: string;
  from: string;
  to: string;
  status: TransferStatus;
  urgency: Urgency;
  needsOxygen: boolean;
  isFallRisk: boolean;
  requestedAt: number;
  updatedAt: number;
  notes: string;
  receiverName?: string;
}

const URGENCY_CONFIG = {
  'A': { label: '等級 A', color: 'bg-red-100 text-red-700' },
  'B': { label: '等級 B', color: 'bg-amber-100 text-amber-700' },
  'C': { label: '等級 C', color: 'bg-blue-100 text-blue-700' },
  'D': { label: '等級 D', color: 'bg-green-100 text-green-700' },
};

const STATUS_COLUMNS: { id: TransferStatus; label: string; countColor: string }[] = [
  { id: 'PENDING', label: '待處理任務', countColor: 'text-amber-500' },
  { id: 'IN_TRANSIT', label: '轉送中', countColor: 'text-blue-600' },
  { id: 'COMPLETED', label: '已完成', countColor: 'text-green-600' },
];

const INITIAL_DATA: TransferTask[] = [
  {
    id: 'MT-9241',
    patientName: '王大明',
    mrn: 'MRN-88291',
    bedNumber: '501-1',
    tool: '輪椅',
    from: '病房',
    to: '放射科',
    status: 'PENDING',
    urgency: 'B',
    needsOxygen: false,
    isFallRisk: true,
    requestedAt: Date.now() - 1000 * 60 * 15,
    updatedAt: Date.now() - 1000 * 60 * 15,
    notes: '疑似骨折，需要輪椅',
  },
  {
    id: 'MT-9245',
    patientName: '李小梅',
    mrn: 'MRN-44123',
    bedNumber: '1102-2',
    tool: '推床',
    from: '病房',
    to: '內視鏡室',
    status: 'IN_TRANSIT',
    urgency: 'A',
    needsOxygen: true,
    isFallRisk: false,
    requestedAt: Date.now() - 1000 * 60 * 45,
    updatedAt: Date.now() - 1000 * 60 * 10,
    notes: '病床轉送，備妥氧氣筒',
    receiverName: '陳護理師',
  },
  {
    id: 'MT-9238',
    patientName: '陳阿花',
    mrn: 'MRN-99012',
    bedNumber: '門診',
    tool: '步行',
    from: '會診',
    to: '心臟超音波室',
    status: 'COMPLETED',
    urgency: 'D',
    needsOxygen: false,
    isFallRisk: false,
    requestedAt: Date.now() - 1000 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 20,
    notes: '一般轉送',
    receiverName: '王醫師',
  }
];

// --- Helpers ---
const formatTime = (ms: number) => {
  const date = new Date(ms);
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
};

const generateId = () => `MT-${Math.floor(1000 + Math.random() * 9000)}`;

// --- Main App Component ---
export default function App() {
  const [tasks, setTasks] = useState<TransferTask[]>(INITIAL_DATA);
  const [departments, setDepartments] = useState<string[]>(DEPARTMENT_OPTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-refresh times every minute (dummy timer just to force re-render if we added "Time elapsed")
  useEffect(() => {
    const timer = setInterval(() => setTasks([...tasks]), 60000);
    return () => clearInterval(timer);
  }, [tasks]);

  const updateTaskStatus = (taskId: string, newStatus: TransferStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: Date.now() }
          : task
      )
    );
  };

  const handleCreateTask = (newTask: Omit<TransferTask, 'id' | 'status' | 'requestedAt' | 'updatedAt'>) => {
    const task: TransferTask = {
      ...newTask,
      id: generateId(),
      status: 'PENDING',
      requestedAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTasks(prev => [task, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900 border-x-0 sm:border-x-4 border-slate-200">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm shrink-0 w-full">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">醫院病人轉送系統</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Patient Logistics Dashboard</p>
          </div>
        </div>
        <div className="flex items-center space-x-8 hidden sm:flex">
          <div className="flex space-x-6">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">All Tasks</p>
              <p className="text-lg font-bold text-slate-800">{tasks.length}</p>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Pending</p>
              <p className="text-lg font-bold text-amber-500">{tasks.filter(t => t.status === 'PENDING').length}</p>
            </div>
            <div className="text-center border-l border-slate-200 pl-6">
              <p className="text-[10px] text-slate-400 font-bold uppercase">In Transit</p>
              <p className="text-lg font-bold text-blue-600">{tasks.filter(t => t.status === 'IN_TRANSIT').length}</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded uppercase tracking-wide transition-colors"
          >
            + New Task
          </button>
        </div>
        {/* Mobile quick add */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="sm:hidden bg-slate-900 text-white p-2 rounded"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Main Board */}
      <main className="flex-1 overflow-hidden p-6 relative flex flex-col items-center">
         <div className="flex flex-col md:flex-row gap-6 h-full max-w-7xl w-full">
          {STATUS_COLUMNS.map(col => (
            <div key={col.id} className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex-1 shadow-sm shrink-0">
              {/* Column Header */}
              <div className="p-4 border-b border-slate-200 bg-white shadow-sm flex items-center justify-between shrink-0 mb-4 rounded-t-lg">
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center">{col.label}</h2>
                <span className={`text-lg font-bold ${col.countColor}`}>
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                <AnimatePresence>
                  {tasks
                    .filter(task => task.status === col.id)
                    .sort((a, b) => b.requestedAt - a.requestedAt)
                    .map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdateStatus={updateTaskStatus}
                      />
                    ))}
                  {tasks.filter(t => t.status === col.id).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 pt-10"
                    >
                      <p className="text-xs font-bold uppercase tracking-widest">No Active Tasks</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
           ))}
         </div>
      </main>

      {/* New Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateTaskModal
            departments={departments}
            onClose={() => setIsModalOpen(false)}
            onSubmit={(newTask) => {
              // Add custom department to options if not exists
              if (newTask.to && !departments.includes(newTask.to)) {
                setDepartments(prev => [...prev, newTask.to]);
              }
              handleCreateTask(newTask);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Task Card Component ---
function TaskCard({ task, onUpdateStatus }: { task: TransferTask, onUpdateStatus: (id: string, status: TransferStatus) => void }) {
  const urgencyObj = URGENCY_CONFIG[task.urgency];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative flex flex-col group hover:shadow transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-400">#{task.id}</span>
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${urgencyObj.color}`}>
          {urgencyObj.label}
        </span>
      </div>
      
      <p className="font-bold text-sm text-slate-800">{task.patientName} <span className="text-slate-500 font-normal ml-1">({task.mrn})</span></p>
      
      <div className="mt-1 flex flex-wrap gap-2">
        {task.bedNumber && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            床號: {task.bedNumber}
          </span>
        )}
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
          工具: {task.tool}
        </span>
        {task.needsOxygen && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            需氧氣
          </span>
        )}
        {task.isFallRisk && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            防跌倒
          </span>
        )}
      </div>

      <div className="mt-3 mb-3 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Requested Time</p>
          <p className="text-xs font-bold text-slate-600">{formatTime(task.requestedAt)}</p>
        </div>
        {task.receiverName && (
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Receiver</p>
            <p className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {task.receiverName}
            </p>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
        <span className="font-medium text-slate-700 truncate w-full flex-1">{task.from}</span>
        <svg className="w-3 h-3 mx-2 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg>
        <span className="font-medium text-slate-700 truncate w-full flex-1 text-right">{task.to}</span>
      </div>

      {task.notes && (
        <div className="mt-3 flex items-start text-xs text-slate-500 italic pb-1">
          <span className="line-clamp-2">{task.notes}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col mt-4 pt-4 border-t border-slate-100 space-y-2">
        {task.status === 'PENDING' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'IN_TRANSIT')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-2 rounded uppercase tracking-wider transition-colors"
          >
            Start Transfer
          </button>
        )}
        {task.status === 'IN_TRANSIT' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 rounded uppercase tracking-wider transition-colors"
          >
            Complete Transfer
          </button>
        )}
        {task.status === 'COMPLETED' && (
          <div className="w-full bg-slate-100 text-slate-400 text-[11px] font-bold py-2 rounded uppercase tracking-wider text-center">
            Resolved
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Create Task Modal Component ---
function CreateTaskModal({ departments, onClose, onSubmit }: { departments: string[], onClose: () => void, onSubmit: (t: any) => void }) {
  const [formData, setFormData] = useState({
    patientName: '',
    mrn: '',
    bedNumber: '',
    tool: TRANSFER_TOOLS[0],
    from: departments[0],
    to: departments[1],
    urgency: 'C' as Urgency,
    needsOxygen: false,
    isFallRisk: false,
    notes: '',
    receiverName: ''
  });
  
  const [isCustomTo, setIsCustomTo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.mrn) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            新增病人轉送任務
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">病患姓名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                autoFocus
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium transition-shadow"
                placeholder="Ex. 王小明"
                value={formData.patientName}
                onChange={e => setFormData({...formData, patientName: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">病歷號 (MRN) <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm transition-shadow"
                placeholder="Ex. MRN-123456"
                value={formData.mrn}
                onChange={e => setFormData({...formData, mrn: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">床號 / Bed No. (選填)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm transition-shadow"
                placeholder="Ex. 503-A"
                value={formData.bedNumber}
                onChange={e => setFormData({...formData, bedNumber: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">接收人員 / Receiver (選填)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium transition-shadow"
                placeholder="Ex. 林護理師"
                value={formData.receiverName}
                onChange={e => setFormData({...formData, receiverName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">來源單位 (From) <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2 text-slate-400" size={16} />
                <select
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white font-medium text-sm text-slate-700"
                  value={formData.from}
                  onChange={e => setFormData({...formData, from: e.target.value})}
                >
                  {departments.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">目的單位 (To) <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                {isCustomTo ? (
                  <div className="flex w-full gap-2 relative">
                    <input
                      autoFocus
                      className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium transition-shadow"
                      placeholder="請輸入目的地..."
                      value={formData.to}
                      onChange={e => setFormData({...formData, to: e.target.value})}
                    />
                    <button 
                      type="button" 
                      onClick={() => { setIsCustomTo(false); setFormData({...formData, to: departments[1]}); }} 
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600 bg-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <select
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white font-medium text-sm text-slate-700"
                    value={departments.includes(formData.to) ? formData.to : 'CUSTOM'}
                    onChange={e => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomTo(true);
                        setFormData({...formData, to: ''});
                      } else {
                        setFormData({...formData, to: e.target.value});
                      }
                    }}
                  >
                    {departments.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="CUSTOM" className="text-blue-600 font-bold bg-slate-50">+ 新增自訂目的地...</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">緊急程度</label>
            <div className="grid grid-cols-4 gap-2">
              {(['A', 'B', 'C', 'D'] as Urgency[]).map((urgency) => {
                const config = URGENCY_CONFIG[urgency];
                const isSelected = formData.urgency === urgency;
                return (
                  <button
                    key={urgency}
                    type="button"
                    onClick={() => setFormData({...formData, urgency})}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded border text-[11px] font-bold uppercase tracking-wider transition-all ${
                      isSelected 
                        ? `${config.color} border-transparent ring-2 ring-offset-1 ${urgency === 'A' ? 'ring-red-400' : urgency === 'B' ? 'ring-amber-400' : urgency === 'C' ? 'ring-blue-400' : 'ring-green-400'}`
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {urgency} 級
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">轉送工具</label>
            <div className="grid grid-cols-3 gap-3">
              {TRANSFER_TOOLS.map((tool) => {
                const isSelected = formData.tool === tool;
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setFormData({...formData, tool})}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded border text-[11px] font-bold tracking-wider transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20 ring-offset-1'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {tool}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">特殊需求</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.needsOxygen ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300 group-hover:border-purple-400'}`}>
                  {formData.needsOxygen && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <span className="text-[11px] font-bold text-slate-700 select-none tracking-wider">需氧氣</span>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.needsOxygen}
                  onChange={(e) => setFormData({...formData, needsOxygen: e.target.checked})}
                />
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.isFallRisk ? 'bg-rose-600 border-rose-600' : 'bg-white border-slate-300 group-hover:border-rose-400'}`}>
                  {formData.isFallRisk && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <span className="text-[11px] font-bold text-slate-700 select-none tracking-wider">高危跌倒</span>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={formData.isFallRisk}
                  onChange={(e) => setFormData({...formData, isFallRisk: e.target.checked})}
                />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">備註事項 (選填)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-shadow resize-none text-sm font-medium"
              placeholder="..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3 pb-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded text-[11px] uppercase tracking-wider font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-transparent"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded text-[11px] uppercase tracking-wider font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm active:scale-95 transition-all flex items-center gap-2"
            >
              建立任務
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

