"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight, ArrowDownLeft, PenTool, Search, Filter, Download } from "lucide-react";
import Link from "next/link";
import { Transaction } from "@/types/firestore";

interface TransactionsClientProps {
  transactions: Transaction[];
}

export function TransactionsClient({ transactions }: TransactionsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get unique categories
  const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));

  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || (
      t.description.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower)
    );

    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    const dateA = a.date && typeof a.date === 'object' && 'toDate' in a.date ? (a.date as any).toDate() : new Date(a.date);
    const dateB = b.date && typeof b.date === 'object' && 'toDate' in b.date ? (b.date as any).toDate() : new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const resetFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-muted/10 p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Type:</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Category:</span>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(typeFilter !== "all" || statusFilter !== "all" || categoryFilter !== "all" || searchTerm) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Found {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
              <Button variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map(t => {
            const transactionDate = t.date && typeof t.date === 'object' && 'toDate' in t.date 
              ? (t.date as any).toDate() 
              : new Date(t.date);
            
            return (
              <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full shrink-0 ${t.type === 'Income' ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                      {t.type === 'Income' ? (
                        <ArrowDownLeft className={`h-6 w-6 ${t.type === 'Income' ? 'text-emerald-500' : 'text-destructive'}`} />
                      ) : (
                        <ArrowUpRight className={`h-6 w-6 ${t.type === 'Income' ? 'text-emerald-500' : 'text-destructive'}`} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t.description}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline" className="font-normal">{t.category}</Badge>
                        <span>•</span>
                        <span>{transactionDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-[3.25rem] sm:pl-0">
                    <div className="text-right">
                      <div className={`text-xl font-bold ${t.type === 'Income' ? 'text-emerald-500' : 'text-destructive'}`}>
                        {t.type === 'Income' ? '+' : '-'} R {t.amount.toLocaleString()}
                      </div>
                      <Badge variant={t.status === 'Completed' ? 'secondary' : 'outline'} className="mt-1">
                        {t.status}
                      </Badge>
                    </div>
                    <Link href={`/financials/${t.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <PenTool className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
