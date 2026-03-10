import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTransactions } from "@/lib/firestore";
import { DollarSign, TrendingUp, TrendingDown, FileText, Plus, ArrowUpRight, ArrowDownLeft, PenTool } from "lucide-react";
import Link from "next/link";
import { TransactionsClient } from "@/components/financials/TransactionsClient";

export default async function FinancialsPage() {
  const transactions = await fetchTransactions(100); // Fetch last 100 transactions

  const totalIncome = transactions
    .filter((t: any) => t.type === 'Income' && t.status === 'Completed')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === 'Expense' && t.status === 'Completed')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const pendingIncome = transactions
    .filter((t: any) => t.type === 'Income' && t.status === 'Pending')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Financials</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor league finances, track expenses, and manage billing.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-6 w-6 text-emerald-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Income</span>
                </div>
                <div className="text-3xl font-bold">R {totalIncome.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Expenses</span>
                </div>
                <div className="text-3xl font-bold">R {totalExpenses.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">Net Balance</span>
                </div>
                <div className={`text-3xl font-bold ${netBalance >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  R {netBalance.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transactions.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${t.type === 'Income' ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
                      {t.type === 'Income' ? (
                        <ArrowDownLeft className={`h-5 w-5 ${t.type === 'Income' ? 'text-emerald-500' : 'text-destructive'}`} />
                      ) : (
                        <ArrowUpRight className={`h-5 w-5 ${t.type === 'Income' ? 'text-emerald-500' : 'text-destructive'}`} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {t.category} • {new Date(t.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-xl font-bold ${t.type === 'Income' ? 'text-emerald-500' : 'text-destructive'}`}>
                      {t.type === 'Income' ? '+' : '-'} R {t.amount.toLocaleString()}
                    </div>
                    <Link href={`/financials/${t.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <PenTool className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsClient transactions={transactions as any} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Pending Invoices</CardTitle>
              </div>
              <div className="text-4xl font-bold text-primary mb-2">
                R {pendingIncome.toLocaleString()}
              </div>
              <p className="text-muted-foreground">
                Total outstanding revenue from sponsors and fees.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Outstanding Items</h3>
            {transactions.filter((t: any) => t.status === 'Pending').length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No pending invoices.</p>
                </CardContent>
              </Card>
            ) : (
              transactions.filter((t: any) => t.status === 'Pending').map((t: any) => (
                <Card key={t.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{t.description}</h3>
                        <p className="text-sm text-muted-foreground">Due: {t.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">R {t.amount.toLocaleString()}</span>
                        <Button size="sm">Mark Paid</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



