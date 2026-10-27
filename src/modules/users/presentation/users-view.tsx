'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Shield,
  KeyRound,
  Trash2,
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DataTable,
  StatusBadge,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useUsers,
  useDeleteUser,
} from '../application/use-users.hook';
import { SyncUserModal } from './components/sync-user-modal';
import { EditRoleModal } from './components/edit-role-modal';
import { ChangePasswordModal } from './components/change-password-modal';
import type { UserItem, UserRole } from '../domain/user.types';
import { cn } from '@/lib/utils';

export function UsersView() {
  const { data: users = [], isLoading, refetch, isRefetching } = useUsers();
  const deleteMutation = useDeleteUser();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals state
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [editingRoleUser, setEditingRoleUser] = useState<UserItem | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Pagination Client-side fallback
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  // Filtered & Searched Data
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role Filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) {
        return false;
      }

      // Search Query
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const code = (u.employeeCode || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const dept = (u.departmentName || '').toLowerCase();

      return (
        fullName.includes(term) ||
        code.includes(term) ||
        email.includes(term) ||
        dept.includes(term)
      );
    });
  }, [users, searchTerm, roleFilter]);

  // Paginated Sliced Data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  const paginationMeta = {
    total: filteredUsers.length,
    page,
    limit,
    totalPages: Math.ceil(filteredUsers.length / limit) || 1,
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      setDeletingUser(null);
    } catch {
      // Handled by hook
    }
  };

  // Columns Configuration
  const columns: ColumnDef<UserItem>[] = [
    {
      header: 'ລະຫັດພະນັກງານ',
      className: 'w-[130px]',
      cell: (user) => (
        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-700 border border-slate-200/60 shadow-2xs">
          {user.employeeCode}
        </span>
      ),
    },
    {
      header: 'ຂໍ້ມູນພະນັກງານ',
      cell: (user) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-800 text-xs">
            {user.firstName} {user.lastName}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
            {user.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" />
                {user.email}
              </span>
            )}
            {user.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {user.phoneNumber}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'ໂຄງສ້າງສັງກັດ',
      cell: (user) => (
        <div className="space-y-0.5 max-w-[200px]">
          <p className="text-xs font-semibold text-slate-700 truncate">
            {user.departmentName || 'ບໍ່ມີຂໍ້ມູນຝ່າຍ'}
          </p>
          {(user.divisionName || user.unitName) && (
            <p className="text-[11px] text-slate-400 truncate">
              {[user.divisionName, user.unitName].filter(Boolean).join(' • ')}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'ສິດທິ (Role)',
      cell: (user) => {
        const roleLabels: Record<string, { label: string; variant: any }> = {
          SUPERADMIN: { label: 'Super Admin', variant: 'danger' },
          ADMIN: { label: 'Admin', variant: 'info' },
          EDITOR: { label: 'Editor', variant: 'warning' },
          STAFF: { label: 'Staff', variant: 'default' },
        };
        const r = roleLabels[user.role] || { label: user.role, variant: 'default' };
        return <StatusBadge label={r.label} variant={r.variant} />;
      },
    },
    {
      header: 'ສະຖານະ',
      cell: (user) => <StatusBadge status={user.status} />,
    },
    {
      header: 'ເຂົ້າສູ່ລະບົບຫຼ້າສຸດ',
      cell: (user) => (
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {user.lastLoginAt
            ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm')
            : 'ຍັງບໍ່ເຄີຍເຂົ້າ'}
        </span>
      ),
    },
    {
      header: <span className="text-right block pr-2">ຈັດການ</span>,
      className: 'w-[140px] text-right',
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          {/* Edit Role Button */}
          <button
            type="button"
            onClick={() => setEditingRoleUser(user)}
            title="ປ່ຽນສິດທິ / ສະຖານະ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Shield className="h-4 w-4" />
          </button>

          {/* Change Password Button */}
          <button
            type="button"
            onClick={() => setChangingPasswordUser(user)}
            title="Reset ລະຫັດຜ່ານ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
          </button>

          {/* Delete User Button */}
          <button
            type="button"
            onClick={() => setDeletingUser(user)}
            title="ລຶບບັນຊີຜູ້ໃຊ້"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Navigation Tabs (Filter by Role) */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200/50">
        {[
          { key: 'ALL', label: 'ທັງໝົດ' },
          { key: 'SUPERADMIN', label: 'Super Admin' },
          { key: 'ADMIN', label: 'Administrators' },
          { key: 'EDITOR', label: 'Editors' },
          { key: 'STAFF', label: 'Staff' },
        ].map((tab) => {
          const isActive = roleFilter === tab.key;
          const count =
            tab.key === 'ALL'
              ? users.length
              : users.filter((u) => u.role === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => {
                setRoleFilter(tab.key);
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2',
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-mono',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/60 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Main Data Table */}
      <DataTable
        title="ລາຍຊື່ຜູ້ໃຊ້ງານລະບົບ (Users & IAM)"
        description="ຄຸ້ມຄອງບັນຊີຜູ້ໃຊ້, ສິດທິການເຂົ້າເຖິງ ແລະ ຊິ້ງຂໍ້ມູນພະນັກງານຈາກລະບົບ HRM ຟຟລ"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຕາມຊື່, ລະຫັດ, ອີເມວ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ຊິ້ງຂໍ້ມູນຈາກ HRM',
          icon: <UserPlus className="h-4 w-4" />,
          onClick: () => setIsSyncModalOpen(true),
        }}
        extraActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9 px-3 rounded-xl text-xs border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="ດຶງຂໍ້ມູນໃໝ່"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')}
            />
          </Button>
        }
      />

      {/* 3. Sync User Modal */}
      {isSyncModalOpen && (
        <SyncUserModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
        />
      )}

      {/* 4. Edit Role & Status Modal */}
      <EditRoleModal
        user={editingRoleUser}
        isOpen={Boolean(editingRoleUser)}
        onClose={() => setEditingRoleUser(null)}
      />

      {/* 5. Change Password Modal */}
      <ChangePasswordModal
        user={changingPasswordUser}
        isOpen={Boolean(changingPasswordUser)}
        onClose={() => setChangingPasswordUser(null)}
      />

      {/* 6. Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບບັນຊີຜູ້ໃຊ້ງານ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບັນຊີຂອງ ${deletingUser?.firstName} ${deletingUser?.lastName} (${deletingUser?.employeeCode})? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບບັນຊີ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
