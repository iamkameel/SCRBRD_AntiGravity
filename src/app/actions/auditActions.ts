"use server";

import { recordAuditLog, getRecentAuditLogs, AuditLogEntry } from "@/lib/services/auditService";
import { revalidatePath } from "next/cache";

/**
 * Server action to record an audit log entry.
 */
export async function recordAuditAction(entry: Omit<AuditLogEntry, "timestamp">) {
    await recordAuditLog(entry);
    revalidatePath("/dashboard");
    revalidatePath("/admin");
}

/**
 * Server action to fetch recent audit logs.
 */
export async function getRecentAuditLogsAction(schoolId?: string, count?: number) {
    return await getRecentAuditLogs(schoolId, count);
}
