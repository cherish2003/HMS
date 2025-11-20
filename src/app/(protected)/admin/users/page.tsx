"use client";

import { useMemo, useState } from "react";
import { adminUsers } from "@/mocks/data/admin";
import { ROLE_LABELS, type UserRole } from "@/store/auth-store";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/types/core";

const STATUS_FILTERS: { label: string; value: UserStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "active" },
  { label: "Invited", value: "invited" },
  { label: "Suspended", value: "suspended" },
];

export default function AdminUsersPage() {
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((user) => {
      const statusMatches = statusFilter === "ALL" || user.status === statusFilter;
      const roleMatches = roleFilter === "ALL" || user.role === roleFilter;
      return statusMatches && roleMatches;
    });
  }, [statusFilter, roleFilter]);

  const distinctRoles = Array.from(new Set(adminUsers.map((user) => user.role)));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-subtle">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Administrators</h2>
            <p className="text-xs text-muted-foreground">
              Invite, suspend, or reassign permissions across campuses.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
              Export roster
            </button>
            <button className="rounded-lg border border-primary/40 bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-subtle transition-transform hover:-translate-y-0.5">
              Invite user
            </button>
          </div>
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === filter.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Role:</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as UserRole | "ALL")}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
            >
              <option value="ALL">All roles</option>
              {distinctRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border/80">
          <table className="min-w-full divide-y divide-border/70 text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Hospital</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {user.avatar ?? user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{humanizeHospital(user.hospitalId)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold",
                        user.status === "active"
                          ? "bg-primary/10 text-primary"
                          : user.status === "invited"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-primary">
                    <button className="mr-3 underline-offset-2 hover:underline">Edit</button>
                    <button className="underline-offset-2 hover:underline">Audit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function humanizeHospital(hospitalId: string) {
  switch (hospitalId) {
    case "medstar-central":
      return "Central Campus";
    case "medstar-royal":
      return "Royal Pavilion";
    case "medstar-coastal":
      return "Coastal Care";
    case "medstar-west":
      return "Western Hub";
    default:
      return hospitalId;
  }
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
