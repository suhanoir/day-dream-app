"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  User,
  Mail,
  Calendar,
  Target,
  CheckCircle2,
  LogOut,
  Sparkles,
} from "lucide-react";

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<{
    totalGoals: number;
    completedGoals: number;
    totalEvents: number;
  }>({
    totalGoals: 0,
    completedGoals: 0,
    totalEvents: 0,
  });

  useEffect(() => {
    if (isOpen && user) {
      // Fetch stats
      Promise.all([
        fetch("/api/stats").then((r) => r.ok ? r.json() : null),
        fetch("/api/events?filter=all").then((r) => r.ok ? r.json() : null),
      ]).then(([statsData, eventsData]) => {
        setStats({
          totalGoals: statsData?.stats?.totalGoals || 0,
          completedGoals: statsData?.stats?.completedGoals || 0,
          totalEvents: eventsData?.events?.length || 0,
        });
      }).catch((err) => console.error("Profile stats error:", err));
    }
  }, [isOpen, user]);

  if (!user) return null;

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={true}>
      <div className="space-y-6 text-center pt-2 pb-1">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-stone-900 text-stone-50 flex items-center justify-center text-xl font-bold mb-3 shadow-md">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <h3 className="text-lg font-bold text-stone-900">{user.name}</h3>
          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <Mail className="w-3.5 h-3.5" />
            {user.email}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Member since {joinDate}
          </p>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 text-center">
          <div className="p-2">
            <span className="text-xs text-stone-400 font-medium block mb-1">
              Goals
            </span>
            <span className="text-lg font-bold text-stone-900">
              {stats.totalGoals}
            </span>
          </div>

          <div className="p-2 border-x border-stone-200/60">
            <span className="text-xs text-stone-400 font-medium block mb-1">
              Completed
            </span>
            <span className="text-lg font-bold text-emerald-600">
              {stats.completedGoals}
            </span>
          </div>

          <div className="p-2">
            <span className="text-xs text-stone-400 font-medium block mb-1">
              Events
            </span>
            <span className="text-lg font-bold text-stone-900">
              {stats.totalEvents}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </Modal>
  );
}

