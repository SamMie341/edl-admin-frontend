'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Shield,
  KeyRound,
  Users,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DataTable,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useRoles,
  useDeleteRole,
} from '../application/use-roles.hook';
import { usePermission } from '@/core/application/use-permission.hook';
import { RoleFormModal } from './components/role-form-modal';
import { RoleDetailModal } from './components/role-detail-modal';
import { AssignRolePermissionsModal } from './components/assign-role-permissions-modal';
import type { RoleItem } from '../domain/role.types';
import { cn } from '@/lib/utils';

export function RolesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch roles from backend with pagination and search
  const { data: rolesResponse, isLoading, refetch, isRefetching } = useRoles({
    search: searchTerm,
    page,
    limit,
  });

  const deleteMutation = useDeleteRole();
  const { can, isSuperAdmin } = usePermission();

  const canCreate = can('ROLES', 'CREATE');
  const canUpdate = can('ROLES', 'UPDATE');
  const canDelete = can('ROLES', 'DELETE');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [assigningRole, setAssigningRole] = useState<RoleItem | null>(null);
  const [detailRole, setDetailRole] = useState<RoleItem | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleItem | null>(null);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const roles = rolesResponse?.data || [];
  const meta = rolesResponse?.meta || {
    total: roles.length,
    page,
    limit,
    totalPages: Math.ceil(roles.length / limit) || 1,
  };

  // Stats
  const totalUsersInRoles = useMemo(() => {
    return roles.reduce((acc, r) => acc + (r.userCount || 0), 0);
  }, [roles]);

  const handleCreate = () => {
    setSelectedRole(null);
    setFormModalOpen(true);
  };

  const handleEdit = (role: RoleItem) => {
    setSelectedRole(role);
    setFormModalOpen(true);
  };

  const handleViewDetail = (role: RoleItem) => {
    setDetailRole(role);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;
    try {
      await deleteMutation.mutateAsync(deletingRole.id);
      setDeletingRole(null);
    } catch {
      // Handled by hook error toast
    }
  };

  // Columns definition
  const columns: ColumnDef<RoleItem>[] = [
    {
      header: 'ລະຫັດ',
      className: 'w-[80px]',
      cell: (role) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-700 border border-slate-200/60 shadow-2xs">
          #{role.id}
        </span>
      ),
    },
    {
      header: 'ຊື່ບົດບາດ (Role Name)',
      cell: (role) => {
        const isSysAdmin = role.name === 'SUPERADMIN';
        return (
          <div className="flex items-start gap-3 py-1">
            <div
              className={cn(
                'h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                isSysAdmin
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              )}
            >
              {isSysAdmin ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs tracking-tight">
                  {role.name}
                </span>
                {isSysAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Lock className="h-2.5 w-2.5" />
                    System Role
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {role.description || 'ບໍ່ມີຄຳອະທິບາຍ'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'ຜູ້ໃຊ້ງານສັງກັດ',
      className: 'w-[140px]',
      cell: (role) => {
        const count = role.userCount ?? 0;
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border',
              count > 0
                ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                : 'bg-slate-50 text-slate-400 border-slate-200/60'
            )}
          >
            <Users className="h-3 w-3" />
            {count} ຄົນ
          </span>
        );
      },
    },
    {
      header: 'ສິດທິທີ່ຖືກກຳນົດ',
      className: 'w-[160px]',
      cell: (role) => {
        const count = role.permissionCount ?? (role.permissions?.length ?? 0);
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border',
              count > 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-rose-50 text-rose-700 border-rose-200/80'
            )}
          >
            <KeyRound className="h-3 w-3" />
            {count} ສິດທິ
          </span>
        );
      },
    },
    {
      header: 'ວັນທີສ້າງ',
      className: 'w-[150px]',
      cell: (role) => (
        <span className="text-xs text-slate-400">
          {role.createdAt ? format(new Date(role.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
        </span>
      ),
    },
    {
      header: <span className="text-right block pr-2">ຈັດການ</span>,
      className: 'w-[140px] text-right',
      cell: (role) => {
        const isSysAdmin = role.name === 'SUPERADMIN';
        const hasUsers = (role.userCount ?? 0) > 0;
        const deleteDisabled = isSysAdmin || hasUsers;

        let deleteTooltip = 'ລຶບບົດບາດ';
        if (isSysAdmin) {
          deleteTooltip = 'ບໍ່ສາມາດລຶບບົດບາດ SUPERADMIN ຂອງລະບົບໄດ້';
        } else if (hasUsers) {
          deleteTooltip = `ບໍ່ສາມາດລຶບໄດ້ ເນື່ອງຈາກຍັງມີຜູ້ໃຊ້ງານຈຳນວນ ${role.userCount} ຄົນສັງກັດຢູ່`;
        }

        return (
          <div className="flex items-center justify-end gap-1">
            {/* View Details */}
            <button
              type="button"
              onClick={() => handleViewDetail(role)}
              title="ເບິ່ງລາຍລະອຽດສິດທິ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Assign Permissions */}
            {canUpdate && (
              <button
                type="button"
                onClick={() => setAssigningRole(role)}
                title={
                  isSysAdmin
                    ? 'ບົດບາດ SUPERADMIN ມີສິດເຕັມ 100%'
                    : 'ກຳນົດສິດທິບົດບາດ (Assign Permissions)'
                }
                className={cn(
                  'p-1.5 rounded-lg transition cursor-pointer',
                  isSysAdmin
                    ? 'text-purple-600 bg-purple-50/70 hover:bg-purple-100'
                    : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                )}
              >
                <KeyRound className="h-4 w-4" />
              </button>
            )}

            {/* Edit */}
            {canUpdate && (
              <button
                type="button"
                onClick={() => handleEdit(role)}
                title="ແກ້ໄຂບົດບາດ & ສິດທິ"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}

            {/* Delete */}
            {canDelete && (
              <button
                type="button"
                onClick={() => !deleteDisabled && setDeletingRole(role)}
                disabled={deleteDisabled}
                title={deleteTooltip}
                className={cn(
                  'p-1.5 rounded-lg transition',
                  deleteDisabled
                    ? 'text-slate-300 cursor-not-allowed opacity-50'
                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                )}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              ບົດບາດທັງໝົດໃນລະບົບ
            </p>
            <p className="text-2xl font-black text-slate-800">
              {meta.total}{' '}
              <span className="text-xs font-medium text-slate-400">ບົດບາດ</span>
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              ຜູ້ໃຊ້ງານທີ່ຜູກບົດບາດແລ້ວ
            </p>
            <p className="text-2xl font-black text-slate-800">
              {totalUsersInRoles}{' '}
              <span className="text-xs font-medium text-slate-400">ບັນຊີ</span>
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              ລະບົບສິດທິ (Access Control)
            </p>
            <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5 pt-1">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              RBAC + Dynamic PBAC
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <KeyRound className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <DataTable
        title="ຈັດການສິດທິບົດບາດ (Roles & RBAC Management)"
        description="ຄຸ້ມຄອງບົດບາດ ແລະ ກຳນົດສິດທິການເຂົ້າເຖິງລະບົບ ຂອງ ລັດວິສາຫະກິດໄຟຟ້າລາວ"
        columns={columns}
        data={roles}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຊື່ບົດບາດ ຫຼື ຄຳອະທິບາຍ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={meta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={
          canCreate
            ? {
                label: 'ສ້າງບົດບາດໃໝ່',
                icon: <Plus className="h-4 w-4" />,
                onClick: handleCreate,
              }
            : undefined
        }
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

      {/* 3. Form Modal (Create / Edit Role & Permissions) */}
      <RoleFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        role={selectedRole}
      />

      {/* 4. Assign Permissions Modal (Direct PBAC / RBAC Configuration) */}
      <AssignRolePermissionsModal
        isOpen={Boolean(assigningRole)}
        onClose={() => setAssigningRole(null)}
        role={assigningRole}
      />

      {/* 5. Detail Modal */}
      <RoleDetailModal
        isOpen={Boolean(detailRole)}
        onClose={() => setDetailRole(null)}
        role={detailRole}
        onEdit={(role) => {
          setSelectedRole(role);
          setFormModalOpen(true);
        }}
        onAssignPermissions={(role) => {
          setAssigningRole(role);
        }}
        canEdit={canUpdate}
      />

      {/* 5. Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingRole)}
        onClose={() => setDeletingRole(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບບົດບາດ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບົດບາດ "${deletingRole?.name}"? ຖ້າລຶບແລ້ວ ຈະບໍ່ສາມາດກູ້ຄືນໄດ້.`}
        confirmLabel="ລຶບບົດບາດ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
