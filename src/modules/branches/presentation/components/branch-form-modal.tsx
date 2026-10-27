'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FileUploader, RichTextEditor } from '@/core/presentation/components/shared';
import { MapCoordinatePicker } from './map-coordinate-picker';
import {
  useCreateBranch,
  useUpdateBranch,
  useUploadBranchImage,
} from '../../application/use-branches.hook';
import { useDepartments } from '@/modules/departments/application/use-departments.hook';
import type { BranchItem, BranchStatus } from '../../domain/branch.types';

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: BranchItem | null;
  defaultDepartmentId?: number;
}

export function BranchFormModal({
  isOpen,
  onClose,
  branch,
  defaultDepartmentId,
}: BranchFormModalProps) {
  const isEdit = Boolean(branch);

  const { data: departments = [] } = useDepartments();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const uploadImageMutation = useUploadBranchImage();

  // Form states
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [locationCoordinates, setLocationCoordinates] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [roleResponsibilities, setRoleResponsibilities] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(0);
  const [status, setStatus] = useState<BranchStatus>('ACTIVE');

  // File states (File objects for new uploads, or string for existing)
  const [branchImageFile, setBranchImageFile] = useState<File | string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | string | null>(null);
  const [orgChartImageFile, setOrgChartImageFile] = useState<File | string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (branch) {
      const rawCoords = branch.locationCoordinates?.trim() || '';
      const isPlaceholder = /^[.\-_*#\s]+$/.test(rawCoords);

      setDepartmentId(branch.departmentId);
      setBranchName(branch.branchName || '');
      setAddress(branch.address || '');
      setLocationCoordinates(isPlaceholder ? '' : rawCoords);
      setEmail(branch.email || '');
      setPhoneNumber(branch.phoneNumber || '');
      setRoleResponsibilities(branch.roleResponsibilities || '');
      setOrderIndex(branch.orderIndex || 0);
      setStatus(branch.status || 'ACTIVE');

      setBranchImageFile(branch.branchImage || null);
      setCoverImageFile(branch.coverImage || null);
      setOrgChartImageFile(branch.orgChartImage || null);
    } else {
      setDepartmentId(defaultDepartmentId || (departments?.[0]?.id ?? ''));
      setBranchName('');
      setAddress('');
      setLocationCoordinates('');
      setEmail('');
      setPhoneNumber('');
      setRoleResponsibilities('');
      setOrderIndex(0);
      setStatus('ACTIVE');

      setBranchImageFile(null);
      setCoverImageFile(null);
      setOrgChartImageFile(null);
    }
    setErrors({});
  }, [branch, isOpen, defaultDepartmentId]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!departmentId) newErrors.departmentId = 'ກະລຸນາເລືອກຝ່າຍຕົ້ນສັງກັດ';
    if (!branchName.trim()) newErrors.branchName = 'ກະລຸນາປ້ອນຊື່ສາຂາ';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let savedBranchId = branch?.id;

      const payload = {
        departmentId: Number(departmentId),
        branchName: branchName.trim(),
        address: address.trim() || undefined,
        locationCoordinates: locationCoordinates.trim() || undefined,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        roleResponsibilities: roleResponsibilities.trim() || undefined,
        orderIndex: Number(orderIndex) || 0,
        status,
      };

      if (isEdit && branch) {
        await updateMutation.mutateAsync({
          id: branch.id,
          payload,
        });
      } else {
        const created = await createMutation.mutateAsync(payload);
        savedBranchId = created.id;
      }

      // Upload images if new File instances were provided
      if (savedBranchId) {
        if (branchImageFile instanceof File) {
          await uploadImageMutation.mutateAsync({
            id: savedBranchId,
            imageType: 'branchImage',
            file: branchImageFile,
          });
        }
        if (coverImageFile instanceof File) {
          await uploadImageMutation.mutateAsync({
            id: savedBranchId,
            imageType: 'coverImage',
            file: coverImageFile,
          });
        }
        if (orgChartImageFile instanceof File) {
          await uploadImageMutation.mutateAsync({
            id: savedBranchId,
            imageType: 'orgChartImage',
            file: orgChartImageFile,
          });
        }
      }

      onClose();
    } catch {
      // Handled by hook toasts
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂຂໍ້ມູນສາຂາ' : 'ສ້າງຂໍ້ມູນສາຂາໃໝ່'}
      description="ຄຸ້ມຄອງຂໍ້ມູນສາຂາ ຟຟລ, ພິກັດແຜນທີ່ ແລະ ຮູບພາບປະກອບ"
      size="xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງສາຂາໃໝ່'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            1. ຂໍ້ມູນທົ່ວໄປ
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຝ່າຍຕົ້ນສັງກັດ <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(Number(e.target.value));
                  if (errors.departmentId) setErrors((prev) => ({ ...prev, departmentId: '' }));
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- ເລືອກຝ່າຍ --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="text-xs font-medium text-rose-500">{errors.departmentId}</p>
              )}
            </div>

            {/* Branch Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຊື່ສາຂາ (Branch Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => {
                  setBranchName(e.target.value);
                  if (errors.branchName) setErrors((prev) => ({ ...prev, branchName: '' }));
                }}
                placeholder="ຕົວຢ່າງ: ຟຟລ ສາຂາ ນະຄອນຫຼວງວຽງຈັນ"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
              />
              {errors.branchName && (
                <p className="text-xs font-medium text-rose-500">{errors.branchName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ເບີໂທຕິດຕໍ່
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="021 123456"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ອີເມວຕິດຕໍ່
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="branch@edl.com.la"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ທີ່ຢູ່ຕັ້ງຂອງສາຂາ
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ບ້ານ, ເມືອງ, ແຂວງ..."
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 2: Location Map Coordinates */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            2. ພິກັດແຜນທີ່ GPS (Location Coordinates)
          </h4>
          <MapCoordinatePicker
            value={locationCoordinates}
            onChange={setLocationCoordinates}
          />
        </div>

        {/* Section 3: Branch Media Images */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            3. ຮູບພາບປະກອບສາຂາ
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUploader
              type="image"
              label="ຮູບສາຂາ (Branch Image)"
              value={branchImageFile}
              onChange={setBranchImageFile}
              helperText="ຮູບອາຄານ ຫຼື ສາຂາ"
            />

            <FileUploader
              type="image"
              label="ຮູບໜ້າປົກ (Cover Image)"
              value={coverImageFile}
              onChange={setCoverImageFile}
              helperText="ຮູບ Banner ໜ້າປົກ"
            />

            <FileUploader
              type="image"
              label="ຮູບໂຄງຮ່າງ (Org Chart)"
              value={orgChartImageFile}
              onChange={setOrgChartImageFile}
              helperText="ແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງ"
            />
          </div>
        </div>

        {/* Section 4: Role & Responsibilities & Status */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            4. ສະຖານະ ແລະ ລາຍລະອຽດ
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ສະຖານະການໃຫ້ບໍລິການ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BranchStatus)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="ACTIVE">ເປີດບໍລິການປົກກະຕິ (Active)</option>
                <option value="INACTIVE">ປິດບໍລິການ (Inactive)</option>
                <option value="UNDER_MAINTENANCE">ພວມປັບປຸງ (Under Maintenance)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ລຳດັບການສະແດງຜົນ (Order Index)
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ພາລະບົດບາດ ແລະ ໜ້າທີ່ (Role & Responsibilities)
            </label>
            <RichTextEditor
              value={roleResponsibilities}
              onChange={setRoleResponsibilities}
              placeholder="ອະທິບາຍພາລະບົດບາດ ແລະ ໜ້າທີ່ຂອງສາຂາ (ຮອງຮັບໂຕເຂັ້ມ, ຫົວຂໍ້, ລາຍການຈຸດ, ຂໍ້ຄວາມອ້າງອີງ...)"
              minHeight="150px"
            />
          </div>
        </div>
      </div>
    </FormModal>
  );
}
