"use client";

import React, { useState } from "react";
import {
  Utensils,
  ShoppingBag,
  Plane,
  Receipt,
  GraduationCap,
  Film,
  HeartPulse,
  Tag,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  ExpenseData,
  EXPENSE_CATEGORY_CONFIG,
  formatCurrency,
  formatExpenseDate,
} from "./types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils/cn";

const categoryIconMap: Record<string, React.ReactNode> = {
  Food: <Utensils className="w-4 h-4" />,
  Shopping: <ShoppingBag className="w-4 h-4" />,
  Travel: <Plane className="w-4 h-4" />,
  Bills: <Receipt className="w-4 h-4" />,
  Education: <GraduationCap className="w-4 h-4" />,
  Entertainment: <Film className="w-4 h-4" />,
  Health: <HeartPulse className="w-4 h-4" />,
  Other: <Tag className="w-4 h-4" />,
};

interface ExpenseCardProps {
  expense: ExpenseData;
  onEdit: (expense: ExpenseData) => void;
  onDelete: (id: string) => Promise<void>;
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const config = EXPENSE_CATEGORY_CONFIG[expense.category] || EXPENSE_CATEGORY_CONFIG.Other;
  const icon = categoryIconMap[expense.category] || <Tag className="w-4 h-4" />;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(expense.id);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs hover:border-stone-300 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Category Icon + Title & Notes */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
              config.bg
            )}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-stone-900 text-sm tracking-tight truncate">
                {expense.title}
              </h3>
              <span
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider",
                  config.badge
                )}
              >
                {expense.category}
              </span>
            </div>

            {expense.notes && (
              <p className="text-xs text-stone-500 line-clamp-2">
                {expense.notes}
              </p>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <Calendar className="w-3 h-3 text-stone-400" />
              <span>{formatExpenseDate(expense.date)}</span>
            </div>
          </div>
        </div>

        {/* Right: Amount + Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="text-right">
            <div className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
              {formatCurrency(expense.amount)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Edit Expense"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Expense"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expense.title}" (${formatCurrency(expense.amount)})? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}
