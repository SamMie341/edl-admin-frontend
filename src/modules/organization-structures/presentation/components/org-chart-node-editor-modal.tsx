'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Trash2, User, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ORG_CHART_FONT_OPTIONS,
  ORG_CHART_FONT_WEIGHT_OPTIONS,
  type OrgChartFontId,
  type OrgChartFontWeight,
  type OrgChartNodeFontOverride,
  type OrgChartPersonNode,
} from '../../domain/org-chart-designer.types';
import {
  resolveAvatarUrl,
  uploadOrProcessAvatar,
} from '../../application/org-chart-canvas-exporter';
import { toast } from 'sonner';

interface OrgChartNodeEditorModalProps {
  node: OrgChartPersonNode | null;
  isLeader?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: OrgChartPersonNode) => void;
}

export function OrgChartNodeEditorModal({
  node,
  isLeader = false,
  isOpen,
  onClose,
  onSave,
}: OrgChartNodeEditorModalProps) {
  const [nodeType, setNodeType] = useState<'person' | 'badge'>('person');
  const [nameLao, setNameLao] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [roleLao, setRoleLao] = useState('');
  const [roleEn, setRoleEn] = useState('');
  const [departmentBadge, setDepartmentBadge] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [fontOverride, setFontOverride] = useState<OrgChartNodeFontOverride>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isOpen || !node) return;
    setNodeType(node.nodeType === 'badge' ? 'badge' : 'person');
    setNameLao(node.nameLao || '');
    setNameEn(node.nameEn || '');
    setRoleLao(node.roleLao || '');
    setRoleEn(node.roleEn || '');
    setDepartmentBadge(node.departmentBadge || '');
    setPhotoUrl(node.photoUrl);
    setFontOverride(node.fontOverride || {});
  }, [node, isOpen]);

  if (!isOpen || !node) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const photoPath = await uploadOrProcessAvatar(file);
      setPhotoUrl(photoPath);
      toast.success('ອັບໂຫຼດຮູບພາບສຳເລັດ');
    } catch (err) {
      console.warn('Failed to upload avatar photo:', err);
      toast.error('ອັບໂຫຼດຮູບພາບບໍ່ສຳເລັດ');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
  };

  const handleFontOverrideChange = (
    key: keyof OrgChartNodeFontOverride,
    raw: string
  ) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setFontOverride((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setFontOverride((prev) => ({ ...prev, [key]: parsed }));
    }
  };

  const handleSave = () => {
    const cleanedOverride = Object.fromEntries(
      Object.entries(fontOverride).filter(
        ([, val]) =>
          typeof val === 'boolean' ||
          (typeof val === 'number' && val > 0) ||
          (typeof val === 'string' && val.trim().length > 0)
      )
    ) as OrgChartNodeFontOverride;

    onSave({
      ...node,
      nodeType: nodeType === 'badge' ? 'badge' : undefined,
      nameLao: (nodeType === 'badge' ? nameLao || departmentBadge : nameLao)
        .replace(/\r\n/g, '\n')
        .trim(),
      nameEn: nameEn.replace(/\r\n/g, '\n').trim(),
      roleLao: roleLao.replace(/\r\n/g, '\n').trim(),
      roleEn: roleEn.replace(/\r\n/g, '\n').trim(),
      departmentBadge: departmentBadge.replace(/\r\n/g, '\n').trim(),
      photoUrl,
      fontOverride:
        Object.keys(cleanedOverride).length > 0 ? cleanedOverride : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 px-4 sm:p-4 sm:px-6 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {nodeType === 'badge'
                ? 'ແກ້ໄຂປ້າຍ / ໜ່ວຍງານ (ສະເພາະປ້າຍ)'
                : isLeader
                  ? 'ແກ້ໄຂຂໍ້ມູນປະທານ / ຫົວໜ້າ'
                  : 'ແກ້ໄຂຂໍ້ມູນກຳມະການ / ສະມາຊິກ'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {nodeType === 'badge'
                ? 'ສະແດງສະເພາະກ່ອງປ້າຍຂໍ້ຄວາມ (ບໍ່ມີຮູບ ແລະ ຊື່ບຸກຄົນ)'
                : 'ກຳນົດຊື່, ຕຳແໜ່ງ, ໜ່ວຍງານ ແລະ ຮູບພາບຂອງບຸກຄະລາກອນ'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          {/* Node Display Type Switch */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              ຮູບແບບການສະແດງ (Display Type)
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setNodeType('person')}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  nodeType === 'person'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ກາດບຸກຄະລາກອນ (ມີຮູບ + ຊື່)
              </button>
              <button
                type="button"
                onClick={() => setNodeType('badge')}
                className={`py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  nodeType === 'badge'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ສະເພາະປ້າຍ (ບໍ່ມີຮູບ-ຊື່)
              </button>
            </div>
          </div>

          {/* Photo Section */}
          {nodeType === 'person' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຮູບພາບປະກອບ (Portrait Photo)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative h-28 w-24 rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-50 shadow-2xs flex items-center justify-center shrink-0">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1 text-blue-600">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-[10px] font-medium">ກຳລັງອັບໂຫຼດ...</span>
                  </div>
                ) : photoUrl ? (
                  <Image
                    src={resolveAvatarUrl(photoUrl)}
                    alt="Photo"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-slate-300" />
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold cursor-pointer transition shadow-2xs text-xs ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{isUploading ? 'ກຳລັງອັບໂຫຼດ...' : 'ອັບໂຫຼດຮູບພາບໃໝ່'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploading}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {photoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>ລຶບຮູບ</span>
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  ຮອງຮັບໄຟລ໌ JPG, PNG ຂະໜາດແນະນຳ 3:4 ຫຼື ຕັ້ງສາກ
                </p>
              </div>
            </div>
          </div>
          )}

          {/* Department / Ministry badge */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                {nodeType === 'badge'
                  ? 'ຂໍ້ຄວາມໃນປ້າຍ / ຊື່ໜ່ວຍງານ (Badge Text)'
                  : isLeader
                    ? 'ຫົວຂໍ້ກ່ອງສູງສຸດ (Top Banner Title)'
                    : 'ສັງກັດ / ໜ່ວຍງານ / ບ່ອນປະຈຳການ (Department / Ministry)'}
              </label>
              <span className="text-[10px] text-slate-400">
                ກົດ Enter ຂຶ້ນແຖວໃໝ່ໄດ້
              </span>
            </div>
            <textarea
              rows={nodeType === 'badge' ? 3 : 2}
              value={departmentBadge}
              onChange={(e) => setDepartmentBadge(e.target.value)}
              placeholder={
                nodeType === 'badge'
                  ? 'ເຊັ່ນ: ພະແນກເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ (IT Department)'
                  : 'ເຊັ່ນ: ຫົວໜ້າກົມຄຸ້ມຄອງໜີ້ສິນສາທາລະນະ&#10;ກະຊວງການເງິນ'
              }
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 resize-y leading-snug"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <span className="text-[10px] text-slate-500">
                ການລົງແຖວໃນປ້າຍ:
              </span>
              <select
                value={
                  typeof fontOverride.badgeNoAutoWrap === 'boolean'
                    ? fontOverride.badgeNoAutoWrap
                      ? 'strict'
                      : 'wrap'
                    : ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setFontOverride((prev) => {
                    const next = { ...prev };
                    if (val === '') {
                      delete next.badgeNoAutoWrap;
                    } else {
                      next.badgeNoAutoWrap = val === 'strict';
                    }
                    return next;
                  });
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50/80 text-slate-700 font-medium focus:bg-white cursor-pointer"
              >
                <option value="">ຕາມຄ່າຫຼັກຂອງໂຄງຮ່າງ (Auto)</option>
                <option value="strict">ບໍ່ລົງແຖວເອງ (ລົງແຖວສະເພາະກົດ Enter)</option>
                <option value="wrap">ຕັດແຖວອັດຕະໂນມັດຕາມຄວາມກວ້າງ</option>
              </select>
            </div>
          </div>

          {/* Names & Roles (Person cards only) */}
          {nodeType === 'person' && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  ຊື່ ແລະ ນາມສະກຸນ (ພາສາລາວ) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFontOverride((prev) => ({
                        ...prev,
                        nameLaoWeight: prev.nameLaoWeight === 800 ? 700 : 800,
                      }))
                    }
                    className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border transition cursor-pointer ${
                      fontOverride.nameLaoWeight === 800
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="ສະຫຼັບຄວາມໜາພິເສດ (ExtraBold 800) ໃຫ້ຊື່ພາສາລາວ"
                  >
                    B ເຂັ້ມພິເສດ
                  </button>
                  <span className="text-[10px] text-slate-400">Enter ລົງແຖວ</span>
                </div>
              </div>
              <textarea
                rows={2}
                value={nameLao}
                onChange={(e) => setNameLao(e.target.value)}
                placeholder="ເຊັ່ນ: ທ່ານ ວິເລດ&#10;ກິນນາວົງ"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 resize-y leading-snug"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  ຊື່ ແລະ ນາມສະກຸນ (ພາສາອັງກິດ)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFontOverride((prev) => ({
                      ...prev,
                      nameEnWeight: prev.nameEnWeight === 800 ? 700 : 800,
                    }))
                  }
                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border transition cursor-pointer ${
                    fontOverride.nameEnWeight === 800
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="ສະຫຼັບຄວາມໜາພິເສດ (ExtraBold 800) ໃຫ້ຊື່ພາສາອັງກິດ"
                >
                  B ເຂັ້ມພິເສດ
                </button>
              </div>
              <textarea
                rows={2}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="ເຊັ່ນ: Mr. Vileth&#10;KINNAVONG"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 resize-y leading-snug"
              />
            </div>
          </div>

          {/* Role / Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຕຳແໜ່ງ (ພາສາລາວ)
              </label>
              <textarea
                rows={2}
                value={roleLao}
                onChange={(e) => setRoleLao(e.target.value)}
                placeholder="ເຊັ່ນ: ກຳມະການ, ຮອງປະທານ..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 resize-y leading-snug"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຕຳແໜ່ງ (ພາສາອັງກິດ)
              </label>
              <textarea
                rows={2}
                value={roleEn}
                onChange={(e) => setRoleEn(e.target.value)}
                placeholder="ເຊັ່ນ: Committee, Vice Chairman..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 resize-y leading-snug"
              />
            </div>
          </div>
          </>
          )}

          {/* Per-node optional font size override */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                ຟ້ອນ & ຂະໜາດຕົວອັກສອນສະເພາະກາດນີ້ (ວ່າງໄວ້ = ໃຊ້ຄ່າຫຼັກ)
              </span>
              {Object.keys(fontOverride).length > 0 && (
                <button
                  type="button"
                  onClick={() => setFontOverride({})}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>ໃຊ້ຄ່າຫຼັກ</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-slate-500">
                ຮູບແບບຟ້ອນ (Font Family)
              </label>
              <select
                value={fontOverride.fontFamily ?? ''}
                onChange={(e) => {
                  const val = e.target.value as OrgChartFontId | '';
                  setFontOverride((prev) => {
                    const next = { ...prev };
                    if (!val) {
                      delete next.fontFamily;
                    } else {
                      next.fontFamily = val;
                    }
                    return next;
                  });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white cursor-pointer"
              >
                <option value="">ໃຊ້ຕາມຟ້ອນຫຼັກຂອງໂຄງຮ່າງ (Auto)</option>
                {ORG_CHART_FONT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} — {opt.sublabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">
                  ປ້າຍສັງກັດ
                </label>
                <input
                  type="number"
                  min={7}
                  max={18}
                  step={0.5}
                  value={fontOverride.badgeFontSize ?? ''}
                  onChange={(e) =>
                    handleFontOverrideChange('badgeFontSize', e.target.value)
                  }
                  placeholder="Auto"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white"
                />
              </div>
              {nodeType === 'person' && (
              <>
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">
                  ຊື່ (ລາວ)
                </label>
                <input
                  type="number"
                  min={8}
                  max={20}
                  step={0.5}
                  value={fontOverride.nameLaoSize ?? ''}
                  onChange={(e) =>
                    handleFontOverrideChange('nameLaoSize', e.target.value)
                  }
                  placeholder="Auto"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">
                  ຊື່ (EN)
                </label>
                <input
                  type="number"
                  min={7}
                  max={16}
                  step={0.5}
                  value={fontOverride.nameEnSize ?? ''}
                  onChange={(e) =>
                    handleFontOverrideChange('nameEnSize', e.target.value)
                  }
                  placeholder="Auto"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">
                  ຕຳແໜ່ງ (ລາວ)
                </label>
                <input
                  type="number"
                  min={8}
                  max={20}
                  step={0.5}
                  value={fontOverride.roleLaoSize ?? ''}
                  onChange={(e) =>
                    handleFontOverrideChange('roleLaoSize', e.target.value)
                  }
                  placeholder="Auto"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-slate-500">
                  ຕຳແໜ່ງ (EN)
                </label>
                <input
                  type="number"
                  min={7}
                  max={16}
                  step={0.5}
                  value={fontOverride.roleEnSize ?? ''}
                  onChange={(e) =>
                    handleFontOverrideChange('roleEnSize', e.target.value)
                  }
                  placeholder="Auto"
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white"
                />
              </div>
              </>
              )}
            </div>

            {/* Per-node optional font weight override */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {(
                nodeType === 'badge'
                  ? ([{ key: 'badgeWeight', label: 'ຄວາມໜາປ້າຍ' }] as const)
                  : ([
                      { key: 'badgeWeight', label: 'ຄວາມໜາປ້າຍ' },
                      { key: 'nameLaoWeight', label: 'ຄວາມໜາຊື່ (ລາວ)' },
                      { key: 'nameEnWeight', label: 'ຄວາມໜາຊື່ (EN)' },
                      { key: 'roleLaoWeight', label: 'ຄວາມໜາຕຳແໜ່ງ' },
                      { key: 'roleEnWeight', label: 'ຄວາມໜາ EN' },
                    ] as const)
              ).map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-500">
                    {label}
                  </label>
                  <select
                    value={fontOverride[key] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFontOverride((prev) => {
                        const next = { ...prev };
                        if (!val) {
                          delete next[key];
                        } else {
                          next[key] = Number(val) as OrgChartFontWeight;
                        }
                        return next;
                      });
                    }}
                    className="w-full px-2 py-1.5 text-[11px] rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white cursor-pointer"
                  >
                    <option value="">ຕາມຄ່າຫຼັກ</option>
                    {ORG_CHART_FONT_WEIGHT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-3 rounded-xl text-xs cursor-pointer"
          >
            ຍົກເລີກ
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs cursor-pointer font-semibold"
          >
            ບັນທຶກການແກ້ໄຂ
          </Button>
        </div>
      </div>
    </div>
  );
}
