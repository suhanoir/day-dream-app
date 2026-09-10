"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { useSound } from "@/components/providers/SoundProvider";
import {
  ExpenseCategory,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_CONFIG,
  formatToDateKey,
  ExpenseData,
} from "./types";
import { IndianRupee, Calendar, Tag, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EditExpenseModalProps {
  expense: ExpenseData | null;
  isOpen: boolean;
  onClose: () => void;
  onExpenseUpdated: (expense: ExpenseData) => void;
  onExpenseDeleted: (id: string) => void;
}

export function EditExpenseModal({
  expense,
  isOpen,
  onClose,
  onExpenseUpdated,
  onExpenseDeleted,
}: EditExpenseModalProps) {
  const { success, error: toastError } = useToast();
  const { playSound } = useSound();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (expense && isOpen) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory((expense.category as ExpenseCategory) || "Food");
      setDate(formatToDateKey(new Date(expense.date)));
      setNotes(expense.notes || "");
      setFormError("");
    }
  }, [expense, isOpen]);

  if (!expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError("Please enter what you bought / expense name.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid price greater than zero.");
      return;
    }

    if (!date) {
      setFormError("Please select an expense date.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          amount: parsedAmount,
          category,
          date: `${date}T00:00:00.000Z`,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to update expense.");
        toastError(data.error || "Could not update expense.");
        return;
      }

      playSound("success");
      success("Expense updated!");
      onExpenseUpdated(data.expense);
      onClose();
    } catch {
      setFormError("Network error. Please try again.");
      toastError("Network error while updating expense.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toastError("Failed to delete expense");
        return;
      }

      playSound("delete");
      success("Expense deleted");
      onExpenseDeleted(expense.id);
      setShowConfirmDelete(false);
      onClose();
    } catch {
      toastError("Network error while deleting expense");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Expense"
        subtitle="Make changes to this expense record"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-700 font-medium">
              {formError}
            </div>
          )}

          {/* Expense Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              What I bought <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm font-medium"
            />
          </div>

          {/* Total Price & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-stone-400" />
                Total Price <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">
                  ₹
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-7 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const config = EXPENSE_CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-2.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 justify-center transition-all cursor-pointer",
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-2xs font-semibold"
                        : "bg-white text-stone-700 border-stone-200/80 hover:bg-stone-50"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side Notes */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              Optional Side Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Store name, warranty info, payment method..."
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete this expense? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}
