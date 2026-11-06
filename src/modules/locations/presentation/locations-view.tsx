'use client';

import React, { useState } from 'react';
import {
  Map,
  MapPin,
  Building2,
  Home,
  Layers,
  Database,
  CheckCircle2,
} from 'lucide-react';
import {
  useProvinces,
  useDistricts,
} from '../application/use-locations.hook';
import { ProvinceTab } from './components/province-tab';
import { DistrictTab } from './components/district-tab';
import { VillageTab } from './components/village-tab';
import type { LocationTabType } from '../domain/location.types';
import { cn } from '@/lib/utils';

export function LocationsView() {
  const [activeTab, setActiveTab] = useState<LocationTabType>('provinces');

  // Shared drill-down filters across tabs
  const [drillDownProvinceId, setDrillDownProvinceId] = useState<number | undefined>(
    undefined
  );
  const [drillDownDistrictId, setDrillDownDistrictId] = useState<number | undefined>(
    undefined
  );

  // Overall counts for stat summary
  const { data: provinces = [] } = useProvinces();
  const { data: allDistricts = [] } = useDistricts();

  // Navigation handlers from child tabs
  const handleViewDistricts = (provinceId: number) => {
    setDrillDownProvinceId(provinceId);
    setActiveTab('districts');
  };

  const handleViewVillages = (districtId: number, provinceId?: number) => {
    if (provinceId) setDrillDownProvinceId(provinceId);
    setDrillDownDistrictId(districtId);
    setActiveTab('villages');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Map className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs font-semibold">
              <Database className="h-3.5 w-3.5 text-blue-300" />
              <span>HRM Central Geographic Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              ຂໍ້ມູນແຂວງ / ເມືອງ / ບ້ານ (Locations)
            </h1>
            <p className="text-sm text-blue-100/80 leading-relaxed font-light">
              ລະບົບບໍລິຫານ ແລະ ກວດສອບຂໍ້ມູນພູມສາດ ແຂວງ, ເມືອງ, ບ້ານ ທົ່ວປະເທດລາວ
              ເຊື່ອມໂຍງກັບຖານຂໍ້ມູນກາງ HRM ຂອງລັດວິສາຫະກິດໄຟຟ້າລາວ.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[110px] text-center">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 block">
                ແຂວງທັງໝົດ
              </span>
              <span className="text-2xl font-black text-white">
                {provinces.length || 18}
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[110px] text-center">
              <span className="text-[11px] uppercase tracking-wider text-indigo-200 block">
                ເມືອງທັງໝົດ
              </span>
              <span className="text-2xl font-black text-white">
                {allDistricts.length || '148+'}
              </span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[110px] text-center">
              <span className="text-[11px] uppercase tracking-wider text-emerald-200 block">
                ບ້ານທົ່ວປະເທດ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Modern Tab Segmented Control */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('provinces')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer',
            activeTab === 'provinces'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          )}
        >
          <MapPin className="h-4 w-4" />
          <span>1. ລາຍການແຂວງ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('districts')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer',
            activeTab === 'districts'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>2. ລາຍການເມືອງ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('villages')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer',
            activeTab === 'villages'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          )}
        >
          <Home className="h-4 w-4" />
          <span>3. ລາຍການບ້ານ</span>
        </button>
      </div>

      {/* 3. Active Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === 'provinces' && (
          <ProvinceTab onViewDistricts={handleViewDistricts} />
        )}

        {activeTab === 'districts' && (
          <DistrictTab
            selectedProvinceId={drillDownProvinceId}
            onProvinceChange={setDrillDownProvinceId}
            onViewVillages={handleViewVillages}
          />
        )}

        {activeTab === 'villages' && (
          <VillageTab
            initialProvinceId={drillDownProvinceId}
            initialDistrictId={drillDownDistrictId}
          />
        )}
      </div>
    </div>
  );
}
