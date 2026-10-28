'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Trash2, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OrgChartPersonNode } from '../../domain/org-chart-designer.types';
import { compressAvatarImage } from '../../application/org-chart-canvas-exporter';

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
  const [nameLao, setNameLao] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [roleLao, setRoleLao] = useState('');
  const [roleEn, setRoleEn] = useState('');
  const [departmentBadge, setDepartmentBadge] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isOpen || !node) return;
    setNameLao(node.nameLao || '');
    setNameEn(node.nameEn || '');
    setRoleLao(node.roleLao || '');
    setRoleEn(node.roleEn || '');
    setDepartmentBadge(node.departmentBadge || '');
    setPhotoUrl(node.photoUrl);
  }, [node, isOpen]);

  if (!isOpen || !node) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressAvatarImage(file);
      setPhotoUrl(compressed);
    } catch (err) {
      console.warn('Failed to compress avatar photo:', err);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(undefined);
  };

  const handleSave = () => {
    onSave({
      ...node,
      nameLao: nameLao.trim(),
      nameEn: nameEn.trim(),
      roleLao: roleLao.trim(),
      roleEn: roleEn.trim(),
      departmentBadge: departmentBadge.trim(),
      photoUrl,
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
              {isLeader ? 'ແກ້ໄຂຂໍ້ມູນປະທານ / ຫົວໜ້າ' : 'ແກ້ໄຂຂໍ້ມູນກຳມະການ / ສະມາຊິກ'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              ກຳນົດຊື່, ຕຳແໜ່ງ, ໜ່ວຍງານ ແລະ ຮູບພາບຂອງບຸກຄະລາກອນ
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
          {/* Photo Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຮູບພາບປະກອບ (Portrait Photo)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative h-28 w-24 rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-50 shadow-2xs flex items-center justify-center shrink-0">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
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
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold cursor-pointer transition shadow-2xs text-xs">
                    <Upload className="h-3.5 w-3.5" />
                    <span>ອັບໂຫຼດຮູບພາບໃໝ່</span>
                    <input
                      type="file"
                      accept="image/*"
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

          {/* Department / Ministry badge */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              {isLeader
                ? 'ຫົວຂໍ້ກ່ອງສູງສຸດ (Top Banner Title)'
                : 'ສັງກັດ / ໜ່ວຍງານ / ບ່ອນປະຈຳການ (Department / Ministry)'}
            </label>
            <input
              type="text"
              value={departmentBadge}
              onChange={(e) => setDepartmentBadge(e.target.value)}
              placeholder="ເຊັ່ນ: ຫົວໜ້າກົມຄຸ້ມຄອງໜີ້ສິນສາທາລະນະ ກະຊວງການເງິນ"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຊື່ ແລະ ນາມສະກຸນ (ພາສາລາວ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nameLao}
                onChange={(e) => setNameLao(e.target.value)}
                placeholder="ເຊັ່ນ: ທ່ານ ວິເລດ ກິນນາວົງ"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຊື່ ແລະ ນາມສະກຸນ (ພາສາອັງກິດ)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="ເຊັ່ນ: Mr.Vileth KINNAVONG"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role / Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຕຳແໜ່ງ (ພາສາລາວ)
              </label>
              <input
                type="text"
                value={roleLao}
                onChange={(e) => setRoleLao(e.target.value)}
                placeholder="ເຊັ່ນ: ກຳມະການ, ຮອງປະທານ..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຕຳແໜ່ງ (ພາສາອັງກິດ)
              </label>
              <input
                type="text"
                value={roleEn}
                onChange={(e) => setRoleEn(e.target.value)}
                placeholder="ເຊັ່ນ: Committee, Vice Chairman..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
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
