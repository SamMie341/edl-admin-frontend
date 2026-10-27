'use client';

import React, { useState, useEffect } from 'react';
import { FormModal, FileUploader } from '@/core/presentation/components/shared';
import { MapCoordinatePicker } from '@/modules/branches/presentation/components/map-coordinate-picker';
import {
  useCreateServiceCenter,
  useUpdateServiceCenter,
  useUploadServiceCenterImage,
  useProvinces,
  useDistricts,
  useVillages,
} from '../../application/use-service-centers.hook';
import { useBranchesDropdown } from '@/modules/branches/application/use-branches.hook';
import { useDepartments } from '@/modules/departments/application/use-departments.hook';
import type {
  ServiceCenterItem,
  ServiceCenterStatus,
} from '../../domain/service-center.types';

interface ServiceCenterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  center?: ServiceCenterItem | null;
  defaultProvinceId?: number;
}

export function ServiceCenterFormModal({
  isOpen,
  onClose,
  center,
  defaultProvinceId,
}: ServiceCenterFormModalProps) {
  const isEdit = Boolean(center);

  // Queries
  const { data: departments = [] } = useDepartments();
  const { data: branches = [] } = useBranchesDropdown();
  const { data: provinces = [] } = useProvinces();

  const createMutation = useCreateServiceCenter();
  const updateMutation = useUpdateServiceCenter();
  const uploadImageMutation = useUploadServiceCenterImage();

  // Form states
  const [centerName, setCenterName] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [branchId, setBranchId] = useState<number | ''>('');
  const [provinceId, setProvinceId] = useState<number | ''>('');
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [villageId, setVillageId] = useState<number | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [status, setStatus] = useState<ServiceCenterStatus>('ACTIVE');
  const [imageFile, setImageFile] = useState<File | string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cascading location queries
  const { data: districts = [] } = useDistricts(
    typeof provinceId === 'number' ? provinceId : undefined
  );
  const { data: villages = [] } = useVillages(
    typeof districtId === 'number' ? districtId : undefined
  );

  useEffect(() => {
    if (!isOpen) return;

    if (center) {
      setCenterName(center.centerName || '');
      setDepartmentId(center.departmentId || '');
      setBranchId(center.branchId || '');
      setProvinceId(center.provinceId || '');
      setDistrictId(center.districtId || '');
      setVillageId(center.villageId || '');
      setPhoneNumber(center.phoneNumber || '');

      if (center.latitude && center.longitude) {
        setCoordinates(`${center.latitude}, ${center.longitude}`);
      } else {
        setCoordinates('');
      }

      setStatus(center.status || 'ACTIVE');
      setImageFile(center.imageUrl || null);
    } else {
      setCenterName('');
      setDepartmentId(departments[0]?.id ?? '');
      setBranchId(branches[0]?.id ?? '');
      setProvinceId(defaultProvinceId || provinces[0]?.id || '');
      setDistrictId('');
      setVillageId('');
      setPhoneNumber('');
      setCoordinates('');
      setStatus('ACTIVE');
      setImageFile(null);
    }
    setErrors({});
  }, [center, isOpen, defaultProvinceId]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!centerName.trim()) newErrors.centerName = 'ກະລຸນາປ້ອນຊື່ສູນບໍລິການ';
    if (!provinceId) newErrors.provinceId = 'ກະລຸນາເລືອກແຂວງ';
    if (!districtId) newErrors.districtId = 'ກະລຸນາເລືອກເມືອງ';
    if (!villageId) newErrors.villageId = 'ກະລຸນາເລືອກບ້ານ';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let lat: number | undefined;
    let lng: number | undefined;
    if (coordinates && coordinates.includes(',')) {
      const parts = coordinates.split(',').map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        lat = parts[0];
        lng = parts[1];
      }
    }

    try {
      let savedCenterId = center?.id;

      const payload = {
        centerName: centerName.trim(),
        departmentId: departmentId ? Number(departmentId) : undefined,
        branchId: branchId ? Number(branchId) : undefined,
        provinceId: Number(provinceId),
        districtId: Number(districtId),
        villageId: Number(villageId),
        phoneNumber: phoneNumber.trim() || undefined,
        latitude: lat,
        longitude: lng,
        status,
      };

      if (isEdit && center) {
        await updateMutation.mutateAsync({
          id: center.id,
          payload,
        });
      } else {
        const created = await createMutation.mutateAsync(payload);
        savedCenterId = created.id;
      }

      // Upload image if a new File was selected
      if (savedCenterId && imageFile instanceof File) {
        await uploadImageMutation.mutateAsync({
          id: savedCenterId,
          file: imageFile,
        });
      }

      onClose();
    } catch {
      // Handled by hook
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
      title={isEdit ? 'ແກ້ໄຂສູນບໍລິການ' : 'ເພີ່ມສູນບໍລິການໃໝ່'}
      description="ຄຸ້ມຄອງຂໍ້ມູນສູນບໍລິການລູກຄ້າ ຟຟລ, ທີ່ຕັ້ງ ແລະ ພິກັດແຜນທີ່"
      size="xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງສູນບໍລິການ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            1. ຂໍ້ມູນທົ່ວໄປ
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Center Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຊື່ສູນບໍລິການ (Service Center Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={centerName}
                onChange={(e) => {
                  setCenterName(e.target.value);
                  if (errors.centerName) setErrors((prev) => ({ ...prev, centerName: '' }));
                }}
                placeholder="ຕົວຢ່າງ: ສູນບໍລິການລູກຄ້າ ເມືອງຈັນທະບູລີ"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
              />
              {errors.centerName && (
                <p className="text-xs font-medium text-rose-500">{errors.centerName}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຝ່າຍຕົ້ນສັງກັດ
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- ເລືອກຝ່າຍ --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ສາຂາຕົ້ນສັງກັດ
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- ເລືອກສາຂາ --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ເບີໂທຕິດຕໍ່ສູນບໍລິການ
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="021 123456"
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location Cascading Dropdowns */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            2. ທີ່ຕັ້ງ (ແຂວງ / ເມືອງ / ບ້ານ)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Province */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ແຂວງ <span className="text-rose-500">*</span>
              </label>
              <select
                value={provinceId}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProvinceId(val);
                  setDistrictId('');
                  setVillageId('');
                  if (errors.provinceId) setErrors((prev) => ({ ...prev, provinceId: '' }));
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- ເລືອກແຂວງ --</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.provinceId && (
                <p className="text-xs font-medium text-rose-500">{errors.provinceId}</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ເມືອງ <span className="text-rose-500">*</span>
              </label>
              <select
                value={districtId}
                disabled={!provinceId}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDistrictId(val);
                  setVillageId('');
                  if (errors.districtId) setErrors((prev) => ({ ...prev, districtId: '' }));
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- ເລືອກເມືອງ --</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.districtId && (
                <p className="text-xs font-medium text-rose-500">{errors.districtId}</p>
              )}
            </div>

            {/* Village */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ບ້ານ <span className="text-rose-500">*</span>
              </label>
              <select
                value={villageId}
                disabled={!districtId}
                onChange={(e) => {
                  setVillageId(Number(e.target.value));
                  if (errors.villageId) setErrors((prev) => ({ ...prev, villageId: '' }));
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- ເລືອກບ້ານ --</option>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              {errors.villageId && (
                <p className="text-xs font-medium text-rose-500">{errors.villageId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: GPS Coordinates */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            3. ພິກັດແຜນທີ່ GPS
          </h4>
          <MapCoordinatePicker value={coordinates} onChange={setCoordinates} />
        </div>

        {/* Section 4: Image & Status */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 border-b border-slate-100 pb-1.5">
            4. ຮູບພາບ ແລະ ສະຖານະ
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FileUploader
              type="image"
              label="ຮູບພາບສູນບໍລິການ"
              value={imageFile}
              onChange={setImageFile}
              helperText="ຮູບອາຄານ ຫຼື ຫ້ອງການສູນບໍລິການ"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ສະຖານະການໃຫ້ບໍລິການ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceCenterStatus)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="ACTIVE">ເປີດບໍລິການປົກກະຕິ (Active)</option>
                <option value="INACTIVE">ປິດບໍລິການ (Inactive)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
