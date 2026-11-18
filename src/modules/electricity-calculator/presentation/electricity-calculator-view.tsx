'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calculator,
  Zap,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Sun,
  ShieldAlert,
  Tag,
  Table,
  LayoutGrid,
  Home,
  Building2,
  Factory,
  Wheat,
  Landmark,
} from 'lucide-react';
import {
  DataTable,
  ConfirmModal,
  StatusBadge,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/core/application/use-permission.hook';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Hooks
import {
  useTariffCategories,
  useDeleteTariffCategory,
  useApplianceCategories,
  useDeleteApplianceCategory,
  useAppliancePresets,
  useDeleteAppliancePreset,
  useSavingTemplates,
  useDeleteSavingTemplate,
  useTariffNotices,
  useTariffNotice,
  useDeleteTariffNotice,
  useDeleteSchedule,
} from '../application/use-electricity-calculator.hook';

// Types
import type {
  TariffCategory,
  ApplianceCategory,
  AppliancePreset,
  SavingActionTemplate,
  TariffNotice,
  TariffSchedule,
} from '../domain/electricity-calculator.types';

// Modals & Simulator
import { TariffCategoryFormModal } from './components/tariff-category-form-modal';
import { CategoryFormModal } from './components/category-form-modal';
import { PresetFormModal } from './components/preset-form-modal';
import { SavingTemplateFormModal } from './components/saving-template-form-modal';
import { TariffNoticeFormModal } from './components/tariff-notice-form-modal';
import { MonthlyScheduleModal } from './components/monthly-schedule-modal';
import { CalculatorSimulatorTab } from './components/calculator-simulator-tab';

export type CalculatorTabType =
  | 'tariff-categories'
  | 'notices'
  | 'categories'
  | 'presets'
  | 'templates'
  | 'simulator';

export interface ElectricityCalculatorViewProps {
  initialTab?: CalculatorTabType | 'saving-templates';
}

const LAO_MONTH_NAMES = [
  'ມັງກອນ (Jan)',
  'ກຸມພາ (Feb)',
  'ມີນາ (Mar)',
  'ເມສາ (Apr)',
  'ພຶດສະພາ (May)',
  'ມິຖຸນາ (Jun)',
  'ກໍລະກົດ (Jul)',
  'ສິງຫາ (Aug)',
  'ກັນຍາ (Sep)',
  'ຕຸລາ (Oct)',
  'ພະຈິກ (Nov)',
  'ທັນວາ (Dec)',
];

const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return Tag;
  const lower = categoryName.toLowerCase();
  if (lower.includes('ທີ່ຢູ່ອາໄສ') || lower.includes('resident')) return Home;
  if (lower.includes('ທຸລະກິດ') || lower.includes('commerc')) return Building2;
  if (lower.includes('ອຸດສາຫະກຳ') || lower.includes('industr')) return Factory;
  if (lower.includes('ກະສິກຳ') || lower.includes('agri')) return Wheat;
  if (lower.includes('ຫ້ອງການ') || lower.includes('ລັດ') || lower.includes('gov')) return Landmark;
  return Tag;
};

export function ElectricityCalculatorView({
  initialTab = 'notices',
}: ElectricityCalculatorViewProps = {}) {
  const router = useRouter();
  const normalizedInitialTab: CalculatorTabType =
    initialTab === 'saving-templates' ? 'templates' : initialTab;
  const [activeTab, setActiveTab] = useState<CalculatorTabType>(normalizedInitialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab === 'saving-templates' ? 'templates' : initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: CalculatorTabType) => {
    setActiveTab(tab);
    const subroute = tab === 'templates' ? 'saving-templates' : tab;
    router.push(`/electricity-calculator/${subroute}`);
  };

  const { can, isSuperAdmin } = usePermission();
  const canCreate = can('ELECTRICITY_CALCULATOR', 'CREATE');
  const canUpdate = can('ELECTRICITY_CALCULATOR', 'UPDATE');
  const canDelete = can('ELECTRICITY_CALCULATOR', 'DELETE');

  // ==========================================================================
  // Data Queries
  // ==========================================================================
  const [tariffCategorySearch, setTariffCategorySearch] = useState('');
  const [tariffCategoryGroupFilter, setTariffCategoryGroupFilter] = useState<'ALL' | 'RESIDENTIAL' | 'NON_RESIDENTIAL'>('ALL');
  const {
    data: tariffCategories = [],
    isLoading: isTariffCategoriesLoading,
    refetch: refetchTariffCategories,
    isRefetching: isTariffCategoriesRefetching,
  } = useTariffCategories(tariffCategorySearch);

  const filteredTariffCategories = useMemo(() => {
    if (tariffCategoryGroupFilter === 'ALL') return tariffCategories;
    return tariffCategories.filter((c) => c.categoryGroup === tariffCategoryGroupFilter);
  }, [tariffCategories, tariffCategoryGroupFilter]);

  const [categorySearch, setCategorySearch] = useState('');
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
    isRefetching: isCategoriesRefetching,
  } = useApplianceCategories(categorySearch);

  const [presetSearch, setPresetSearch] = useState('');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<number | undefined>(undefined);
  const {
    data: presets = [],
    isLoading: isPresetsLoading,
    refetch: refetchPresets,
    isRefetching: isPresetsRefetching,
  } = useAppliancePresets(selectedPresetCategory, presetSearch);

  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<number | undefined>(undefined);
  const {
    data: savingTemplates = [],
    isLoading: isTemplatesLoading,
    refetch: refetchTemplates,
    isRefetching: isTemplatesRefetching,
  } = useSavingTemplates(selectedTemplateCategory, templateSearch);

  const {
    data: notices = [],
    isLoading: isNoticesLoading,
    refetch: refetchNotices,
    isRefetching: isNoticesRefetching,
  } = useTariffNotices();

  // Expanded notice for schedules view
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);
  const [scheduleVoltageFilter, setScheduleVoltageFilter] = useState<string | 'ALL'>('ALL');
  const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState<number | 'ALL' | null>(null);
  const [scheduleViewMode, setScheduleViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [selectedScheduleYear, setSelectedScheduleYear] = useState<number>(new Date().getFullYear());
  const [schedulePrefill, setSchedulePrefill] = useState<{
    month?: number;
    year?: number;
    categoryId?: number;
  }>({});

  const { data: currentNoticeDetail } = useTariffNotice(expandedNoticeId || undefined);

  // Available voltage levels from tariff categories
  const voltageLevelInfo = useMemo(() => {
    const levelsSet = new Set<string>();
    let hasNone = false;
    tariffCategories.forEach((c) => {
      if (c.voltageLevel) {
        levelsSet.add(c.voltageLevel);
      } else {
        hasNone = true;
      }
    });

    const standardOrder = ['0.4 kV', '22 kV', '115 kV', '230 kV'];
    const sorted = Array.from(levelsSet).sort((a, b) => {
      const ia = standardOrder.indexOf(a);
      const ib = standardOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

    return {
      levels: sorted,
      hasNone,
    };
  }, [tariffCategories]);

  // Categories filtered by the active voltage level filter
  const categoriesInVoltage = useMemo(() => {
    if (scheduleVoltageFilter === 'ALL') return tariffCategories;
    if (scheduleVoltageFilter === 'NO_VOLTAGE') {
      return tariffCategories.filter((c) => !c.voltageLevel);
    }
    return tariffCategories.filter((c) => c.voltageLevel === scheduleVoltageFilter);
  }, [tariffCategories, scheduleVoltageFilter]);

  const handleVoltageFilterChange = (voltage: string | 'ALL') => {
    setScheduleVoltageFilter(voltage);
    const inVoltage = tariffCategories.filter((c) => {
      if (voltage === 'ALL') return true;
      if (voltage === 'NO_VOLTAGE') return !c.voltageLevel;
      return c.voltageLevel === voltage;
    });

    // If a specific category was selected, check if it's still in the filtered voltage set
    if (typeof scheduleCategoryFilter === 'number') {
      const stillExists = inVoltage.some((c) => c.id === scheduleCategoryFilter);
      if (!stillExists) {
        setScheduleCategoryFilter(inVoltage[0]?.id ?? 'ALL');
      }
    }
  };

  // Available years from notice schedules
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear + 1);
    if (currentNoticeDetail?.effectiveFrom) {
      years.add(new Date(currentNoticeDetail.effectiveFrom).getFullYear());
    }
    if (currentNoticeDetail?.effectiveTo) {
      years.add(new Date(currentNoticeDetail.effectiveTo).getFullYear());
    }
    (currentNoticeDetail?.schedules || []).forEach((s) => {
      if (s.year) years.add(s.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [currentNoticeDetail]);

  // ==========================================================================
  // Modals State
  // ==========================================================================
  const [tariffCategoryModalOpen, setTariffCategoryModalOpen] = useState(false);
  const [selectedTariffCategory, setSelectedTariffCategory] = useState<TariffCategory | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ApplianceCategory | null>(null);

  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<AppliancePreset | null>(null);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SavingActionTemplate | null>(null);

  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<TariffNotice | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [targetNoticeForSchedule, setTargetNoticeForSchedule] = useState<TariffNotice | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<TariffSchedule | null>(null);

  // Deletion modals state
  const [deleteTariffCategoryItem, setDeleteTariffCategoryItem] = useState<TariffCategory | null>(null);
  const [deleteCategoryItem, setDeleteCategoryItem] = useState<ApplianceCategory | null>(null);
  const [deletePresetItem, setDeletePresetItem] = useState<AppliancePreset | null>(null);
  const [deleteTemplateItem, setDeleteTemplateItem] = useState<SavingActionTemplate | null>(null);
  const [deleteNoticeItem, setDeleteNoticeItem] = useState<TariffNotice | null>(null);
  const [deleteScheduleItem, setDeleteScheduleItem] = useState<{ id: number; year: number; month: number } | null>(null);

  // Mutations
  const deleteTariffCategoryMutation = useDeleteTariffCategory();
  const deleteCategoryMutation = useDeleteApplianceCategory();
  const deletePresetMutation = useDeleteAppliancePreset();
  const deleteTemplateMutation = useDeleteSavingTemplate();
  const deleteNoticeMutation = useDeleteTariffNotice();
  const deleteScheduleMutation = useDeleteSchedule();

  // ==========================================================================
  // Delete Handlers
  // ==========================================================================
  const handleDeleteTariffCategoryConfirm = async () => {
    if (!deleteTariffCategoryItem) return;
    try {
      await deleteTariffCategoryMutation.mutateAsync(deleteTariffCategoryItem.id);
      setDeleteTariffCategoryItem(null);
    } catch { }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deleteCategoryItem) return;
    try {
      await deleteCategoryMutation.mutateAsync(deleteCategoryItem.id);
      setDeleteCategoryItem(null);
    } catch { }
  };

  const handleDeletePresetConfirm = async () => {
    if (!deletePresetItem) return;
    try {
      await deletePresetMutation.mutateAsync(deletePresetItem.id);
      setDeletePresetItem(null);
    } catch { }
  };

  const handleDeleteTemplateConfirm = async () => {
    if (!deleteTemplateItem) return;
    try {
      await deleteTemplateMutation.mutateAsync(deleteTemplateItem.id);
      setDeleteTemplateItem(null);
    } catch { }
  };

  const handleDeleteNoticeConfirm = async () => {
    if (!deleteNoticeItem) return;
    try {
      await deleteNoticeMutation.mutateAsync(deleteNoticeItem.id);
      setDeleteNoticeItem(null);
    } catch { }
  };

  const handleDeleteScheduleConfirm = async () => {
    if (!deleteScheduleItem) return;
    try {
      await deleteScheduleMutation.mutateAsync({
        id: deleteScheduleItem.id,
        noticeId: expandedNoticeId || undefined,
      });
      setDeleteScheduleItem(null);
    } catch { }
  };

  // ==========================================================================
  // Columns Definitions
  // ==========================================================================

  // 0. Tariff Categories Columns (Module 3.22.1)
  const tariffCategoryColumns: ColumnDef<TariffCategory>[] = [
    {
      header: 'ລຳດັບ',
      accessorKey: 'orderIndex',
      cell: (row) => <span className="font-mono text-xs">{row.orderIndex}</span>,
    },
    {
      header: 'ຊື່ປະເພດອັດຕາຄ່າໄຟ (Lao / EN)',
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{row.nameLa}</span>
          {row.nameEn && <span className="text-[11px] text-slate-400">{row.nameEn}</span>}
        </div>
      ),
    },
    {
      header: 'ກຸ່ມປະເພດ',
      cell: (row) => {
        if (!row.categoryGroup) return <span className="text-xs text-slate-400">-</span>;
        const isRes = row.categoryGroup === 'RESIDENTIAL';
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
              isRes
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            )}
          >
            {isRes ? '🏠 ທີ່ຢູ່ອາໄສ' : '🏢 ບໍ່ແມ່ນທີ່ຢູ່ອາໄສ'}
          </span>
        );
      },
    },
    {
      header: 'ລະດັບແຮງດັນ',
      cell: (row) => {
        if (!row.voltageLevel) return <span className="text-xs text-slate-400">-</span>;
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            ⚡ {row.voltageLevel}
          </span>
        );
      },
    },
    {
      header: 'ຄຳອະທິບາຍ',
      accessorKey: 'description',
      cell: (row) => (
        <span className="text-xs text-slate-600 line-clamp-1">
          {row.description || '-'}
        </span>
      ),
    },
    {
      header: 'ສະຖານະ',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'ຈັດການ',
      headerClassName: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                setSelectedTariffCategory(row);
                setTariffCategoryModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="ແກ້ໄຂ"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteTariffCategoryItem(row)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="ລຶບ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // 1. Categories Columns
  const categoryColumns: ColumnDef<ApplianceCategory>[] = [
    {
      header: 'ລຳດັບ',
      accessorKey: 'orderIndex',
      cell: (row) => <span className="font-mono text-xs">{row.orderIndex}</span>,
    },
    {
      header: 'ຊື່ໝວດໝູ່ (Lao / EN)',
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{row.nameLa}</span>
          {row.nameEn && <span className="text-[11px] text-slate-400">{row.nameEn}</span>}
        </div>
      ),
    },
    {
      header: 'ຈຳນວນຕົ້ນແບບ',
      cell: (row) => (
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
          {row._count?.presets ?? row.presets?.length ?? 0} ລາຍການ
        </span>
      ),
    },
    {
      header: 'ສະຖານະ',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'ຈັດການ',
      headerClassName: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(row);
                setCategoryModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="ແກ້ໄຂ"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteCategoryItem(row)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="ລຶບ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // 2. Presets Columns
  const presetColumns: ColumnDef<AppliancePreset>[] = [
    {
      header: 'ລຳດັບ',
      accessorKey: 'orderIndex',
      cell: (row) => <span className="font-mono text-xs">{row.orderIndex}</span>,
    },
    {
      header: 'ໝວດໝູ່',
      cell: (row) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded">
          {row.category?.nameLa || '-'}
        </span>
      ),
    },
    {
      header: 'ຊື່ເຄື່ອງໃຊ້ໄຟຟ້າ',
      cell: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-xs">{row.nameLa}</span>
            {row.isSampleDefault && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                ຕົວຢ່າງ
              </span>
            )}
          </div>
          {row.nameEn && <span className="text-[11px] text-slate-400">{row.nameEn}</span>}
        </div>
      ),
    },
    {
      header: 'ກຳລັງໄຟ (Watt)',
      accessorKey: 'defaultWatt',
      cell: (row) => (
        <span className="font-mono font-bold text-xs text-blue-700">
          {row.defaultWatt} W
        </span>
      ),
    },
    {
      header: 'ການໃຊ້ງານເລີ່ມຕົ້ນ',
      cell: (row) => (
        <span className="text-xs text-slate-600">
          {row.defaultQuantity} ເຄື່ອງ × {row.defaultHoursPerDay}h/ມື້
        </span>
      ),
    },
    {
      header: 'ສະຖານະ',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'ຈັດການ',
      headerClassName: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                setSelectedPreset(row);
                setPresetModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="ແກ້ໄຂ"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeletePresetItem(row)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="ລຶບ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // 3. Saving Action Templates Columns
  const templateColumns: ColumnDef<SavingActionTemplate>[] = [
    {
      header: 'ລຳດັບ',
      accessorKey: 'orderIndex',
      cell: (row) => <span className="font-mono text-xs">{row.orderIndex}</span>,
    },
    {
      header: 'ໝວດໝູ່',
      cell: (row) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded">
          {row.category?.nameLa || '-'}
        </span>
      ),
    },
    {
      header: 'ວິທີປະຢັດໄຟຟ້າ',
      cell: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-xs">{row.titleLa}</span>
            {row.defaultSelected && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                ເລືອກເລີ່ມຕົ້ນ
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 line-clamp-1">{row.descriptionLa}</span>
        </div>
      ),
    },
    {
      header: 'ສູດຄິດໄລ່',
      cell: (row) => {
        let ruleText = '';
        if (row.ruleType === 'FIXED_FRACTION') {
          ruleText = `ຫຼຸດ ${Math.round(Number(row.fixedFraction || 0) * 100)}%`;
        } else if (row.ruleType === 'REDUCE_HOURS') {
          ruleText = `ຫຼຸດ ${row.reduceHoursBy}h/ມື້`;
        } else {
          ruleText = `ປ່ຽນ LED (${row.targetWattLow}W - ${row.targetWattHigh}W)`;
        }
        return (
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
            {ruleText}
          </span>
        );
      },
    },
    {
      header: 'ລະດັບຄວາມພະຍາຍາມ',
      accessorKey: 'effortLevel',
      cell: (row) => {
        const labels: Record<string, string> = {
          EASY: 'ງ່າຍ / ປັບພຶດຕິກຳ (Easy)',
          LOW_COST: 'ລົງທຶນໜ້ອຍ (Low Cost)',
          INVESTMENT: 'ການລົງທຶນ (Investment)',
        };
        return (
          <span className="text-xs font-medium text-slate-700">
            {labels[row.effortLevel] || row.effortLevel}
          </span>
        );
      },
    },
    {
      header: 'ສະຖານະ',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'ຈັດການ',
      headerClassName: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                setSelectedTemplate(row);
                setTemplateModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="ແກ້ໄຂ"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteTemplateItem(row)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="ລຶບ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const sectionMeta: Record<
    CalculatorTabType,
    { title: string; subtitle: string; badge: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    'tariff-categories': {
      title: 'ປະເພດອັດຕາຄ່າໄຟຟ້າ (Tariff Categories)',
      subtitle:
        'ຄຸ້ມຄອງປະເພດຜູ້ຊົມໃຊ້ໄຟຟ້າ (ທີ່ຢູ່ອາໄສ, ທຸລະກິດ, ອຸດສາຫະກຳ, ກະສິກຳ, ຫ້ອງການລັດ) ຕາມໂຄງສ້າງໃໝ່',
      badge: 'Module 3.22.1 • Tariff Categories',
      icon: Tag,
    },
    notices: {
      title: 'ປະກາດອັດຕາຄ່າໄຟ & ຕາຕະລາງ 8 ຂັ້ນ',
      subtitle:
        'ຄຸ້ມຄອງເອກະສານປະກາດອັດຕາຄ່າໄຟ, ຕາຕະລາງລາຄາ 12 ເດືອນຕາມປະເພດ ແລະ ເພດານສ່ວນຫຼຸດລະດູຮ້ອນ',
      badge: 'Module 3.22.2 • Tariff Notices & Schedules',
      icon: FileSpreadsheet,
    },
    categories: {
      title: 'ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ (Appliance Categories)',
      subtitle:
        'ຈັດການໝວດໝູ່ຫຼັກຂອງເຄື່ອງໃຊ້ໄຟຟ້າເຊັ່ນ ແອ, ຕູ້ເຢັນ, ດອກໄຟ, ເຄື່ອງຄົວ, etc.',
      badge: 'Module 3.22.3 • Appliance Categories',
      icon: Layers,
    },
    presets: {
      title: 'ເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ (Appliance Presets)',
      subtitle:
        'ກຳນົດຄ່າເລີ່ມຕົ້ນຂອງກຳລັງໄຟຟ້າ (W) ແລະ ຊົ່ວໂມງໃຊ້ງານສະເລ່ຍຕໍ່ມື້',
      badge: 'Module 3.22.4 • Appliance Presets',
      icon: Zap,
    },
    templates: {
      title: 'ແມ່ແບບວິທີປະຢັດໄຟຟ້າ (Saving Templates)',
      subtitle:
        'ສູດຄິດໄລ່ການຫຼຸດພະລັງງານໄຟຟ້າ (% ຄົງທີ່, ຫຼຸດຊົ່ວໂມງ, ປ່ຽນຫຼອດ LED)',
      badge: 'Module 3.22.5 • Saving Action Templates',
      icon: Sparkles,
    },
    simulator: {
      title: 'ທົດລອງຄິດໄລ່ຄ່າໄຟຟ້າ (Electricity Simulator)',
      subtitle:
        'ລະບົບທົດລອງຄິດໄລ່ຄ່າໄຟຟ້າ ແລະ ຈຳລອງການປະຢັດໄຟຕາມໂຄງສ້າງ 8 ຂັ້ນບັນໄດ 2026–2029',
      badge: 'Module 3.22.6 • Electricity Simulator',
      icon: Calculator,
    },
  };

  const currentSection = sectionMeta[activeTab] || sectionMeta['notices'];
  const SectionIcon = currentSection.icon;

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Dynamic Title & Contextual Stats */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 p-6 sm:p-7 text-white shadow-xl shadow-blue-900/10">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide">
              <SectionIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>{currentSection.badge}</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-xs">
              {currentSection.title}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              {currentSection.subtitle}
            </p>
          </div>

          {/* Quick Stat Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">
                ປະເພດລາຄາ
              </span>
              <span className="text-base font-black text-amber-200">{tariffCategories.length}</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                ປະກາດອັດຕາ
              </span>
              <span className="text-base font-black">{notices.length}</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                ໝວດໝູ່
              </span>
              <span className="text-base font-black">{categories.length}</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                ຕົ້ນແບບ (W)
              </span>
              <span className="text-base font-black">{presets.length}</span>
            </div>

            <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[85px]">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                ວິທີປະຢັດ
              </span>
              <span className="text-base font-black text-emerald-200">{savingTemplates.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Section Content */}

      {/* Tab 0: Tariff Categories (Module 3.22.1) */}
      {activeTab === 'tariff-categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                ລາຍການປະເພດອັດຕາຄ່າໄຟຟ້າ (Tariff Categories)
              </h2>
              <p className="text-xs text-slate-500">
                ຄຸ້ມຄອງປະເພດຜູ້ຊົມໃຊ້ໄຟຟ້າ (ທີ່ຢູ່ອາໄສ, ທຸລະກິດ, ອຸດສາຫະກຳ, ກະສິກຳ, ຫ້ອງການລັດ)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາປະເພດລາຄາໄຟ..."
                  value={tariffCategorySearch}
                  onChange={(e) => setTariffCategorySearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
                />
              </div>

              <select
                value={tariffCategoryGroupFilter}
                onChange={(e) => setTariffCategoryGroupFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 cursor-pointer"
              >
                <option value="ALL">ທຸກກຸ່ມປະເພດ (All Groups)</option>
                <option value="RESIDENTIAL">🏠 ທີ່ຢູ່ອາໄສ (Residential)</option>
                <option value="NON_RESIDENTIAL">🏢 ບໍ່ແມ່ນທີ່ຢູ່ອາໄສ (Non-Residential)</option>
              </select>

              <button
                type="button"
                onClick={() => refetchTariffCategories()}
                disabled={isTariffCategoriesRefetching}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="ໂຫຼດຂໍ້ມູນໃໝ່"
              >
                <RefreshCw
                  className={cn(
                    'w-4 h-4',
                    isTariffCategoriesRefetching && 'animate-spin text-blue-600'
                  )}
                />
              </button>

              {canCreate && (
                <Button
                  onClick={() => {
                    setSelectedTariffCategory(null);
                    setTariffCategoryModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  ເພີ່ມປະເພດໃໝ່
                </Button>
              )}
            </div>
          </div>

          <DataTable
            columns={tariffCategoryColumns}
            data={filteredTariffCategories}
            isLoading={isTariffCategoriesLoading}
            emptyMessage="ບໍ່ພົບຂໍ້ມູນປະເພດອັດຕາຄ່າໄຟຟ້າ"
          />
        </div>
      )}

      {/* Tab 1: Notices & Schedules */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                ລາຍການປະກາດອັດຕາຄ່າໄຟຟ້າ (Tariff Notices)
              </h2>
              <p className="text-xs text-slate-500">
                ຄຸ້ມຄອງເອກະສານປະກາດອັດຕາຄ່າໄຟ ແລະ ຕາຕະລາງອັດຕາ 8 ຂັ້ນບັນໄດລາຍເດືອນ
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetchNotices()}
                disabled={isNoticesRefetching}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                title="ໂຫຼດຂໍ້ມູນໃໝ່"
              >
                <RefreshCw
                  className={cn(
                    'w-4 h-4',
                    isNoticesRefetching && 'animate-spin text-blue-600'
                  )}
                />
              </button>

              {canCreate && (
                <Button
                  onClick={() => {
                    setSelectedNotice(null);
                    setNoticeModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  ເພີ່ມປະກາດໃໝ່
                </Button>
              )}
            </div>
          </div>

          {/* Notices Cards List */}
          <div className="space-y-3.5">
            {notices.map((notice) => {
              const isExpanded = expandedNoticeId === notice.id;

              return (
                <div
                  key={notice.id}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
                >
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                          {notice.noticeNumber}
                        </span>
                        <StatusBadge status={notice.status} />
                        <span className="text-[11px] text-slate-500 font-medium">
                          VAT {Math.round(Number(notice.vatRate || 0.1) * 100)}% • ເພດານລະດູຮ້ອນ:{' '}
                          {notice.hotSeasonDiscountCapKwh} kWh • ຄ່າຊ່ອມບຳລຸງ:{' '}
                          <strong className="text-slate-700 font-mono">
                            {Number(notice.maintenanceFeeKip || 0).toLocaleString()} ₭
                          </strong>
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                        {notice.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        ມີຜົນແຕ່ວັນທີ{' '}
                        <span className="font-semibold text-slate-700">
                          {format(new Date(notice.effectiveFrom), 'dd/MM/yyyy')}
                        </span>{' '}
                        ເຖິງ{' '}
                        <span className="font-semibold text-slate-700">
                          {format(new Date(notice.effectiveTo), 'dd/MM/yyyy')}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedNoticeId(isExpanded ? null : notice.id)
                        }
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
                          isExpanded
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        )}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {isExpanded
                            ? 'ເຊື່ອງຕາຕະລາງລາຍເດືອນ'
                            : `ເບິ່ງຕາຕະລາງ 8 ຂັ້ນ (${notice._count?.schedules ?? 0})`}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {canCreate && (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetNoticeForSchedule(notice);
                            setSelectedSchedule(null);
                            setScheduleModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ກຳນົດເດືອນ</span>
                        </button>
                      )}

                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNotice(notice);
                            setNoticeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="ແກ້ໄຂປະກາດ"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setDeleteNoticeItem(notice)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="ລຶບປະກາດ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Monthly Schedules */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6 space-y-5">
                      {/* 1. Cascading Dropdown Controls: ປະເພດ (Voltage Level), ຂໍ້ມູນຂອງປະເພດ (Category Item), ປີ (Year) & View Controls */}
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                                ຕາຕະລາງອັດຕາຄ່າໄຟຟ້າ 8 ຂັ້ນບັນໄດລາຍເດືອນ
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                ເລືອກປະເພດ ແລະ ຂໍ້ມູນຂອງປະເພດ ເພື່ອສະແດງຕາຕະລາງອັດຕາລາຄາ
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* View Mode Toggle: Matrix vs Cards */}
                            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                              <button
                                type="button"
                                onClick={() => setScheduleViewMode('matrix')}
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
                                  scheduleViewMode === 'matrix'
                                    ? 'bg-white text-blue-700 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                )}
                                title="ມຸມມອງຕາຕະລາງປຽບທຽບ 12 ເດືອນ"
                              >
                                <Table className="w-3.5 h-3.5" />
                                <span>ຕາຕະລາງ 12 ເດືອນ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setScheduleViewMode('cards')}
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
                                  scheduleViewMode === 'cards'
                                    ? 'bg-white text-blue-700 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                )}
                                title="ມຸມມອງກາດລາຍເດືອນ"
                              >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>ກາດລາຍເດືອນ</span>
                              </button>
                            </div>

                            {canCreate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetNoticeForSchedule(notice);
                                  setSelectedSchedule(null);
                                  setSchedulePrefill({
                                    year: selectedScheduleYear,
                                    categoryId:
                                      typeof scheduleCategoryFilter === 'number'
                                        ? scheduleCategoryFilter
                                        : categoriesInVoltage[0]?.id || tariffCategories[0]?.id,
                                  });
                                  setScheduleModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>ກຳນົດເດືອນໃໝ່</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Dropdown Filters Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
                          {/* Dropdown 1: ປະເພດ / ລະດັບແຮງດັນ */}
                          <div className="space-y-1.5 lg:col-span-4">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>1. ເລືອກປະເພດ / ລະດັບແຮງດັນ:</span>
                            </label>
                            <div className="relative">
                              <select
                                value={scheduleVoltageFilter}
                                onChange={(e) => handleVoltageFilterChange(e.target.value)}
                                className="w-full pl-3.5 pr-8 py-2 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none"
                              >
                                <option value="ALL">
                                  ⚡ ທຸກລະດັບແຮງດັນ (All Voltage Levels) - {tariffCategories.length} ປະເພດ
                                </option>
                                {voltageLevelInfo.levels.map((vLevel) => {
                                  const count = tariffCategories.filter((c) => c.voltageLevel === vLevel).length;
                                  const levelDesc =
                                    vLevel === '0.4 kV'
                                      ? 'ແຮງດັນຕ່ຳ'
                                      : vLevel === '22 kV'
                                        ? 'ແຮງດັນກາງ'
                                        : vLevel === '115 kV'
                                          ? 'ແຮງດັນສູງ'
                                          : vLevel === '230 kV'
                                            ? 'ແຮງດັນສູງພິເສດ'
                                            : '';
                                  return (
                                    <option key={vLevel} value={vLevel}>
                                      ⚡ {vLevel} {levelDesc ? `(${levelDesc})` : ''} - {count} ປະເພດ
                                    </option>
                                  );
                                })}
                                {voltageLevelInfo.hasNone && (
                                  <option value="NO_VOLTAGE">
                                    ອື່ນໆ / ທົ່ວໄປ (General) - {tariffCategories.filter((c) => !c.voltageLevel).length} ປະເພດ
                                  </option>
                                )}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Dropdown 2: ຂໍ້ມູນຂອງປະເພດນັ້ນໆ (ລາຍການປະເພດອັດຕາຄ່າໄຟ) */}
                          <div className="space-y-1.5 lg:col-span-5">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between gap-1.5">
                              <span className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-blue-600" />
                                <span>2. ເລືອກຂໍ້ມູນຂອງປະເພດນັ້ນ:</span>
                              </span>
                              <span className="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                {categoriesInVoltage.length} ລາຍການ
                              </span>
                            </label>
                            <div className="relative">
                              <select
                                value={
                                  scheduleCategoryFilter === 'ALL'
                                    ? 'ALL'
                                    : (scheduleCategoryFilter ?? categoriesInVoltage[0]?.id ?? '')
                                }
                                onChange={(e) => {
                                  if (e.target.value === 'ALL') {
                                    setScheduleCategoryFilter('ALL');
                                  } else {
                                    setScheduleCategoryFilter(Number(e.target.value));
                                  }
                                }}
                                className="w-full pl-3.5 pr-8 py-2 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none truncate"
                              >
                                <option value="ALL">
                                  -- ທຸກລາຍການໃນ {scheduleVoltageFilter === 'ALL' ? 'ທຸກລະດັບແຮງດັນ' : scheduleVoltageFilter} ({categoriesInVoltage.length} ລາຍການ) --
                                </option>
                                {categoriesInVoltage.map((cat) => {
                                  const scheduleCount = (currentNoticeDetail?.schedules || []).filter(
                                    (s) => s.categoryId === cat.id && s.year === selectedScheduleYear
                                  ).length;
                                  return (
                                    <option key={cat.id} value={cat.id}>
                                      {cat.nameLa} {cat.voltageLevel ? `[${cat.voltageLevel}]` : ''} {scheduleCount > 0 ? `(${scheduleCount}/12 ເດືອນ)` : '(ຍັງບໍ່ມີຂໍ້ມູນ)'}
                                    </option>
                                  );
                                })}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Dropdown 3: ປີ (Year) */}
                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span>3. ເລືອກປີ (Year):</span>
                            </label>
                            <div className="relative">
                              <select
                                value={selectedScheduleYear}
                                onChange={(e) => setSelectedScheduleYear(Number(e.target.value))}
                                className="w-full pl-3.5 pr-8 py-2 text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer appearance-none"
                              >
                                {availableYears.map((yr) => (
                                  <option key={yr} value={yr}>
                                    ປີ ຄ.ສ {yr}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Monthly Rates Display (ຕາຕະລາງລາຄາ 8 ຂັ້ນ) */}
                      {(() => {
                        const allSchedules = currentNoticeDetail?.schedules || [];
                        const activeCatId =
                          scheduleCategoryFilter === 'ALL'
                            ? null
                            : (typeof scheduleCategoryFilter === 'number' &&
                              categoriesInVoltage.some((c) => c.id === scheduleCategoryFilter)
                              ? scheduleCategoryFilter
                              : categoriesInVoltage[0]?.id ?? tariffCategories[0]?.id);

                        // Target categories to display: filtered by voltage level and active category
                        const targetCategories =
                          scheduleCategoryFilter === 'ALL'
                            ? categoriesInVoltage
                            : categoriesInVoltage.filter((c) => c.id === activeCatId);

                        if (targetCategories.length === 0 && categoriesInVoltage.length > 0) {
                          targetCategories.push(categoriesInVoltage[0]);
                        }

                        // 3A. Matrix Table View
                        if (scheduleViewMode === 'matrix') {
                          return (
                            <div className="space-y-6">
                              {targetCategories.map((cat) => {
                                const schedulesForCat = allSchedules.filter(
                                  (s) => s.categoryId === cat.id && s.year === selectedScheduleYear
                                );
                                const CatIcon = getCategoryIcon(cat.nameLa);

                                return (
                                  <div
                                    key={cat.id}
                                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-0"
                                  >
                                    {/* Category Sub-Header */}
                                    <div className="p-3.5 bg-gradient-to-r from-blue-50/70 via-slate-50/50 to-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-blue-100/70 text-blue-700">
                                          <CatIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                            <span>{cat.nameLa}</span>
                                            {cat.voltageLevel && (
                                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                                ⚡ {cat.voltageLevel}
                                              </span>
                                            )}
                                            {cat.categoryGroup && (
                                              <span
                                                className={cn(
                                                  'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                                                  cat.categoryGroup === 'RESIDENTIAL'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                                )}
                                              >
                                                {cat.categoryGroup === 'RESIDENTIAL'
                                                  ? '🏠 ທີ່ຢູ່ອາໄສ'
                                                  : '🏢 ບໍ່ແມ່ນທີ່ຢູ່ອາໄສ'}
                                              </span>
                                            )}
                                            {cat.nameEn && (
                                              <span className="text-[11px] text-slate-400 font-normal">
                                                ({cat.nameEn})
                                              </span>
                                            )}
                                          </h4>
                                          <p className="text-[11px] text-slate-500">
                                            {cat.description || 'ອັດຕາຄ່າໄຟຟ້າຕາມຂັ້ນບັນໄດ'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                        <span>
                                          ປີ: <strong className="text-slate-800 font-bold">{selectedScheduleYear}</strong>
                                        </span>
                                        <span>•</span>
                                        <span>
                                          ຄ່າຊ່ອມບຳລຸງພື້ນຖານ:{' '}
                                          <strong className="text-indigo-700 font-mono font-bold">
                                            {Number(notice.maintenanceFeeKip || 0).toLocaleString()} ₭
                                          </strong>
                                        </span>
                                        <span>•</span>
                                        <span>
                                          ກຳນົດແລ້ວ:{' '}
                                          <strong className="text-emerald-700 font-mono font-bold">
                                            {schedulesForCat.length}/12 ເດືອນ
                                          </strong>
                                        </span>
                                      </div>
                                    </div>

                                    {/* Table of 12 Months */}
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                          <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                                            <th className="py-2.5 px-3.5 whitespace-nowrap min-w-[140px]">
                                              ເດືອນ (Month)
                                            </th>
                                            <th className="py-2.5 px-3 whitespace-nowrap text-center min-w-[105px] bg-indigo-50/40">
                                              ຄ່າຊ່ອມບຳລຸງ
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 1</div>
                                              <div className="text-[9px] font-normal text-slate-400">0–25 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 2</div>
                                              <div className="text-[9px] font-normal text-slate-400">26–150 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 3</div>
                                              <div className="text-[9px] font-normal text-slate-400">151–300 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 4</div>
                                              <div className="text-[9px] font-normal text-slate-400">301–400 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 5</div>
                                              <div className="text-[9px] font-normal text-slate-400">401–500 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 6</div>
                                              <div className="text-[9px] font-normal text-slate-400">501–1,000 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 7</div>
                                              <div className="text-[9px] font-normal text-slate-400">1,001–1,500 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-2.5 text-center whitespace-nowrap bg-blue-50/40 min-w-[85px]">
                                              <div>ຂັ້ນ 8</div>
                                              <div className="text-[9px] font-normal text-slate-400">&gt; 1,500 kWh</div>
                                            </th>
                                            <th className="py-2.5 px-3 whitespace-nowrap text-right min-w-[110px]">
                                              ຈັດການ
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthNum) => {
                                            const sched = schedulesForCat.find((s) => s.month === monthNum);
                                            const tiers = sched?.tiers || [];
                                            const getRate = (order: number) => {
                                              const t = tiers.find((tier) => tier.tierOrder === order);
                                              return t ? Number(t.rateKipPerKwh) : null;
                                            };

                                            const mFee = sched
                                              ? (sched.maintenanceFeeKip !== null &&
                                                sched.maintenanceFeeKip !== undefined
                                                ? Number(sched.maintenanceFeeKip)
                                                : Number(notice.maintenanceFeeKip || 0))
                                              : null;

                                            return (
                                              <tr
                                                key={monthNum}
                                                className={cn(
                                                  'transition-colors hover:bg-slate-50/80',
                                                  sched ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                                                )}
                                              >
                                                {/* Month Column */}
                                                <td className="py-2.5 px-3.5">
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-xs">
                                                      ເດືອນ {monthNum}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                      {LAO_MONTH_NAMES[monthNum - 1]}
                                                    </span>
                                                    {sched?.isHotSeason && (
                                                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                                                        <Sun className="w-2.5 h-2.5 text-amber-500" />
                                                        ລະດູຮ້ອນ
                                                      </span>
                                                    )}
                                                  </div>
                                                </td>

                                                {/* Maintenance Fee */}
                                                <td className="py-2.5 px-3 text-center font-mono text-xs bg-indigo-50/15">
                                                  {mFee !== null ? (
                                                    <span className="font-bold text-indigo-700">
                                                      {mFee.toLocaleString()} ₭
                                                    </span>
                                                  ) : (
                                                    <span className="text-slate-300">-</span>
                                                  )}
                                                </td>

                                                {/* 8 Tiers */}
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((order) => {
                                                  const rate = getRate(order);
                                                  return (
                                                    <td
                                                      key={order}
                                                      className="py-2.5 px-2.5 text-center font-mono text-xs"
                                                    >
                                                      {rate !== null ? (
                                                        <span className="font-bold text-slate-800">
                                                          {rate.toLocaleString()} ₭
                                                        </span>
                                                      ) : (
                                                        <span className="text-slate-300">-</span>
                                                      )}
                                                    </td>
                                                  );
                                                })}

                                                {/* Actions */}
                                                <td className="py-2.5 px-3 text-right">
                                                  {sched ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                      {canUpdate && (
                                                        <button
                                                          type="button"
                                                          onClick={() => {
                                                            setTargetNoticeForSchedule(notice);
                                                            setSelectedSchedule(sched);
                                                            setSchedulePrefill({
                                                              month: sched.month,
                                                              year: sched.year,
                                                              categoryId: sched.categoryId,
                                                            });
                                                            setScheduleModalOpen(true);
                                                          }}
                                                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                          title="ແກ້ໄຂອັດຕາ 8 ຂັ້ນ"
                                                        >
                                                          <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                      {canDelete && (
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            setDeleteScheduleItem({
                                                              id: sched.id,
                                                              year: sched.year,
                                                              month: sched.month,
                                                            })
                                                          }
                                                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                          title="ລຶບຕາຕະລາງເດືອນນີ້"
                                                        >
                                                          <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    canCreate && (
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setTargetNoticeForSchedule(notice);
                                                          setSelectedSchedule(null);
                                                          setSchedulePrefill({
                                                            month: monthNum,
                                                            year: selectedScheduleYear,
                                                            categoryId: cat.id,
                                                          });
                                                          setScheduleModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-dashed border-blue-200 transition cursor-pointer"
                                                      >
                                                        <Plus className="w-3 h-3" />
                                                        ກຳນົດເດືອນນີ້
                                                      </button>
                                                    )
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }

                        // 3B. Cards View
                        const schedulesToRender =
                          scheduleCategoryFilter === 'ALL'
                            ? allSchedules.filter(
                              (s) =>
                                s.year === selectedScheduleYear &&
                                categoriesInVoltage.some((c) => c.id === s.categoryId)
                            )
                            : allSchedules.filter(
                              (s) => s.categoryId === activeCatId && s.year === selectedScheduleYear
                            );

                        if (schedulesToRender.length === 0) {
                          return (
                            <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                              <p>ບໍ່ພົບຕາຕະລາງອັດຕາຄ່າໄຟໃນເງື່ອນໄຂນີ້ສຳລັບປີ {selectedScheduleYear}</p>
                              {canCreate && (
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setTargetNoticeForSchedule(notice);
                                    setSelectedSchedule(null);
                                    setSchedulePrefill({
                                      year: selectedScheduleYear,
                                      categoryId:
                                        typeof scheduleCategoryFilter === 'number'
                                          ? scheduleCategoryFilter
                                          : categoriesInVoltage[0]?.id || tariffCategories[0]?.id,
                                    });
                                    setScheduleModalOpen(true);
                                  }}
                                  className="text-xs font-bold text-blue-600"
                                >
                                  <Plus className="w-3.5 h-3.5 mr-1" />
                                  ກຳນົດເດືອນເລີ່ມຕົ້ນ
                                </Button>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {schedulesToRender.map((sched) => {
                              const matchedCategory =
                                sched.category ||
                                tariffCategories.find((c) => c.id === sched.categoryId);
                              const catName =
                                matchedCategory?.nameLa || 'ທີ່ຢູ່ອາໄສ (Residential)';

                              return (
                                <div
                                  key={sched.id}
                                  className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                      ເດືອນ {sched.month} / {sched.year}
                                    </span>
                                    {sched.isHotSeason && (
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md flex items-center gap-1">
                                        <Sun className="w-3 h-3 text-amber-500" />
                                        ລະດູຮ້ອນ
                                      </span>
                                    )}
                                  </div>

                                  {/* Tariff Category Badge */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                      <Tag className="w-3 h-3 text-blue-500" />
                                      {catName}
                                    </span>
                                    {matchedCategory?.voltageLevel && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                                        ⚡ {matchedCategory.voltageLevel}
                                      </span>
                                    )}
                                    {matchedCategory?.categoryGroup && (
                                      <span
                                        className={cn(
                                          'inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border',
                                          matchedCategory.categoryGroup === 'RESIDENTIAL'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        )}
                                      >
                                        {matchedCategory.categoryGroup === 'RESIDENTIAL'
                                          ? '🏠 ທີ່ຢູ່ອາໄສ'
                                          : '🏢 ບໍ່ແມ່ນທີ່ຢູ່ອາໄສ'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Tiers quick view */}
                                  <div className="space-y-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl">
                                    <div className="flex justify-between text-indigo-700 font-semibold pb-1 border-b border-slate-200/60">
                                      <span>ຄ່າຊ່ອມບຳລຸງ:</span>
                                      <span className="font-mono">
                                        {(sched.maintenanceFeeKip !== null &&
                                          sched.maintenanceFeeKip !== undefined
                                          ? Number(sched.maintenanceFeeKip)
                                          : Number(notice.maintenanceFeeKip || 0)
                                        ).toLocaleString()}{' '}
                                        ₭
                                      </span>
                                    </div>
                                    {sched.tiers?.slice(0, 3).map((t) => (
                                      <div key={t.tierOrder} className="flex justify-between">
                                        <span>ຂັ້ນ #{t.tierOrder} ({t.label}):</span>
                                        <span className="font-mono font-bold text-slate-800">
                                          {t.rateKipPerKwh} ₭
                                        </span>
                                      </div>
                                    ))}
                                    {sched.tiers && sched.tiers.length > 3 && (
                                      <div className="text-[10px] text-slate-400 text-center pt-0.5">
                                        + ອີກ {sched.tiers.length - 3} ຂັ້ນບັນໄດ
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                                    {canUpdate && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTargetNoticeForSchedule(notice);
                                          setSelectedSchedule(sched);
                                          setSchedulePrefill({
                                            month: sched.month,
                                            year: sched.year,
                                            categoryId: sched.categoryId,
                                          });
                                          setScheduleModalOpen(true);
                                        }}
                                        className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition text-xs font-semibold cursor-pointer"
                                      >
                                        ແກ້ໄຂ 8 ຂັ້ນ
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteScheduleItem({
                                            id: sched.id,
                                            year: sched.year,
                                            month: sched.month,
                                          })
                                        }
                                        className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                        title="ລຶບຕາຕະລາງ"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Categories */}
      {activeTab === 'categories' && (
        <DataTable
          columns={categoryColumns}
          data={categories}
          isLoading={isCategoriesLoading}
          searchPlaceholder="ຄົ້ນຫາຕາມຊື່ໝວດໝູ່..."
          searchValue={categorySearch}
          onSearchChange={setCategorySearch}
          title="ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ (Appliance Categories)"
          description="ຈັດການໝວດໝູ່ໃຫຍ່ຂອງເຄື່ອງໃຊ້ໄຟຟ້າເຊັ່ນ ແອ, ຕູ້ເຢັນ, ດອກໄຟ, ເຄື່ອງຄົວ, etc."
          actionButton={
            canCreate
              ? {
                label: 'ເພີ່ມໝວດໝູ່ໃໝ່',
                onClick: () => {
                  setSelectedCategory(null);
                  setCategoryModalOpen(true);
                },
              }
              : undefined
          }
        />
      )}

      {/* Tab 3: Presets */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-700">ຄັດກອງຕາມໝວດໝູ່:</span>
            <select
              value={selectedPresetCategory || ''}
              onChange={(e) =>
                setSelectedPresetCategory(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="">ທຸກໆໝວດໝູ່ (All Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameLa}{c.nameEn ? ` (${c.nameEn})` : ''}
                </option>
              ))}
            </select>
          </div>

          <DataTable
            columns={presetColumns}
            data={presets}
            isLoading={isPresetsLoading}
            searchPlaceholder="ຄົ້ນຫາຕາມຊື່ເຄື່ອງໃຊ້ໄຟຟ້າ..."
            searchValue={presetSearch}
            onSearchChange={setPresetSearch}
            title="ເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ (Appliance Presets)"
            description="ກຳນົດຄ່າເລີ່ມຕົ້ນຂອງກຳລັງໄຟຟ້າ (W) ແລະ ຊົ່ວໂມງໃຊ້ງານສະເລ່ຍຕໍ່ມື້"
            actionButton={
              canCreate
                ? {
                  label: 'ເພີ່ມເຄື່ອງໃຊ້ຕົ້ນແບບ',
                  onClick: () => {
                    setSelectedPreset(null);
                    setPresetModalOpen(true);
                  },
                }
                : undefined
            }
          />
        </div>
      )}

      {/* Tab 4: Saving Action Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-bold text-slate-700">ຄັດກອງຕາມໝວດໝູ່:</span>
            <select
              value={selectedTemplateCategory || ''}
              onChange={(e) =>
                setSelectedTemplateCategory(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
            >
              <option value="">ທຸກໆໝວດໝູ່ (All Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameLa}{c.nameEn ? ` (${c.nameEn})` : ''}
                </option>
              ))}
            </select>
          </div>

          <DataTable
            columns={templateColumns}
            data={savingTemplates}
            isLoading={isTemplatesLoading}
            searchPlaceholder="ຄົ້ນຫາຕາມຫົວຂໍ້ວິທີປະຢັດ..."
            searchValue={templateSearch}
            onSearchChange={setTemplateSearch}
            title="ແມ່ແບບວິທີປະຢັດໄຟຟ້າ (Saving Action Templates)"
            description="ສູດຄິດໄລ່ການຫຼຸດພະລັງງານໄຟຟ້າ (% ຄົງທີ່, ຫຼຸດຊົ່ວໂມງ, ປ່ຽນຫຼອດ LED)"
            actionButton={
              canCreate
                ? {
                  label: 'ເພີ່ມແມ່ແບບປະຢັດໄຟ',
                  onClick: () => {
                    setSelectedTemplate(null);
                    setTemplateModalOpen(true);
                  },
                }
                : undefined
            }
          />
        </div>
      )}

      {/* Tab 5: Simulator */}
      {activeTab === 'simulator' && <CalculatorSimulatorTab />}

      {/* ==================================================================== */}
      {/* Modals */}
      {/* ==================================================================== */}

      <TariffCategoryFormModal
        isOpen={tariffCategoryModalOpen}
        onClose={() => setTariffCategoryModalOpen(false)}
        category={selectedTariffCategory}
      />

      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={selectedCategory}
      />

      <PresetFormModal
        isOpen={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        preset={selectedPreset}
        defaultCategoryId={selectedPresetCategory}
      />

      <SavingTemplateFormModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        template={selectedTemplate}
        defaultCategoryId={selectedTemplateCategory}
      />

      <TariffNoticeFormModal
        isOpen={noticeModalOpen}
        onClose={() => setNoticeModalOpen(false)}
        notice={selectedNotice}
      />

      <MonthlyScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        notice={targetNoticeForSchedule}
        schedule={selectedSchedule}
        defaultYear={schedulePrefill.year}
        defaultMonth={schedulePrefill.month}
        defaultCategoryId={schedulePrefill.categoryId}
      />

      {/* Confirm Deletion Modals */}
      <ConfirmModal
        isOpen={Boolean(deleteTariffCategoryItem)}
        onClose={() => setDeleteTariffCategoryItem(null)}
        onConfirm={handleDeleteTariffCategoryConfirm}
        title="ຢືນຢັນການລຶບປະເພດອັດຕາຄ່າໄຟ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບປະເພດອັດຕາຄ່າໄຟ "${deleteTariffCategoryItem?.nameLa}"?`}
        confirmLabel="ຢືນຢັນການລຶບ"
        variant="danger"
        isLoading={deleteTariffCategoryMutation.isPending}
      />

      <ConfirmModal
        isOpen={Boolean(deleteCategoryItem)}
        onClose={() => setDeleteCategoryItem(null)}
        onConfirm={handleDeleteCategoryConfirm}
        title="ຢືນຢັນການລຶບໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໝວດໝູ່ "${deleteCategoryItem?.nameLa}"?`}
        confirmLabel="ຢືນຢັນການລຶບ"
        variant="danger"
        isLoading={deleteCategoryMutation.isPending}
      />

      <ConfirmModal
        isOpen={Boolean(deletePresetItem)}
        onClose={() => setDeletePresetItem(null)}
        onConfirm={handleDeletePresetConfirm}
        title="ຢືນຢັນການລຶບເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຕົ້ນແບບ "${deletePresetItem?.nameLa}"?`}
        confirmLabel="ຢືນຢັນການລຶບ"
        variant="danger"
        isLoading={deletePresetMutation.isPending}
      />

      <ConfirmModal
        isOpen={Boolean(deleteTemplateItem)}
        onClose={() => setDeleteTemplateItem(null)}
        onConfirm={handleDeleteTemplateConfirm}
        title="ຢືນຢັນການລຶບແມ່ແບບວິທີປະຢັດໄຟ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບແມ່ແບບ "${deleteTemplateItem?.titleLa}"?`}
        confirmLabel="ຢືນຢັນການລຶບ"
        variant="danger"
        isLoading={deleteTemplateMutation.isPending}
      />

      <ConfirmModal
        isOpen={Boolean(deleteNoticeItem)}
        onClose={() => setDeleteNoticeItem(null)}
        onConfirm={handleDeleteNoticeConfirm}
        title="ຢືນຢັນການລຶບປະກາດອັດຕາຄ່າໄຟຟ້າ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບປະກາດ "${deleteNoticeItem?.noticeNumber} - ${deleteNoticeItem?.title}" ພ້ອມຕາຕະລາງລາຍເດືອນທັງໝົດ?`}
        confirmLabel="ຢືນຢັນການລຶບ"
        variant="danger"
        isLoading={deleteNoticeMutation.isPending}
      />

      <ConfirmModal
        isOpen={Boolean(deleteScheduleItem)}
        onClose={() => setDeleteScheduleItem(null)}
        onConfirm={handleDeleteScheduleConfirm}
        title="ຢືນຢັນການລຶບຕາຕະລາງອັດຕາຄ່າໄຟລາຍເດືອນ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຕາຕະລາງອັດຕາຄ່າໄຟງວດເດືອນ ${deleteScheduleItem?.month}/${deleteScheduleItem?.year}?`}
        confirmLabel="ຢືນຢັນການລຶບ"
        variant="danger"
        isLoading={deleteScheduleMutation.isPending}
      />
    </div>
  );
}
