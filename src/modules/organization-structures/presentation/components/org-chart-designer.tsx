'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  ArrowRight,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  User,
  Eye,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  OrgChartStructure,
  OrgChartPersonNode,
} from '../../domain/org-chart-designer.types';
import {
  DEFAULT_EDL_BOARD_PRESET,
  DEFAULT_EXECUTIVE_PRESET,
  DEFAULT_BLANK_PRESET,
} from '../../domain/org-chart-designer.types';
import { OrgChartNodeEditorModal } from './org-chart-node-editor-modal';
import { cn } from '@/lib/utils';

interface OrgChartDesignerProps {
  structure: OrgChartStructure;
  onChange: (structure: OrgChartStructure) => void;
  readOnly?: boolean;
}

export function OrgChartDesigner({
  structure,
  onChange,
  readOnly = false,
}: OrgChartDesignerProps) {
  const [zoom, setZoom] = useState(1);
  const [editingNode, setEditingNode] = useState<{
    node: OrgChartPersonNode;
    isLeader: boolean;
  } | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>('board');
  const [previewMode, setPreviewMode] = useState(false);

  // Quick photo upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetUploadNodeRef = useRef<{ id: string; isLeader: boolean } | null>(
    null
  );

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.6));
  const handleZoomReset = () => setZoom(1);

  // Template switch
  const handleSelectTemplate = (type: 'board' | 'executive' | 'blank') => {
    setActiveTemplate(type);
    if (type === 'board') {
      onChange(JSON.parse(JSON.stringify(DEFAULT_EDL_BOARD_PRESET)));
    } else if (type === 'executive') {
      onChange(JSON.parse(JSON.stringify(DEFAULT_EXECUTIVE_PRESET)));
    } else {
      onChange(JSON.parse(JSON.stringify(DEFAULT_BLANK_PRESET)));
    }
  };

  // Add Member
  const handleAddMember = () => {
    const newMember: OrgChartPersonNode = {
      id: `member-${Date.now()}`,
      departmentBadge: 'ໜ່ວຍງານ / ພະແນກ / ສັງກັດໃໝ່',
      nameLao: 'ຊື່ ແລະ ນາມສະກຸນໃໝ່',
      nameEn: 'New Member Name',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    };
    onChange({
      ...structure,
      members: [...structure.members, newMember],
    });
  };

  // Delete Member
  const handleDeleteMember = (id: string) => {
    onChange({
      ...structure,
      members: structure.members.filter((m) => m.id !== id),
    });
  };

  // Move Member Left / Right
  const handleMoveMember = (index: number, direction: 'left' | 'right') => {
    const newMembers = [...structure.members];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMembers.length) return;

    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    onChange({
      ...structure,
      members: newMembers,
    });
  };

  // Trigger file upload for a specific card
  const handleTriggerUpload = (id: string, isLeader: boolean) => {
    targetUploadNodeRef.current = { id, isLeader };
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetUploadNodeRef.current) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const url = reader.result;
        if (targetUploadNodeRef.current?.isLeader) {
          onChange({
            ...structure,
            leader: { ...structure.leader, photoUrl: url },
          });
        } else {
          onChange({
            ...structure,
            members: structure.members.map((m) =>
              m.id === targetUploadNodeRef.current?.id
                ? { ...m, photoUrl: url }
                : m
            ),
          });
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save from node modal
  const handleSaveNode = (updated: OrgChartPersonNode) => {
    if (editingNode?.isLeader) {
      onChange({
        ...structure,
        leader: updated,
      });
    } else {
      onChange({
        ...structure,
        members: structure.members.map((m) =>
          m.id === updated.id ? updated : m
        ),
      });
    }
  };

  const memberCount = structure.members.length;
  const isEditing = !readOnly && !previewMode;

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/70 rounded-2xl border border-slate-200/80 overflow-hidden">
      {/* Hidden file input for fast 1-click photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 bg-white border-b border-slate-200/70 text-xs">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <span className="text-[11px] font-bold text-slate-500 px-2">
              ແມ່ແບບ:
            </span>
            <button
              type="button"
              onClick={() => handleSelectTemplate('board')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition cursor-pointer',
                activeTemplate === 'board'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              ສະພາຜູ້ບໍລິຫານ ຟຟລ
            </button>
            <button
              type="button"
              onClick={() => handleSelectTemplate('executive')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition cursor-pointer',
                activeTemplate === 'executive'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              ຄະນະຜູ້ອຳນວຍການ
            </button>
            <button
              type="button"
              onClick={() => handleSelectTemplate('blank')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition cursor-pointer',
                activeTemplate === 'blank'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              ເລີ່ມຕົ້ນເປົ່າ
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddMember}
              className="h-8 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold gap-1 text-xs cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>ເພີ່ມກຳມະການ ({memberCount})</span>
            </Button>

            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={cn(
                'h-8 px-3 rounded-xl border flex items-center gap-1.5 font-medium transition cursor-pointer text-xs',
                previewMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{previewMode ? 'ໂໝດແກ້ໄຂ' : 'ສະແດງຕົວຢ່າງ'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-0.5 border border-slate-200 rounded-xl bg-white p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="ຫຍໍ້"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-1.5 text-[11px] font-mono text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                title="ຂະໜາດ 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="ຂະຫຍາຍ"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Workspace (Scrollable with pan & zoom) */}
      <div className="flex-1 overflow-auto p-8 flex items-start justify-center min-h-[550px] relative select-none">
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="flex flex-col items-center py-6 px-10 bg-white rounded-3xl shadow-sm border border-slate-200/80 min-w-max"
        >
          {/* 1. Top Header Pill */}
          <div className="relative group mb-6">
            <div className="px-10 py-3 rounded-2xl border-2 border-blue-900 bg-white shadow-xs text-center min-w-[360px]">
              {isEditing ? (
                <div className="space-y-0.5">
                  <input
                    type="text"
                    value={structure.chartTitleLao}
                    onChange={(e) =>
                      onChange({ ...structure, chartTitleLao: e.target.value })
                    }
                    placeholder="ຫົວຂໍ້ໂຄງຮ່າງ (ລາວ)"
                    className="text-lg font-bold text-blue-950 text-center w-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                  <input
                    type="text"
                    value={structure.chartTitleEn}
                    onChange={(e) =>
                      onChange({ ...structure, chartTitleEn: e.target.value })
                    }
                    placeholder="CHART TITLE (EN)"
                    className="text-[11px] font-bold tracking-wider text-blue-600 uppercase text-center w-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-blue-950">
                    {structure.chartTitleLao || 'ປະທານສະພາຜູ້ບໍລິຫານ'}
                  </h2>
                  <p className="text-[11px] font-bold tracking-wider text-blue-600 uppercase mt-0.5">
                    {structure.chartTitleEn || 'CHAIRMAN OF THE BOARD'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 2. Leader Card (Level 1) */}
          <div className="relative flex flex-col items-center">
            <div className="relative w-52 p-3 pb-4 rounded-2xl border-2 border-amber-400/90 bg-white shadow-sm hover:shadow-md transition-all group">
              {/* Photo */}
              <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                {structure.leader.photoUrl ? (
                  <Image
                    src={structure.leader.photoUrl}
                    alt={structure.leader.nameLao}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-300 gap-1">
                    <User className="h-14 w-14" />
                    <span className="text-[10px]">ຍັງບໍ່ມີຮູບ</span>
                  </div>
                )}

                {/* Photo hover action */}
                {isEditing && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                    <button
                      type="button"
                      onClick={() =>
                        handleTriggerUpload(structure.leader.id, true)
                      }
                      className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 shadow-md transition cursor-pointer text-xs font-semibold flex items-center gap-1"
                      title="ປ່ຽນຮູບພາບ"
                    >
                      <Camera className="h-3.5 w-3.5 text-blue-600" />
                      <span>ປ່ຽນຮູບ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingNode({
                          node: structure.leader,
                          isLeader: true,
                        })
                      }
                      className="p-2 rounded-xl bg-white text-slate-800 hover:bg-slate-100 shadow-md transition cursor-pointer"
                      title="ແກ້ໄຂລາຍລະອຽດ"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-amber-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* Names */}
              <div className="mt-2.5 text-center space-y-0.5">
                <p className="font-bold text-blue-950 text-xs truncate">
                  {structure.leader.nameLao || 'ຊື່ປະທານ / ຫົວໜ້າ'}
                </p>
                <p className="font-semibold text-slate-600 text-[10px] truncate">
                  {structure.leader.nameEn || 'Chairman Name'}
                </p>
              </div>
            </div>

            {/* Vertical connector line dropping down from Leader */}
            <div className="w-0.5 h-10 bg-slate-400/80 my-0" />
          </div>

          {/* 3. Horizontal Crossbar & Connecting Lines */}
          {structure.members.length > 0 && (
            <div className="relative w-full flex flex-col items-center">
              {/* Horizontal Crossbar line spanning members */}
              <div
                style={{
                  width: `${Math.max(
                    (structure.members.length - 1) * 200,
                    0
                  )}px`,
                }}
                className="h-0.5 bg-slate-400/80"
              />

              {/* 4. Committee Members (Level 2) Horizontal Row */}
              <div className="flex items-start gap-5 pt-0">
                {structure.members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex flex-col items-center relative group w-48"
                  >
                    {/* Vertical stem from crossbar to member pill */}
                    <div className="w-0.5 h-6 bg-slate-400/80" />

                    {/* Department / Ministry Pill */}
                    <div
                      onClick={() =>
                        isEditing &&
                        setEditingNode({ node: member, isLeader: false })
                      }
                      className={cn(
                        'w-full min-h-[46px] p-1.5 px-2 rounded-xl border border-blue-200 bg-white shadow-2xs flex items-center justify-center text-center transition cursor-pointer',
                        isEditing && 'hover:border-blue-400 hover:bg-blue-50/40'
                      )}
                      title={isEditing ? 'ກົດເພື່ອແກ້ໄຂ' : undefined}
                    >
                      <p className="font-bold text-blue-950 text-[10px] leading-snug line-clamp-2">
                        {member.departmentBadge || 'ກຳມະການ'}
                      </p>
                    </div>

                    {/* Short stem from pill to card */}
                    <div className="w-0.5 h-3 bg-slate-400/80" />

                    {/* Member Card */}
                    <div className="relative w-full p-2.5 pb-3.5 rounded-2xl border-2 border-amber-300/80 bg-white shadow-sm hover:shadow-md transition-all">
                      {/* Photo */}
                      <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {member.photoUrl ? (
                          <Image
                            src={member.photoUrl}
                            alt={member.nameLao}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-slate-300 gap-1">
                            <User className="h-12 w-12" />
                            <span className="text-[10px]">ຍັງບໍ່ມີຮູບ</span>
                          </div>
                        )}

                        {/* Photo hover action */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-2xs">
                            <button
                              type="button"
                              onClick={() =>
                                handleTriggerUpload(member.id, false)
                              }
                              className="p-1.5 rounded-lg bg-white text-slate-800 hover:bg-slate-100 shadow-md transition cursor-pointer text-[11px] font-semibold flex items-center gap-1"
                              title="ປ່ຽນຮູບພາບ"
                            >
                              <Camera className="h-3 w-3 text-blue-600" />
                              <span>ປ່ຽນຮູບ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingNode({ node: member, isLeader: false })
                              }
                              className="p-1.5 rounded-lg bg-white text-slate-800 hover:bg-slate-100 shadow-md transition cursor-pointer"
                              title="ແກ້ໄຂຂໍ້ມູນ"
                            >
                              <Edit2 className="h-3 w-3 text-amber-600" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Member Info */}
                      <div className="mt-2 text-center space-y-0.5">
                        <p className="font-bold text-blue-950 text-[11px] truncate">
                          {member.nameLao}
                        </p>
                        <p className="font-semibold text-slate-500 text-[9px] truncate">
                          {member.nameEn}
                        </p>
                        <div className="pt-1.5 border-t border-slate-100 mt-1">
                          <p className="font-bold text-blue-950 text-xs">
                            {member.roleLao || 'ກຳມະການ'}
                          </p>
                          <p className="text-slate-500 text-[10px]">
                            {member.roleEn || 'Committee'}
                          </p>
                        </div>
                      </div>

                      {/* Card Control Bar on Hover */}
                      {isEditing && (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleMoveMember(index, 'left')}
                            disabled={index === 0}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="ຍ້າຍຊ້າຍ"
                          >
                            <ArrowLeft className="h-2.5 w-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingNode({ node: member, isLeader: false })
                            }
                            className="p-1 rounded-full text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="ແກ້ໄຂ"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1 rounded-full text-rose-500 hover:bg-rose-50 cursor-pointer"
                            title="ລຶບສະມາຊິກນີ້"
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveMember(index, 'right')}
                            disabled={index === structure.members.length - 1}
                            className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="ຍ້າຍຂວາ"
                          >
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add member placeholder column */}
                {isEditing && (
                  <div className="flex flex-col items-center w-36 pt-16">
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="h-44 w-full rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/40 text-slate-400 hover:text-blue-600 flex flex-col items-center justify-center gap-2 transition cursor-pointer group shadow-2xs"
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition">
                        <Plus className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                      </div>
                      <span className="text-[11px] font-bold">
                        ເພີ່ມສະມາຊິກ
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node Edit Modal */}
      {editingNode && (
        <OrgChartNodeEditorModal
          isOpen={Boolean(editingNode)}
          node={editingNode.node}
          isLeader={editingNode.isLeader}
          onClose={() => setEditingNode(null)}
          onSave={handleSaveNode}
        />
      )}
    </div>
  );
}
