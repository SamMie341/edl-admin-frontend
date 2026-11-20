'use client';

import React, { useState } from 'react';
import { Type, Maximize2, Palette, RotateCcw } from 'lucide-react';
import {
  DEFAULT_ORG_CHART_STYLE,
  ORG_CHART_COLOR_THEMES,
  ORG_CHART_FONT_OPTIONS,
  ORG_CHART_FONT_WEIGHT_OPTIONS,
  ORG_CHART_SIZE_PRESETS,
  type OrgChartFontWeight,
  type OrgChartStyleConfig,
} from '../../domain/org-chart-designer.types';
import { cn } from '@/lib/utils';

interface OrgChartStylePanelProps {
  style: OrgChartStyleConfig;
  onChange: (nextStyle: OrgChartStyleConfig) => void;
}

type StyleTab = 'fonts' | 'layout' | 'colors';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.5,
  unit = 'px',
  onChange,
}: SliderControlProps) {
  return (
    <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-700 truncate">
          {label}
        </span>
        <span className="text-[11px] font-mono font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shrink-0">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, Number((value - step).toFixed(1))))}
          className="h-6 w-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer"
        >
          -
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-blue-600 cursor-pointer"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, Number((value + step).toFixed(1))))}
          className="h-6 w-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function ColorControl({ label, value, onChange }: ColorControlProps) {
  return (
    <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70 cursor-pointer hover:bg-slate-100/70 transition">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-700 truncate">
          {label}
        </p>
        <p className="text-[10px] font-mono text-slate-400 uppercase">
          {value}
        </p>
      </div>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 rounded-lg border border-slate-200 bg-white p-0.5 cursor-pointer shrink-0"
      />
    </label>
  );
}

export function OrgChartStylePanel({
  style,
  onChange,
}: OrgChartStylePanelProps) {
  const [activeTab, setActiveTab] = useState<StyleTab>('fonts');

  const updateField = <K extends keyof OrgChartStyleConfig>(
    key: K,
    val: OrgChartStyleConfig[K]
  ) => {
    onChange({
      ...style,
      [key]: val,
    });
  };

  const applySizePreset = (presetKey: keyof typeof ORG_CHART_SIZE_PRESETS) => {
    onChange({
      ...style,
      ...ORG_CHART_SIZE_PRESETS[presetKey].values,
    });
  };

  const applyColorTheme = (values: Partial<OrgChartStyleConfig>) => {
    onChange({
      ...style,
      ...values,
    });
  };

  return (
    <div className="bg-white border-b border-slate-200/80 p-3 sm:px-4 space-y-3 text-xs shrink-0 animate-in fade-in duration-150">
      {/* Top Row: Quick Size Presets + Tab Switcher + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1">
            ຂະໜາດສຳເລັດຮູບ:
          </span>
          {(
            Object.keys(ORG_CHART_SIZE_PRESETS) as Array<
              keyof typeof ORG_CHART_SIZE_PRESETS
            >
          ).map((key) => {
            const preset = ORG_CHART_SIZE_PRESETS[key];
            const isSelected = style.cardWidth === preset.values.cardWidth;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applySizePreset(key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('fonts')}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer',
                activeTab === 'fonts'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Type className="h-3 w-3" />
              <span>ຟ້ອນ & ຂະໜາດ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer',
                activeTab === 'layout'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Maximize2 className="h-3 w-3" />
              <span>ກາດ & ໄລຍະຫ່າງ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('colors')}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer',
                activeTab === 'colors'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Palette className="h-3 w-3" />
              <span>ສີ & ຂອບ</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_ORG_CHART_STYLE })}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold cursor-pointer transition"
            title="ຄືນຄ່າເລີ່ມຕົ້ນທັງໝົດ"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Font Family & Font Sizes */}
      {activeTab === 'fonts' && (
        <div className="space-y-3">
          {/* Font Family Picker Grid */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold text-slate-600">
              ຮູບແບບຟ້ອນ (Font Family):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {ORG_CHART_FONT_OPTIONS.map((fontOpt) => {
                const isActive = style.fontFamily === fontOpt.id;
                return (
                  <button
                    key={fontOpt.id}
                    type="button"
                    onClick={() => updateField('fontFamily', fontOpt.id)}
                    className={cn(
                      'text-left p-2 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-0.5',
                      isActive
                        ? 'bg-blue-50/90 border-blue-500 ring-1 ring-blue-500 shadow-2xs'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80'
                    )}
                  >
                    <span
                      style={{ fontFamily: fontOpt.cssFamily }}
                      className={cn(
                        'text-sm font-bold leading-tight truncate',
                        isActive ? 'text-blue-800' : 'text-slate-900'
                      )}
                    >
                      {fontOpt.sampleLao}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate">
                      {fontOpt.label}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {fontOpt.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <SliderControl
              label="ຫົວຂໍ້ຫຼັກ (ລາວ)"
              value={style.headerTitleLaoSize}
              min={14}
              max={34}
              step={1}
              onChange={(v) => updateField('headerTitleLaoSize', v)}
            />
            <SliderControl
              label="ຫົວຂໍ້ຫຼັກ (EN)"
              value={style.headerTitleEnSize}
              min={9}
              max={20}
              step={0.5}
              onChange={(v) => updateField('headerTitleEnSize', v)}
            />
            <SliderControl
              label="ກ່ອງສັງກັດ (ປ້າຍ)"
              value={style.badgeFontSize}
              min={7.5}
              max={16}
              step={0.5}
              onChange={(v) => updateField('badgeFontSize', v)}
            />
            <SliderControl
              label="ຂະໜາດ EN ໃນປ້າຍ"
              value={Math.round((style.badgeEnScale ?? 0.8) * 100)}
              min={65}
              max={105}
              step={5}
              unit="%"
              onChange={(pct) =>
                updateField('badgeEnScale', Number((pct / 100).toFixed(2)))
              }
            />
          <SliderControl
            label="ຊື່ (ລາວ)"
            value={style.nameLaoSize}
            min={8.5}
            max={18}
            step={0.5}
            onChange={(v) => updateField('nameLaoSize', v)}
          />
          <SliderControl
            label="ຊື່ (EN)"
            value={style.nameEnSize}
            min={7.5}
            max={15}
            step={0.5}
            onChange={(v) => updateField('nameEnSize', v)}
          />
          <SliderControl
            label="ຕຳແໜ່ງ (ລາວ)"
            value={style.roleLaoSize}
            min={8.5}
            max={18}
            step={0.5}
            onChange={(v) => updateField('roleLaoSize', v)}
          />
          <SliderControl
            label="ຕຳແໜ່ງ (EN)"
            value={style.roleEnSize}
            min={7.5}
            max={15}
            step={0.5}
            onChange={(v) => updateField('roleEnSize', v)}
          />
          </div>

          {/* Font Weight Controls (Bold / ExtraBold) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-600">
                ຄວາມໜາຕົວອັກສອນ (ຕົວເຂັ້ມ / ປົກກະຕິ):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...style,
                      nameLaoWeight: 800,
                      nameEnWeight: 800,
                      roleLaoWeight: 500,
                      roleEnWeight: 400,
                    })
                  }
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer',
                    style.nameLaoWeight === 800 && style.nameEnWeight === 800
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  ເນັ້ນຊື່ເຂັ້ມພິເສດ (800)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...style,
                      badgeWeight: 700,
                      nameLaoWeight: 700,
                      nameEnWeight: 700,
                      roleLaoWeight: 700,
                      roleEnWeight: 400,
                    })
                  }
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer',
                    style.nameLaoWeight === 700 &&
                      style.nameEnWeight === 700 &&
                      style.roleLaoWeight === 700
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  ເຂັ້ມມາດຕະຖານ (700)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { key: 'nameLaoWeight', label: 'ຊື່ (ລາວ)' },
                  { key: 'nameEnWeight', label: 'ຊື່ (EN)' },
                  { key: 'badgeWeight', label: 'ປ້າຍສັງກັດ' },
                  { key: 'roleLaoWeight', label: 'ຕຳແໜ່ງ (ລາວ)' },
                  { key: 'roleEnWeight', label: 'ຕຳແໜ່ງ (EN)' },
                ] as const
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1"
                >
                  <label className="block text-[10px] font-semibold text-slate-600">
                    {label}
                  </label>
                  <select
                    value={style[key]}
                    onChange={(e) =>
                      updateField(
                        key,
                        Number(e.target.value) as OrgChartFontWeight
                      )
                    }
                    className="w-full px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 cursor-pointer"
                  >
                    {ORG_CHART_FONT_WEIGHT_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Card Size, Wrapping & Spacing */}
      {activeTab === 'layout' && (
        <div className="space-y-3">
          {/* Auto-wrap Cards per Row + Badge Wrap Mode */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-600 mr-1">
                ລົງແຖວອັດຕະໂນມັດ (ຄົນ/ແຖວ):
              </span>
              {[0, 2, 3, 4, 5, 6].map((cols) => {
                const isSelected = style.maxColumnsPerRow === cols;
                return (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => updateField('maxColumnsPerRow', cols)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer',
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {cols === 0 ? 'ທັງໝົດ 1 ແຖວ' : `${cols} ຄົນ/ແຖວ`}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-600">
                ການຕັດແຖວໃນປ້າຍ:
              </span>
              <button
                type="button"
                onClick={() => updateField('badgeNoAutoWrap', false)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer',
                  !style.badgeNoAutoWrap
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                ຕັດແຖວອັດຕະໂນມັດ
              </button>
              <button
                type="button"
                onClick={() => updateField('badgeNoAutoWrap', true)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer',
                  style.badgeNoAutoWrap
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                )}
              >
                ບໍ່ລົງແຖວເອງ (ສະເພາະກົດ Enter)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <SliderControl
              label="ຄວາມກວ້າງກາດ"
              value={style.cardWidth}
              min={176}
              max={320}
              step={4}
              onChange={(v) => updateField('cardWidth', v)}
            />
            <SliderControl
              label="ຄວາມສູງຮູບ"
              value={style.photoHeight}
              min={110}
              max={240}
              step={4}
              onChange={(v) => updateField('photoHeight', v)}
            />
            <SliderControl
              label="ຊ່ອງວ່າງລະຫວ່າງກາດ"
              value={style.cardGap}
              min={12}
              max={48}
              step={2}
              onChange={(v) => updateField('cardGap', v)}
            />
            <SliderControl
              label="ຊ່ອງວ່າງລະຫວ່າງແຖວ"
              value={style.tierGap}
              min={28}
              max={96}
              step={4}
              onChange={(v) => updateField('tierGap', v)}
            />
            <SliderControl
              label="ຄວາມມົນມຸມກາດ"
              value={style.cardRadius}
              min={4}
              max={28}
              step={2}
              onChange={(v) => updateField('cardRadius', v)}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Colors & Themes */}
      {activeTab === 'colors' && (
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">
              ຊຸດສີແນະນຳ:
            </span>
            {ORG_CHART_COLOR_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => applyColorTheme(theme.values)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer transition"
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: theme.values.headerBorderColor }}
                />
                <span
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: theme.values.leaderBorderColor }}
                />
                <span>{theme.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <ColorControl
              label="ຂອບຫົວຂໍ້ຫຼັກ"
              value={style.headerBorderColor}
              onChange={(v) => updateField('headerBorderColor', v)}
            />
            <ColorControl
              label="ຂອບປ້າຍສັງກັດ"
              value={style.badgeBorderColor}
              onChange={(v) => updateField('badgeBorderColor', v)}
            />
            <ColorControl
              label="ຂອບກາດປະທານ"
              value={style.leaderBorderColor}
              onChange={(v) => updateField('leaderBorderColor', v)}
            />
            <ColorControl
              label="ຂອບກາດສະມາຊິກ"
              value={style.memberBorderColor}
              onChange={(v) => updateField('memberBorderColor', v)}
            />
            <ColorControl
              label="ສີຕົວອັກສອນຫຼັກ"
              value={style.primaryTextColor}
              onChange={(v) => updateField('primaryTextColor', v)}
            />
            <ColorControl
              label="ສີຕົວອັກສອນຮອງ"
              value={style.secondaryTextColor}
              onChange={(v) => updateField('secondaryTextColor', v)}
            />
            <ColorControl
              label="ສີເສັ້ນເຊື່ອມຕໍ່"
              value={style.lineColor}
              onChange={(v) => updateField('lineColor', v)}
            />
            <ColorControl
              label="ສີພື້ນຫຼັງຮູບ"
              value={style.backgroundColor}
              onChange={(v) => updateField('backgroundColor', v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
