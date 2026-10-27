'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Languages,
  Image as ImageIcon,
  Settings,
  Plus,
  Trash2,
  Video,
  Calendar,
  FolderKanban,
  Tags,
  CheckCircle2,
} from 'lucide-react';
import {
  FormModal,
  FileUploader,
  RichTextEditor,
} from '@/core/presentation/components/shared';
import {
  useCreateNews,
  useUpdateNews,
  useUploadNewsCover,
  useUploadNewsGallery,
  useNewsCategories,
  useNewsTags,
} from '../../application/use-news.hook';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { NewsItem, NewsStatus } from '../../domain/news.types';
import { cn } from '@/lib/utils';

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  news?: NewsItem | null;
}

type TabType = 'lao' | 'english' | 'media' | 'settings';

export function NewsFormModal({ isOpen, onClose, news }: NewsFormModalProps) {
  const isEdit = Boolean(news);

  const { data: categories = [] } = useNewsCategories();
  const { data: tags = [] } = useNewsTags();

  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const uploadCoverMutation = useUploadNewsCover();
  const uploadGalleryMutation = useUploadNewsGallery();

  const [activeTab, setActiveTab] = useState<TabType>('lao');

  // Form states
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // Lao Content
  const [titleLa, setTitleLa] = useState('');
  const [subtitleLa, setSubtitleLa] = useState('');
  const [contentLa, setContentLa] = useState('');

  // English Content
  const [titleEn, setTitleEn] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [contentEn, setContentEn] = useState('');

  // Media
  const [coverFile, setCoverFile] = useState<File | string | null>(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');

  // Settings
  const [status, setStatus] = useState<NewsStatus>('DRAFT');
  const [publishedAt, setPublishedAt] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (news) {
      setCategoryId(news.categoryId);
      setSelectedTagIds(news.tags?.map((t) => t.tagId) || []);

      setTitleLa(news.titleLa || '');
      setSubtitleLa(news.subtitleLa || '');
      setContentLa(news.contentLa || '');

      setTitleEn(news.titleEn || '');
      setSubtitleEn(news.subtitleEn || '');
      setContentEn(news.contentEn || '');

      setCoverFile(news.coverImage || null);
      setExistingGalleryUrls(
        Array.isArray(news.galleryImages) ? news.galleryImages : []
      );
      setNewGalleryFiles([]);
      setVideoUrl(news.videoUrl || '');

      setStatus(news.status || 'DRAFT');
      setPublishedAt(
        news.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : ''
      );
    } else {
      setCategoryId(categories[0]?.id || '');
      setSelectedTagIds([]);

      setTitleLa('');
      setSubtitleLa('');
      setContentLa('');

      setTitleEn('');
      setSubtitleEn('');
      setContentEn('');

      setCoverFile(null);
      setExistingGalleryUrls([]);
      setNewGalleryFiles([]);
      setVideoUrl('');

      setStatus('DRAFT');
      setPublishedAt(new Date().toISOString().slice(0, 16));
    }
    setActiveTab('lao');
    setErrors({});
  }, [news, isOpen, categories]);

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const addedFiles = Array.from(e.target.files);
      setNewGalleryFiles((prev) => [...prev, ...addedFiles].slice(0, 10)); // max 10
    }
  };

  const removeNewGalleryFile = (index: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingGalleryUrl = (index: number) => {
    setExistingGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!titleLa.trim()) newErrors.titleLa = 'ກະລຸນາປ້ອນຫົວຂໍ້ຂ່າວພາສາລາວ';
    if (!contentLa.trim() || contentLa === '<p></p>')
      newErrors.contentLa = 'ກະລຸນາປ້ອນເນື້ອຫາຂ່າວພາສາລາວ';
    if (!categoryId) newErrors.categoryId = 'ກະລຸນາເລືອກໝວດໝູ່ຂ່າວ';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Switch to tab with error
      if (newErrors.titleLa || newErrors.contentLa) setActiveTab('lao');
      else if (newErrors.categoryId) setActiveTab('settings');
      return;
    }

    try {
      let savedNewsId = news?.id;

      const payload = {
        categoryId: Number(categoryId),
        titleLa: titleLa.trim(),
        titleEn: titleEn.trim() || undefined,
        subtitleLa: subtitleLa.trim() || undefined,
        subtitleEn: subtitleEn.trim() || undefined,
        contentLa: contentLa.trim(),
        contentEn: contentEn.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        tagIds: selectedTagIds,
        galleryImages: existingGalleryUrls,
      };

      if (isEdit && news) {
        await updateMutation.mutateAsync({
          id: news.id,
          payload,
        });
      } else {
        const created = await createMutation.mutateAsync(payload);
        savedNewsId = created.id;
      }

      // Upload Cover if new File selected
      if (savedNewsId && coverFile instanceof File) {
        await uploadCoverMutation.mutateAsync({
          id: savedNewsId,
          file: coverFile,
        });
      }

      // Upload Gallery if new Files selected
      if (savedNewsId && newGalleryFiles.length > 0) {
        await uploadGalleryMutation.mutateAsync({
          id: savedNewsId,
          files: newGalleryFiles,
        });
      }

      onClose();
    } catch {
      // Handled by toast in hook
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadCoverMutation.isPending ||
    uploadGalleryMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂຂ່າວສານປະຊາສຳພັນ' : 'ສ້າງຂ່າວສານໃໝ່'}
      description="ຄຸ້ມຄອງເນື້ອຫາຂ່າວສານ 2 ພາສາ (Lao & English), ຮູບພາບປົກ, Gallery ແລະ ວິດີໂອ"
      size="2xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງຂ່າວສານ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('lao')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition cursor-pointer',
              activeTab === 'lao'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span>🇱🇦 ພາສາລາວ (ຫຼັກ)</span>
            {errors.titleLa && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('english')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition cursor-pointer',
              activeTab === 'english'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <span>🇬🇧 English (ອັງກິດ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition cursor-pointer',
              activeTab === 'media'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>ສື່ & ຮູບພາບ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold transition cursor-pointer',
              activeTab === 'settings'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>ຕັ້ງຄ່າ</span>
          </button>
        </div>

        {/* Tab 1: Lao Content */}
        {activeTab === 'lao' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Title Lao */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ຫົວຂໍ້ຂ່າວ (ພາສາລາວ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={titleLa}
                onChange={(e) => setTitleLa(e.target.value)}
                placeholder="ປ້ອນຫົວຂໍ້ຂ່າວ..."
                className={cn(
                  'w-full px-4 py-2.5 text-xs rounded-xl border bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500',
                  errors.titleLa ? 'border-rose-400' : 'border-slate-200'
                )}
              />
              {errors.titleLa && (
                <p className="text-[11px] text-rose-500">{errors.titleLa}</p>
              )}
            </div>

            {/* Subtitle Lao */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ບົດສະຫຼຸບຫຍໍ້ (Subtitle ພາສາລາວ)
              </label>
              <input
                type="text"
                value={subtitleLa}
                onChange={(e) => setSubtitleLa(e.target.value)}
                placeholder="ອະທິບາຍຫຍໍ້ກ່ຽວກັບເນື້ອໃນຂ່າວ..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>

            {/* Content Lao Rich Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ເນື້ອຫາຂ່າວລະອຽດ (Content ພາສາລາວ){' '}
                <span className="text-rose-500">*</span>
              </label>
              <RichTextEditor
                value={contentLa}
                onChange={setContentLa}
                placeholder="ຂຽນເນື້ອຫາຂ່າວສານປະຊາສຳພັນລະອຽດທີ່ນີ້..."
                minHeight="220px"
                error={errors.contentLa}
              />
            </div>
          </div>
        )}

        {/* Tab 2: English Content */}
        {activeTab === 'english' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            {/* Title En */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                News Title (English)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Enter English news title..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>

            {/* Subtitle En */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Subtitle (English)
              </label>
              <input
                type="text"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                placeholder="Enter brief subtitle in English..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>

            {/* Content En Rich Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                News Content (English)
              </label>
              <RichTextEditor
                value={contentEn}
                onChange={setContentEn}
                placeholder="Write detailed English news content here..."
                minHeight="220px"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Media & Images */}
        {activeTab === 'media' && (
          <div className="space-y-5 animate-in fade-in-50 duration-150">
            {/* Cover Image */}
            <div className="space-y-1.5">
              <FileUploader
                type="image"
                label="ຮູບພາບໜ້າປົກຂ່າວ (Cover Image)"
                value={coverFile}
                onChange={setCoverFile}
                helperText="ຮູບພາບຂະໜາດ 16:9 ແນະນຳຄວາມລະອຽດ 1280x720px ຂຶ້ນໄປ"
              />
            </div>

            {/* Video URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                ລິ້ງວິດີໂອປະກອບ (Video URL)
              </label>
              <div className="relative flex items-center">
                <Video className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    ຮູບພາບ Gallery ເພີ່ມເຕີມ
                  </h5>
                  <p className="text-[11px] text-slate-400">
                    ເລືອກຮູບພາບປະກອບຂ່າວສານໄດ້ຫຼາຍຮູບ (ສູງສຸດ 10 ຮູບ)
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium cursor-pointer transition">
                  <Plus className="h-3.5 w-3.5" />
                  <span>ເພີ່ມຮູບພາບ</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryFilesChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Gallery Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* Existing uploaded images */}
                {existingGalleryUrls.map((url, idx) => (
                  <div
                    key={`exist-${idx}`}
                    className="group relative h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs"
                  >
                    <Image
                      src={getStorageUrl(url)}
                      alt="Gallery"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingGalleryUrl(idx)}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="ລຶບຮູບນີ້"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Newly selected files */}
                {newGalleryFiles.map((file, idx) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div
                      key={`new-${idx}`}
                      className="group relative h-24 rounded-xl border-2 border-dashed border-blue-300 overflow-hidden bg-blue-50/30 shadow-2xs"
                    >
                      <Image
                        src={previewUrl}
                        alt="New"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold">
                        ໃໝ່
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewGalleryFile(idx)}
                        className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="ລຶບຮູບນີ້"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}

                {existingGalleryUrls.length === 0 && newGalleryFiles.length === 0 && (
                  <div className="col-span-full py-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-xs">ຍັງບໍ່ມີຮູບພາບ Gallery</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  ໝວດໝູ່ຂ່າວສານ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className={cn(
                    'w-full px-4 py-2.5 text-xs rounded-xl border bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer',
                    errors.categoryId ? 'border-rose-400' : 'border-slate-200'
                  )}
                >
                  <option value="">-- ເລືອກໝວດໝູ່ --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-[11px] text-rose-500">{errors.categoryId}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  ສະຖານະຂ່າວສານ
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as NewsStatus)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
                >
                  <option value="DRAFT">ສະບັບຮ່າງ (Draft)</option>
                  <option value="PUBLISHED">ເຜີຍແຜ່ແລ້ວ (Published)</option>
                  <option value="ARCHIVED">ເກັບຖາວອນ (Archived)</option>
                </select>
              </div>

              {/* Published At */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  ວັນທີ ແລະ ເວລາເຜີຍແຜ່ (Published Date)
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Tags Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  ແທັກຂ່າວສານ (Tags)
                </label>
                <span className="text-[11px] text-slate-400">
                  ເລືອກແລ້ວ {selectedTagIds.length} ແທັກ
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 min-h-[50px]">
                {tags.map((t) => {
                  const isSelected = selectedTagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer',
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <span>#{t.tagName}</span>
                      {isSelected && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                  );
                })}

                {tags.length === 0 && (
                  <p className="text-xs text-slate-400">
                    ຍັງບໍ່ມີຂໍ້ມູນແທັກໃນລະບົບ (ສາມາດເພີ່ມໄດ້ທີ່ເມນູ &quot;ແທັກຂ່າວສານ&quot;)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
}
