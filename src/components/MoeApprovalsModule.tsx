/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  MessageSquare,
  ShieldCheck,
  Building,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  X,
  Layers,
  FileText,
  UserCheck,
  Sliders,
  DollarSign,
} from 'lucide-react';
import {
  ApprovalItem,
  ApprovalWorkflowConfig,
  ApprovalRequestType,
  ApprovalStatus,
  AuthUser,
} from '../types/school';
import { INITIAL_APPROVAL_ITEMS, INITIAL_APPROVAL_WORKFLOWS } from '../data/mockApprovalsData';
import { db, isConfiguredWithRealFirebase } from '../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

interface Props {
  currentUser: AuthUser;
  onLogAudit?: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

export const MoeApprovalsModule: React.FC<Props> = ({ currentUser, onLogAudit }) => {
  const [subTab, setSubTab] = useState<'my-approvals' | 'approval-setup'>('my-approvals');

  // Approvals items state (persisted to localStorage & Firestore)
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>(() => {
    const saved = localStorage.getItem('limuru_moe_approvals');
    return saved ? JSON.parse(saved) : INITIAL_APPROVAL_ITEMS;
  });

  // Workflows state (persisted to localStorage & Firestore)
  const [workflows, setWorkflows] = useState<ApprovalWorkflowConfig[]>(() => {
    const saved = localStorage.getItem('limuru_moe_workflows');
    return saved ? JSON.parse(saved) : INITIAL_APPROVAL_WORKFLOWS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('limuru_moe_approvals', JSON.stringify(approvalItems));
  }, [approvalItems]);

  useEffect(() => {
    localStorage.setItem('limuru_moe_workflows', JSON.stringify(workflows));
  }, [workflows]);

  // Sync with Firestore if connected
  useEffect(() => {
    if (db && isConfiguredWithRealFirebase()) {
      getDocs(collection(db, 'moeApprovals'))
        .then((snapshot) => {
          if (!snapshot.empty) {
            const items: ApprovalItem[] = [];
            snapshot.forEach((docSnap) => items.push(docSnap.data() as ApprovalItem));
            setApprovalItems(items);
          }
        })
        .catch((err) => console.warn('Could not read approvals from Firestore:', err));
    }
  }, []);

  // Filter State for "My Approvals"
  const [statusFilter, setStatusFilter] = useState<'All' | ApprovalStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'All' | '7days' | '30days'>('All');

  // Modal State for Commenting / Rejecting
  const [activeItemForAction, setActiveItemForAction] = useState<ApprovalItem | null>(null);
  const [actionType, setActionType] = useState<'Approve' | 'Reject' | 'Comment' | null>(null);
  const [actionComment, setActionComment] = useState('');

  // Workflow Editor State
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || 'wf-01');
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflowConfig | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered approval items
  const filteredApprovals = useMemo(() => {
    return approvalItems.filter((item) => {
      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) return false;

      // Date filter
      if (dateFilter !== 'All') {
        const itemDate = new Date(item.submittedDate).getTime();
        const now = Date.now();
        const daysAgo = (now - itemDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === '7days' && daysAgo > 7) return false;
        if (dateFilter === '30days' && daysAgo > 30) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.schoolName.toLowerCase().includes(q) ||
          item.submittedBy.toLowerCase().includes(q) ||
          item.trackingRef.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [approvalItems, statusFilter, dateFilter, searchQuery]);

  // Handle Approve Action
  const handleConfirmApproval = () => {
    if (!activeItemForAction) return;

    const officerName = currentUser.name;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updated = approvalItems.map((item) => {
      if (item.id !== activeItemForAction.id) return item;

      const newHistory = [
        ...item.approvalHistory,
        {
          stage: item.currentStageNumber,
          stageRole: item.currentStageRole,
          action: 'Approved' as const,
          officerName,
          timestamp,
          comments: actionComment.trim() || 'Approved in compliance with Ministry regulations.',
        },
      ];

      const nextStage = item.currentStageNumber + 1;
      const isCompleted = nextStage > item.totalStages;

      return {
        ...item,
        status: isCompleted ? ('Approved' as ApprovalStatus) : ('Pending' as ApprovalStatus),
        currentStageNumber: isCompleted ? item.totalStages : nextStage,
        currentStageRole: isCompleted ? 'Approved' : 'Final Treasury Release',
        approvalHistory: newHistory,
      };
    });

    setApprovalItems(updated);
    showToast(`Approved item: ${activeItemForAction.trackingRef} (${activeItemForAction.title})`);

    // Firestore sync
    if (db && isConfiguredWithRealFirebase()) {
      setDoc(doc(db, 'moeApprovals', activeItemForAction.id), activeItemForAction, { merge: true }).catch(() => {});
    }

    if (onLogAudit) {
      onLogAudit(
        'MOE_APPROVAL_GRANTED' as any,
        `Approval: ${activeItemForAction.trackingRef}`,
        `${officerName} approved ${activeItemForAction.type} for ${activeItemForAction.schoolName}. Remarks: ${actionComment || 'None'}.`,
        'Restricted'
      );
    }

    setActiveItemForAction(null);
    setActionType(null);
    setActionComment('');
  };

  // Handle Reject Action
  const handleConfirmRejection = () => {
    if (!activeItemForAction || !actionComment.trim()) {
      alert('Please provide a specific reason for rejection.');
      return;
    }

    const officerName = currentUser.name;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updated = approvalItems.map((item) => {
      if (item.id !== activeItemForAction.id) return item;

      return {
        ...item,
        status: 'Rejected' as ApprovalStatus,
        approvalHistory: [
          ...item.approvalHistory,
          {
            stage: item.currentStageNumber,
            stageRole: item.currentStageRole,
            action: 'Rejected' as const,
            officerName,
            timestamp,
            comments: actionComment.trim(),
          },
        ],
      };
    });

    setApprovalItems(updated);
    showToast(`Rejected item: ${activeItemForAction.trackingRef}. Submitter notified.`);

    if (onLogAudit) {
      onLogAudit(
        'MOE_APPROVAL_REJECTED' as any,
        `Approval: ${activeItemForAction.trackingRef}`,
        `${officerName} rejected ${activeItemForAction.type} for ${activeItemForAction.schoolName}. Reason: ${actionComment}.`,
        'Restricted'
      );
    }

    setActiveItemForAction(null);
    setActionType(null);
    setActionComment('');
  };

  // Handle Add Comment
  const handleConfirmComment = () => {
    if (!activeItemForAction || !actionComment.trim()) return;

    const officerName = currentUser.name;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updated = approvalItems.map((item) => {
      if (item.id !== activeItemForAction.id) return item;

      return {
        ...item,
        approvalHistory: [
          ...item.approvalHistory,
          {
            stage: item.currentStageNumber,
            stageRole: item.currentStageRole,
            action: 'Commented' as const,
            officerName,
            timestamp,
            comments: actionComment.trim(),
          },
        ],
      };
    });

    setApprovalItems(updated);
    showToast(`Recorded comment on ${activeItemForAction.trackingRef}`);
    setActiveItemForAction(null);
    setActionType(null);
    setActionComment('');
  };

  // Select workflow to edit
  const activeWorkflow = useMemo(() => {
    return workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];
  }, [workflows, selectedWorkflowId]);

  // Start editing a workflow
  const handleStartEditWorkflow = (wf: ApprovalWorkflowConfig) => {
    setEditingWorkflow(JSON.parse(JSON.stringify(wf)));
  };

  // Save edited workflow
  const handleSaveWorkflow = () => {
    if (!editingWorkflow) return;

    const updated = workflows.map((w) => (w.id === editingWorkflow.id ? editingWorkflow : w));
    setWorkflows(updated);
    setEditingWorkflow(null);
    showToast(`Workflow saved: ${editingWorkflow.requestType}`);

    if (onLogAudit) {
      onLogAudit(
        'MOE_WORKFLOW_UPDATE' as any,
        `Workflow: ${editingWorkflow.requestType}`,
        `Updated multi-stage approval workflow with ${editingWorkflow.stages.length} stages.`,
        'Restricted'
      );
    }
  };

  // Add stage to editing workflow
  const handleAddStage = () => {
    if (!editingWorkflow) return;
    const newStageNumber = editingWorkflow.stages.length + 1;
    setEditingWorkflow({
      ...editingWorkflow,
      stages: [
        ...editingWorkflow.stages,
        {
          stageNumber: newStageNumber,
          stageName: `Stage ${newStageNumber} Review`,
          approverRole: 'CDE / Director Basic Education',
          requirement: 'One Approver',
          slaHours: 48,
        },
      ],
    });
  };

  // Delete stage from editing workflow
  const handleDeleteStage = (stageIdx: number) => {
    if (!editingWorkflow || editingWorkflow.stages.length <= 1) {
      alert('A workflow must have at least one approval stage.');
      return;
    }
    const filtered = editingWorkflow.stages.filter((_, idx) => idx !== stageIdx);
    const renumbered = filtered.map((s, idx) => ({ ...s, stageNumber: idx + 1 }));
    setEditingWorkflow({ ...editingWorkflow, stages: renumbered });
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950 text-emerald-100 border border-emerald-500 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🇰🇪</span>
            <h2 className="text-lg font-bold text-slate-900">
              Ministry of Education · State Approvals & Workflows
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase font-mono">
              Oversight
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authorizations ledger for institutional capitation disbursements, teacher transfers, infrastructure grants, and approval pipeline configuration.
          </p>
        </div>

        {/* Sub-Tabs: My Approvals vs Approval Setup */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setSubTab('my-approvals')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-2 ${
              subTab === 'my-approvals'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Approvals</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              subTab === 'my-approvals' ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {approvalItems.filter((i) => i.status === 'Pending').length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('approval-setup')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-2 ${
              subTab === 'approval-setup'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Approval Setup</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-SECTION 1: MY APPROVALS
          ========================================================================= */}
      {subTab === 'my-approvals' && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter Status:
              </span>
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-md font-bold transition-colors ${
                    statusFilter === status
                      ? status === 'Pending'
                        ? 'bg-amber-600 text-white'
                        : status === 'Approved'
                        ? 'bg-emerald-700 text-white'
                        : status === 'Rejected'
                        ? 'bg-rose-700 text-white'
                        : 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {status}
                  {status !== 'All' && (
                    <span className="ml-1.5 font-mono text-[10px]">
                      ({approvalItems.filter((i) => i.status === status).length})
                    </span>
                  )}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

              <span className="font-semibold text-slate-700 mr-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date:
              </span>
              {(['All', '7days', '30days'] as const).map((df) => (
                <button
                  key={df}
                  onClick={() => setDateFilter(df)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    dateFilter === df
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {df === 'All' ? 'All Time' : df === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>

            <div className="relative min-w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search request, school, tracking ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* List of Approval Items */}
          <div className="space-y-3">
            {filteredApprovals.length > 0 ? (
              filteredApprovals.map((item) => {
                const isPending = item.status === 'Pending';
                const isApproved = item.status === 'Approved';
                const isRejected = item.status === 'Rejected';

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/20'
                        : isApproved
                        ? 'border-emerald-200 bg-emerald-50/15'
                        : 'border-rose-200 bg-rose-50/15'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Request Title, Meta & Submitter */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.trackingRef}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-100 text-teal-800">
                            {item.type}
                          </span>
                          {item.urgency === 'Immediate' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase animate-pulse">
                              Immediate Action
                            </span>
                          )}
                          {item.urgency === 'Urgent' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                              Urgent
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isPending
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {item.schoolName} ({item.subCounty} Sub-County)
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            Submitted by: <strong className="text-slate-800">{item.submittedBy}</strong> ({item.submitterRole})
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {item.submittedDate}
                          </span>
                          {item.amountKes !== undefined && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="font-mono font-bold text-emerald-800 flex items-center">
                                Amount: KES {item.amountKes.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Stage Progress Bar */}
                        <div className="pt-2 flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-slate-600">
                            Stage {item.currentStageNumber} of {item.totalStages}: {item.currentStageRole}
                          </span>
                          <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isApproved ? 'bg-emerald-600' : isRejected ? 'bg-rose-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${(item.currentStageNumber / item.totalStages) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Approve, Reject, Comment) */}
                      <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                        {isPending && (
                          <>
                            <button
                              onClick={() => {
                                setActiveItemForAction(item);
                                setActionType('Approve');
                                setActionComment('');
                              }}
                              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>

                            <button
                              onClick={() => {
                                setActiveItemForAction(item);
                                setActionType('Reject');
                                setActionComment('');
                              }}
                              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setActiveItemForAction(item);
                            setActionType('Comment');
                            setActionComment('');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                          Comment
                        </button>
                      </div>
                    </div>

                    {/* Stage History */}
                    {item.approvalHistory.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-2">
                        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          Action & Audit Trail:
                        </div>
                        {item.approvalHistory.map((hist, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              {hist.action === 'Approved' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : hist.action === 'Rejected' ? (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              ) : (
                                <MessageSquare className="w-4 h-4 text-sky-600 shrink-0" />
                              )}
                              <span className="font-bold text-slate-900">{hist.officerName}</span>
                              <span className="text-slate-500">({hist.stageRole})</span>
                              {hist.comments && (
                                <span className="text-slate-700 italic">"{hist.comments}"</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {hist.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                No approval items found matching the selected filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-SECTION 2: APPROVAL SETUP (WORKFLOW CONFIGURATION)
          ========================================================================= */}
      {subTab === 'approval-setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Workflow List */}
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Standard Workflows ({workflows.length})
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Select a statutory workflow type to inspect or modify its approval stages and officer assignments.
              </p>
              <div className="space-y-2">
                {workflows.map((wf) => {
                  const isSelected = selectedWorkflowId === wf.id;
                  return (
                    <div
                      key={wf.id}
                      onClick={() => {
                        setSelectedWorkflowId(wf.id);
                        setEditingWorkflow(null);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{wf.requestType}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200">
                          {wf.stages.length} Stages
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-1 line-clamp-2">
                        {wf.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Workflow Stages Configuration Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-700" />
                    Workflow Pipeline: {editingWorkflow ? editingWorkflow.requestType : activeWorkflow.requestType}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingWorkflow ? editingWorkflow.description : activeWorkflow.description}
                  </p>
                </div>

                {!editingWorkflow ? (
                  <button
                    onClick={() => handleStartEditWorkflow(activeWorkflow)}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Configure Stages
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingWorkflow(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveWorkflow}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Workflow
                    </button>
                  </div>
                )}
              </div>

              {/* Stages List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase">
                  <span>Sequential Approval Order & Stages</span>
                  {editingWorkflow && (
                    <button
                      onClick={handleAddStage}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stage
                    </button>
                  )}
                </div>

                {(editingWorkflow ? editingWorkflow.stages : activeWorkflow.stages).map((stage, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-7 h-7 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0">
                        {stage.stageNumber}
                      </div>
                      <div className="space-y-1 flex-1">
                        {editingWorkflow ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={stage.stageName}
                              onChange={(e) => {
                                const newStages = [...editingWorkflow.stages];
                                newStages[idx].stageName = e.target.value;
                                setEditingWorkflow({ ...editingWorkflow, stages: newStages });
                              }}
                              className="w-full px-2.5 py-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-900"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  Responsible Role / Authority
                                </label>
                                <select
                                  value={stage.approverRole}
                                  onChange={(e) => {
                                    const newStages = [...editingWorkflow.stages];
                                    newStages[idx].approverRole = e.target.value;
                                    setEditingWorkflow({ ...editingWorkflow, stages: newStages });
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                                >
                                  <option value="SCDE (Sub-County Director of Education)">
                                    SCDE (Sub-County Director of Education)
                                  </option>
                                  <option value="DQASO Inspection Team">DQASO Inspection Team</option>
                                  <option value="CDE / Director Basic Education">
                                    CDE / Director Basic Education
                                  </option>
                                  <option value="Director of School Audit & Accounts">
                                    Director of School Audit & Accounts
                                  </option>
                                  <option value="County School Auditor">County School Auditor</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                  Approval Quorum Requirement
                                </label>
                                <select
                                  value={stage.requirement}
                                  onChange={(e) => {
                                    const newStages = [...editingWorkflow.stages];
                                    newStages[idx].requirement = e.target.value as any;
                                    setEditingWorkflow({ ...editingWorkflow, stages: newStages });
                                  }}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                                >
                                  <option value="One Approver">One Approver Sufficient</option>
                                  <option value="All Approvers">All Approvers Required (Full Board)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="font-bold text-slate-900 text-xs">{stage.stageName}</div>
                            <div className="text-slate-600 flex items-center gap-3 flex-wrap">
                              <span>
                                Approver: <strong className="text-slate-800">{stage.approverRole}</strong>
                              </span>
                              <span>·</span>
                              <span className="font-medium text-emerald-800">
                                Requirement: {stage.requirement}
                              </span>
                              <span>·</span>
                              <span className="text-slate-400">SLA: {stage.slaHours} hours</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {editingWorkflow && (
                      <button
                        onClick={() => handleDeleteStage(idx)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 self-end sm:self-center"
                        title="Delete stage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Statutory Note:</strong> Defined stages enforce the Public Finance Management Act (PFMA 2012) and Basic Education Regulations. Changes immediately govern all newly submitted institutional requisitions.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog Modal (Approve, Reject, Comment) */}
      {activeItemForAction && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {actionType === 'Approve' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : actionType === 'Reject' ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-sky-600" />
                )}
                <h3 className="text-sm font-bold text-slate-900">
                  {actionType === 'Approve'
                    ? 'Confirm State Approval'
                    : actionType === 'Reject'
                    ? 'Reject Requisition'
                    : 'Add Officer Comment'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveItemForAction(null);
                  setActionType(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <strong>Requisition:</strong> {activeItemForAction.title}
              </div>
              <div>
                <strong>School:</strong> {activeItemForAction.schoolName} ({activeItemForAction.trackingRef})
              </div>
              {activeItemForAction.amountKes && (
                <div>
                  <strong>Amount:</strong> KES {activeItemForAction.amountKes.toLocaleString()}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {actionType === 'Reject'
                  ? 'Mandatory Reason for Rejection *'
                  : 'Officer Remarks / Comments (Optional)'}
              </label>
              <textarea
                rows={3}
                required={actionType === 'Reject'}
                placeholder={
                  actionType === 'Reject'
                    ? 'State statutory reason for non-concurrence...'
                    : 'Add any remarks or instructions for submitter...'
                }
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveItemForAction(null);
                  setActionType(null);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              {actionType === 'Approve' && (
                <button
                  onClick={handleConfirmApproval}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Approve Requisition
                </button>
              )}
              {actionType === 'Reject' && (
                <button
                  onClick={handleConfirmRejection}
                  className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
                >
                  Reject & Return
                </button>
              )}
              {actionType === 'Comment' && (
                <button
                  onClick={handleConfirmComment}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                >
                  Record Comment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
