"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { MonthNavigator } from "@/components/expenses/MonthNavigator";
import { MonthlyTotalCard } from "@/components/expenses/MonthlyTotalCard";
import { ExpenseFilterBar } from "@/components/expenses/ExpenseFilterBar";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { AddExpenseModal } from "@/components/expenses/AddExpenseModal";
import { EditExpenseModal } from "@/components/expenses/EditExpenseModal";
import {
  ExpenseData,
  MonthlyExpenseSummary,
  formatMonthYear,
  formatExpenseDate,
} from "@/components/expenses/types";
import { useToast } from "@/components/providers/ToastProvider";
import { Plus, Receipt, Loader2, Inbox } from "lucide-react";

export default function ExpensesPage() {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [summary, setSummary] = useState<MonthlyExpenseSummary>({
    monthlyTotal: 0,
    count: 0,
    categoryBreakdown: {},
    topCategory: null,
    dailyAverage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] =
    useState<ExpenseData | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const params = new URLSearchParams();
      params.append("year", String(year));
      params.append("month", String(month));
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) {
        toastError("Failed to load expenses");
        return;
      }

      const data = await res.json();
      setExpenses(data.expenses || []);
      setSummary({
        monthlyTotal: data.monthlyTotal || 0,
        count: data.count || 0,
        categoryBreakdown: data.categoryBreakdown || {},
        topCategory: data.topCategory || null,
        dailyAverage: data.dailyAverage || 0,
      });
    } catch {
      toastError("Network error while loading expenses");
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, categoryFilter, toastError]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, fetchExpenses]);

  // Client-side search filtering
  const filteredExpenses = useMemo(() => {
    if (!search.trim()) return expenses;
    const query = search.toLowerCase().trim();
    return expenses.filter(
      (exp) =>
        exp.title.toLowerCase().includes(query) ||
        (exp.notes && exp.notes.toLowerCase().includes(query)) ||
        exp.category.toLowerCase().includes(query)
    );
  }, [expenses, search]);

  const handleExpenseAdded = (newExpense: ExpenseData) => {
    const expenseDate = new Date(newExpense.date);
    if (
      expenseDate.getFullYear() === currentDate.getFullYear() &&
      expenseDate.getMonth() === currentDate.getMonth()
    ) {
      setExpenses((prev) => [newExpense, ...prev]);
      setSummary((prev) => {
        const nextTotal = Number((prev.monthlyTotal + newExpense.amount).toFixed(2));
        const nextCount = prev.count + 1;
        const nextCatBreakdown = {
          ...prev.categoryBreakdown,
          [newExpense.category]: (prev.categoryBreakdown[newExpense.category] || 0) + newExpense.amount,
        };
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        return {
          ...prev,
          monthlyTotal: nextTotal,
          count: nextCount,
          categoryBreakdown: nextCatBreakdown,
          dailyAverage: Number((nextTotal / daysInMonth).toFixed(2)),
        };
      });
    } else {
      setCurrentDate(expenseDate);
    }
  };

  const handleExpenseUpdated = (updatedExpense: ExpenseData) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
    fetchExpenses();
  };

  const handleExpenseDeleted = (deletedId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== deletedId));
    fetchExpenses();
  };

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col selection:bg-stone-900 selection:text-stone-50">
      <DashboardHeader />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Top Title & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                Expenses
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                Budget & Tracking
              </span>
            </div>
            <p className="text-sm text-stone-500">
              Track your spending, manage monthly budgets, and make mindful decisions.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="font-semibold shadow-sm self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </Button>
        </div>

        {/* Month Navigation Toolbar */}
        <MonthNavigator
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
        />

        {/* Monthly Total & Statistics Card */}
        <MonthlyTotalCard
          currentDate={currentDate}
          monthlyTotal={summary.monthlyTotal}
          count={summary.count}
          topCategory={summary.topCategory}
          dailyAverage={summary.dailyAverage}
          isLoading={isLoading}
        />

        {/* Filter Bar (Search & Category Pills) */}
        <ExpenseFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedCategory={categoryFilter}
          onCategoryChange={setCategoryFilter}
          categoryBreakdown={summary.categoryBreakdown}
        />

        {/* Expense List */}
        <div className="space-y-3 pt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs font-medium">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">
                  {search || categoryFilter !== "all"
                    ? "No matching expenses found"
                    : `No expenses recorded for ${formatMonthYear(currentDate)}`}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {search || categoryFilter !== "all"
                    ? "Try adjusting your search query or selecting a different category."
                    : "Keep track of your spending by adding what you bought, the amount, and category."}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="font-semibold shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add First Expense
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={(exp) => setSelectedExpenseForEdit(exp)}
                  onDelete={async () => handleExpenseDeleted(expense.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onExpenseAdded={handleExpenseAdded}
        initialDate={currentDate}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        expense={selectedExpenseForEdit}
        isOpen={Boolean(selectedExpenseForEdit)}
        onClose={() => setSelectedExpenseForEdit(null)}
        onExpenseUpdated={handleExpenseUpdated}
        onExpenseDeleted={handleExpenseDeleted}
      />
    </div>
  );
}
