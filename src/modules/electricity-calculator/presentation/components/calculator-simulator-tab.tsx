'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Calculator,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  DollarSign,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import {
  useCalculatorConfig,
  useCalculateBill,
  useTariffCategories,
} from '../../application/use-electricity-calculator.hook';
import type {
  ApplianceCalculationInput,
  CalculateBillResponse,
} from '../../domain/electricity-calculator.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function CalculatorSimulatorTab() {
  const { data: config, isLoading: isConfigLoading } = useCalculatorConfig();
  const { data: tariffCategories = [] } = useTariffCategories();
  const calculateMutation = useCalculateBill();

  // Mode: 'appliances' | 'direct'
  const [calcMode, setCalcMode] = useState<'appliances' | 'direct'>('appliances');
  const [selectedTariffCategory, setSelectedTariffCategory] = useState<number | undefined>(undefined);
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(11);
  const [directMonthlyKwh, setDirectMonthlyKwh] = useState<number>(350);
  const [maintenanceFeeKip, setMaintenanceFeeKip] = useState<number>(5000);

  // Appliances list
  const [appliances, setAppliances] = useState<ApplianceCalculationInput[]>([]);
  // Selected saving action template IDs
  const [selectedActions, setSelectedActions] = useState<number[]>([]);

  // Calculation result
  const [result, setResult] = useState<CalculateBillResponse | null>(null);

  // Load sample appliances, default category, and default maintenance fee when config arrives
  useEffect(() => {
    if (!selectedTariffCategory && tariffCategories.length > 0) {
      setSelectedTariffCategory(tariffCategories[0].id);
    }
    if (config?.sampleAppliances && appliances.length === 0) {
      setAppliances(config.sampleAppliances);
    }
    if (config?.defaultSchedule?.maintenanceFeeKip != null) {
      setMaintenanceFeeKip(Number(config.defaultSchedule.maintenanceFeeKip));
    } else if (config?.defaultSchedule?.notice?.maintenanceFeeKip != null) {
      setMaintenanceFeeKip(Number(config.defaultSchedule.notice.maintenanceFeeKip));
    }
  }, [config, appliances.length, tariffCategories, selectedTariffCategory]);

  const handleAddAppliance = () => {
    const firstCat = config?.categories?.[0];
    const firstPreset = firstCat?.presets?.[0];

    setAppliances((prev) => [
      ...prev,
      {
        categoryId: firstCat?.id,
        presetId: firstPreset?.id,
        customName: firstPreset?.nameLa || 'ເຄື່ອງໃຊ້ໄຟຟ້າໃໝ່',
        watt: firstPreset?.defaultWatt || 500,
        quantity: 1,
        hoursPerDay: firstPreset?.defaultHoursPerDay || 4,
        daysPerMonth: 30,
      },
    ]);
  };

  const handleRemoveAppliance = (index: number) => {
    setAppliances((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApplianceChange = (
    index: number,
    field: keyof ApplianceCalculationInput,
    value: any
  ) => {
    setAppliances((prev) =>
      prev.map((app, i) => (i === index ? { ...app, [field]: value } : app))
    );
  };

  const handleCategorySelect = (index: number, catId: number) => {
    const category = config?.categories?.find((c) => c.id === catId);
    const firstPreset = category?.presets?.[0];

    setAppliances((prev) =>
      prev.map((app, i) => {
        if (i !== index) return app;
        return {
          ...app,
          categoryId: catId,
          presetId: firstPreset?.id,
          customName: firstPreset?.nameLa || category?.nameLa || 'ເຄື່ອງໃຊ້ໄຟຟ້າ',
          watt: firstPreset?.defaultWatt || app.watt,
          hoursPerDay: firstPreset?.defaultHoursPerDay || app.hoursPerDay,
        };
      })
    );
  };

  const handlePresetSelect = (index: number, presetId: number) => {
    const cat = config?.categories?.find(
      (c) => c.id === appliances[index]?.categoryId
    );
    const preset = cat?.presets?.find((p) => p.id === presetId);

    if (preset) {
      setAppliances((prev) =>
        prev.map((app, i) => {
          if (i !== index) return app;
          return {
            ...app,
            presetId: preset.id,
            customName: preset.nameLa,
            watt: preset.defaultWatt,
            quantity: preset.defaultQuantity || 1,
            hoursPerDay: Number(preset.defaultHoursPerDay) || 8,
            daysPerMonth: preset.defaultDaysPerMonth || 30,
          };
        })
      );
    }
  };

  const handleToggleAction = (actionId: number) => {
    setSelectedActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleLoadDefaults = () => {
    if (config?.sampleAppliances) {
      setAppliances(config.sampleAppliances);
      setSelectedActions([]);
    }
  };

  const handleRunCalculation = async () => {
    const payload = {
      year,
      month,
      categoryId: selectedTariffCategory,
      maintenanceFeeKip: Number(maintenanceFeeKip) || 0,
      ...(calcMode === 'direct'
        ? { directMonthlyKwh: Number(directMonthlyKwh) }
        : { appliances }),
      selectedActionIds:
        selectedActions.length > 0 ? selectedActions : undefined,
    };

    try {
      const res = await calculateMutation.mutateAsync(payload);
      setResult(res);
    } catch {
      // Toast handled by hook
    }
  };

  // Collect all action templates from categories
  const allActionTemplates =
    config?.categories?.flatMap((c) =>
      c.actionTemplates.map((t) => ({ ...t, categoryNameLa: c.nameLa }))
    ) || [];

  const formatNumber = (num?: number | null) => {
    if (num == null) return '0';
    return Math.round(num).toLocaleString('en-US');
  };

  return (
    <div className="space-y-6">
      {/* Simulation Setup Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>ເຄື່ອງມືຈຳລອງການຄິດໄລ່ຄ່າໄຟຟ້າ & ແຜນປະຢັດໄຟ (Simulator Engine)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ທົດສອບສູດການຄິດໄລ່ 8 ຂັ້ນບັນໄດ, ສ່ວນຫຼຸດລະດູຮ້ອນ, ອາກອນ VAT 10% ແລະ ແນວໂນ້ມຄ່າໄຟ 2026–2029
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>ໂຫຼດຄ່າຕົວຢ່າງ (Defaults)</span>
            </button>
            <Button
              type="button"
              onClick={handleRunCalculation}
              disabled={calculateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs px-4 cursor-pointer"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              {calculateMutation.isPending ? 'ກຳລັງຄິດໄລ່...' : 'ຄິດໄລ່ຄ່າໄຟ (Run Calculation)'}
            </Button>
          </div>
        </div>

        {/* Tariff Category, Year, Month, Maintenance Fee & Mode Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-center">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              ປະເພດອັດຕາຄ່າໄຟ
            </label>
            <select
              value={selectedTariffCategory ?? ''}
              onChange={(e) => setSelectedTariffCategory(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            >
              {tariffCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameLa} {cat.voltageLevel ? ` [${cat.voltageLevel}]` : ''}
                  {cat.categoryGroup === 'RESIDENTIAL'
                    ? ' (🏠 ທີ່ຢູ່ອາໄສ)'
                    : cat.categoryGroup === 'NON_RESIDENTIAL'
                    ? ' (🏢 ບໍ່ແມ່ນທີ່ຢູ່ອາໄສ)'
                    : ''}
                </option>
              ))}
              {tariffCategories.length === 0 && (
                <option value="">ເລີ່ມຕົ້ນ (Default)</option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              ປີ (Year)
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            >
              {[2026, 2027, 2028, 2029].map((y) => (
                <option key={y} value={y}>
                  ປີ {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              ເດືອນ (Month)
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  ເດືອນ {m} {[3, 4, 5].includes(m) ? '🔥 (ລະດູຮ້ອນ)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              ຄ່າຊ່ອມບຳລຸງ (Maintenance Fee)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={maintenanceFeeKip}
                onChange={(e) => setMaintenanceFeeKip(Number(e.target.value))}
                min={0}
                step={500}
                className="w-full px-3.5 py-2 text-xs font-bold text-right rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
              <span className="text-xs font-bold text-slate-600">₭</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              ຮູບແບບການປ້ອນຂໍ້ມູນ (Calculation Mode)
            </label>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setCalcMode('appliances')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
                  calcMode === 'appliances'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                1. ເຄື່ອງໃຊ້ໄຟຟ້າ
              </button>
              <button
                type="button"
                onClick={() => setCalcMode('direct')}
                className={cn(
                  'flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
                  calcMode === 'direct'
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                2. ປ້ອນໜ່ວຍໄຟ (kWh)
              </button>
            </div>
          </div>
        </div>

        {/* Mode A: Appliances List Editor */}
        {calcMode === 'appliances' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                ລາຍການເຄື່ອງໃຊ້ໄຟຟ້າໃນບ້ານ ({appliances.length} ລາຍການ)
              </span>

              <button
                type="button"
                onClick={handleAddAppliance}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ເພີ່ມເຄື່ອງໃຊ້ໄຟຟ້າ</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {appliances.map((app, index) => {
                const kwhEstimate = (
                  (app.watt *
                    app.quantity *
                    app.hoursPerDay *
                    (app.daysPerMonth || 30)) /
                  1000
                ).toFixed(1);

                return (
                  <div
                    key={index}
                    className="p-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-all grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    {/* Category & Preset */}
                    <div className="sm:col-span-3">
                      <select
                        value={app.categoryId ?? ''}
                        onChange={(e) =>
                          handleCategorySelect(index, Number(e.target.value))
                        }
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                      >
                        {config?.categories?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameLa}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name */}
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={app.customName}
                        onChange={(e) =>
                          handleApplianceChange(index, 'customName', e.target.value)
                        }
                        placeholder="ຊື່ເຄື່ອງໃຊ້ໄຟຟ້າ"
                        className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                      />
                    </div>

                    {/* Watt */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={app.watt}
                          onChange={(e) =>
                            handleApplianceChange(
                              index,
                              'watt',
                              Number(e.target.value)
                            )
                          }
                          min={1}
                          className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold"
                        />
                        <span className="text-[10px] text-slate-500 font-bold">
                          W
                        </span>
                      </div>
                    </div>

                    {/* Qty & Hours */}
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <input
                        type="number"
                        value={app.quantity}
                        onChange={(e) =>
                          handleApplianceChange(
                            index,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        min={1}
                        title="ຈຳນວນເຄື່ອງ"
                        className="w-12 px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-center font-semibold"
                      />
                      <span className="text-[10px] text-slate-400">×</span>
                      <input
                        type="number"
                        step="0.5"
                        value={app.hoursPerDay}
                        onChange={(e) =>
                          handleApplianceChange(
                            index,
                            'hoursPerDay',
                            Number(e.target.value)
                          )
                        }
                        min={0.1}
                        max={24}
                        title="ຊົ່ວໂມງ/ມື້"
                        className="w-14 px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-center font-semibold"
                      />
                      <span className="text-[10px] text-slate-500">h/d</span>
                    </div>

                    {/* Est. kWh & Delete */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
                        {kwhEstimate} kWh
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAppliance(index)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="ລຶບລາຍການ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode B: Direct kWh Input */}
        {calcMode === 'direct' && (
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-900 block">
                ຈຳນວນໜ່ວຍໄຟຟ້າລວມຕໍ່ເດືອນ (Direct Monthly kWh)
              </span>
              <span className="text-[11px] text-indigo-700/80">
                ປ້ອນຕົວເລກຈາກໃບບິນ ຫຼື ໜ່ວຍໄຟຟ້າທີ່ຕ້ອງການທົດສອບ
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <input
                type="number"
                value={directMonthlyKwh}
                onChange={(e) => setDirectMonthlyKwh(Number(e.target.value))}
                min={0}
                className="w-40 px-3.5 py-2 text-sm font-bold text-right rounded-xl border border-indigo-200 bg-white text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-bold text-indigo-900">kWh / ເດືອນ</span>
            </div>
          </div>
        )}

        {/* Saving Action Recommendations Selection */}
        {allActionTemplates.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              ເລືອກແຜນປະຢັດໄຟຟ້າເພື່ອປະເມີນຜົນ (Saving Actions)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {allActionTemplates.map((tpl) => {
                const isChecked = selectedActions.includes(tpl.id);
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleToggleAction(tpl.id)}
                    className={cn(
                      'p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5',
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {tpl.titleLa}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                          {tpl.ruleType === 'FIXED_FRACTION'
                            ? `-${Math.round((tpl.fixedFraction || 0) * 100)}%`
                            : tpl.ruleType === 'REDUCE_HOURS'
                            ? `-${tpl.reduceHoursBy}h/ມື້`
                            : 'ປ່ຽນ LED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {tpl.descriptionLa}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Simulation Result Presentation */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                ພະລັງງານໄຟຟ້າລວມ
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatNumber(result.totalMonthlyKwh)}
                </span>
                <span className="text-xs font-semibold text-slate-500">kWh</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                ຂັ້ນບັນໄດສູງສຸດ: #{result.currentBill?.highestTierOrder}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                ຄ່າໄຟຟ້າກ່ອນປະຢັດ
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {formatNumber(result.currentBill?.totalCostKip)}
                </span>
                <span className="text-xs font-semibold text-slate-500">ກີບ</span>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold block mt-1">
                ລວມ VAT 10%
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                ຄ່າໄຟຟ້າຫຼັງແຜນປະຢັດ
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-700">
                  {formatNumber(result.savingPlan?.afterBill?.totalCostKip)}
                </span>
                <span className="text-xs font-semibold text-emerald-600">ກີບ</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                ເຫຼືອ {formatNumber(result.savingPlan?.afterPlanKwh)} kWh
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-indigo-200/80 bg-indigo-50/20 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">
                ປະຢັດໄດ້ (Saved)
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-indigo-700">
                  {formatNumber(result.savingPlan?.estimatedKipSaved)}
                </span>
                <span className="text-xs font-semibold text-indigo-600">₭/ເດືອນ</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold block mt-1">
                ຫຼຸດລົງ {result.savingPlan?.savingPercent}% ({result.savingPlan?.totalKwhSaved} kWh)
              </span>
            </div>
          </div>

          {/* 8-Tier Progressive Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  ລາຍລະອຽດການຄິດໄລ່ຄ່າໄຟຕາມ 8 ຂັ້ນບັນໄດ (Progressive Tier Breakdown)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ອີງຕາມອັດຕາຄ່າໄຟຟ້າປະເພດທີ່ຢູ່ອາໄສ ງວດເດືອນ {result.month}/{result.year}
                </p>
              </div>

              {result.schedule?.isHotSeason && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  ລະດູຮ້ອນ (Hot Season Discount Applied)
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-14">ຂັ້ນ</th>
                    <th className="py-2.5 px-3">ຊ່ວງໜ່ວຍໄຟ (kWh)</th>
                    <th className="py-2.5 px-3 text-right">ອັດຕາ (ກີບ/kWh)</th>
                    <th className="py-2.5 px-3 text-right">ໜ່ວຍໄຟໃນຂັ້ນ (kWh)</th>
                    <th className="py-2.5 px-4 text-right">ຄ່າໄຟໃນຂັ້ນ (ກີບ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.currentBill?.tierBreakdown?.map((tier) => (
                    <tr
                      key={tier.tierOrder}
                      className={cn(
                        'hover:bg-slate-50/70 transition-colors',
                        tier.kwhInTier > 0 ? 'bg-blue-50/20 font-medium' : 'text-slate-400'
                      )}
                    >
                      <td className="py-2 px-3 text-center font-bold">
                        #{tier.tierOrder}
                      </td>
                      <td className="py-2 px-3">
                        {tier.label} kWh
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatNumber(tier.rateKipPerKwh)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                        {tier.kwhInTier > 0 ? formatNumber(tier.kwhInTier) : '0'}
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                        {formatNumber(tier.costKip)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-slate-50/80 font-semibold text-slate-800">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right">
                      ຄ່າໄຟຟ້າພື້ນຖານຕາມຂັ້ນ (Base Energy Cost):
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {formatNumber(result.currentBill?.totalKwh)} kWh
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold">
                      {formatNumber(result.currentBill?.baseCostKip)} ກີບ
                    </td>
                  </tr>

                  {result.currentBill?.hotSeasonDiscountKip > 0 && (
                    <tr className="text-amber-700 bg-amber-50/40">
                      <td colSpan={4} className="py-2 px-3 text-right">
                        ສ່ວນຫຼຸດລະດູຮ້ອນ (Hot Season Discount - 300 kWh):
                      </td>
                      <td className="py-2 px-4 text-right font-mono font-bold">
                        -{formatNumber(result.currentBill?.hotSeasonDiscountKip)} ກີບ
                      </td>
                    </tr>
                  )}

                  <tr className="text-slate-900 bg-slate-100/50">
                    <td colSpan={4} className="py-2 px-3 text-right font-bold">
                      1. ຄ່າໄຟລວມໃນເດືອນ (ຄ່າພະລັງງານໄຟຟ້າ):
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">
                      {formatNumber(result.currentBill?.netBaseCostKip)} ກີບ
                    </td>
                  </tr>

                  <tr className="text-indigo-900 bg-indigo-50/30">
                    <td colSpan={4} className="py-2 px-3 text-right font-semibold">
                      2. ຄ່າຊ່ອມບຳລຸງ (ຄ່າບຳລຸງຮັກສາ / Maintenance Fee):
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-indigo-700">
                      +{formatNumber(result.currentBill?.maintenanceFeeKip ?? maintenanceFeeKip)} ກີບ
                    </td>
                  </tr>

                  <tr className="text-slate-700 bg-slate-100/30 border-t border-slate-200">
                    <td colSpan={4} className="py-2 px-3 text-right font-semibold">
                      ຍອດລວມກ່ອນອາກອນ (ຄ່າໄຟລວມ + ຄ່າຊ່ອມບຳລຸງ):
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-800">
                      {formatNumber(
                        result.currentBill?.subtotalBeforeVatKip ??
                          ((result.currentBill?.netBaseCostKip ?? 0) +
                            (result.currentBill?.maintenanceFeeKip ?? maintenanceFeeKip))
                      )}{' '}
                      ກີບ
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right text-slate-600">
                      3. ອາກອນມູນຄ່າເພີ່ມ (VAT {Math.round(result.currentBill?.vatRate * 100)}% ຂອງຍອດລວມກ່ອນອາກອນ):
                    </td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-slate-700">
                      +{formatNumber(result.currentBill?.vatCostKip)} ກີບ
                    </td>
                  </tr>

                  <tr className="text-sm font-black bg-blue-50 text-blue-900 border-t border-blue-200">
                    <td colSpan={4} className="py-3 px-3 text-right">
                      ລວມມູນຄ່າໃບບິນທັງໝົດ (Total Monthly Bill):
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-base text-blue-950">
                      {formatNumber(result.currentBill?.totalCostKip)} ກີບ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Multi-Year Outlook (2026–2029) */}
          {result.yearlyOutlook && result.yearlyOutlook.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-indigo-600" />
                  ຄາດການແນວໂນ້ມຄ່າໄຟລາຍປີ 2026–2029 (Yearly Outlook Projection)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ປຽບທຽບມູນຄ່າຄ່າໄຟຟ້າ ແລະ ເງິນທີ່ປະຢັດໄດ້ໃນແຕ່ລະປີ ຖ້າປະຕິບັດຕາມແຜນປະຢັດໄຟຟ້າ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.yearlyOutlook.map((outlook) => (
                  <div
                    key={outlook.year}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        ປີ {outlook.year}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {outlook.noticeNumber}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>ກ່ອນປະຢັດ:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {formatNumber(outlook.costBeforeKip)} ₭
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>ຫຼັງປະຢັດ:</span>
                        <span className="font-mono font-bold">
                          {formatNumber(outlook.costAfterKip)} ₭
                        </span>
                      </div>
                      <div className="flex justify-between text-indigo-700 pt-1 border-t border-slate-200/60 font-bold">
                        <span>ປະຢັດຕໍ່ປີ:</span>
                        <span className="font-mono">
                          +{formatNumber(outlook.savedPerYearKip)} ₭
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
