import { ChildProcess } from "child_process";
import { randomBytes } from "crypto";

export interface BackgroundCommand {
  id: string;
  name: string;
  startTime: number;
  process: ChildProcess;
  timeoutMs: number;
  stdout: string;
  stderr: string;
  status: "running" | "completed" | "error" | "cancelled" | "timeout";
  exitCode?: number | null;
  timeoutHandle?: NodeJS.Timeout;
}

export const backgroundCommands = new Map<string, BackgroundCommand>();

const COMPLETED_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** Remove finished commands that are older than COMPLETED_TTL_MS. Call before any read or write. */
export function pruneBackgroundCommands(): void {
  const now = Date.now();
  for (const [id, cmd] of backgroundCommands) {
    if (cmd.status !== "running" && now - cmd.startTime > COMPLETED_TTL_MS) {
      backgroundCommands.delete(id);
    }
  }
}

export function getRunningCommandsStatus(): string {
  const running = Array.from(backgroundCommands.values()).filter(c => c.status === "running");
  if (running.length === 0) return "";

  const now = Date.now();
  let statusStr = "Currently running background commands (Do not forget these are running!):\n";
  for (const cmd of running) {
    const durationSecs = Math.floor((now - cmd.startTime) / 1000);
    const durationStr = durationSecs > 60 
      ? `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s` 
      : `${durationSecs}s`;
    
    statusStr += `- ID: ${cmd.id} | Name: "${cmd.name}" | Duration: ${durationStr} | Timeout in: ${Math.floor((cmd.timeoutMs - (now - cmd.startTime))/1000)}s\n`;
  }
  return statusStr;
}

export function generateId(): string {
  return randomBytes(8).toString("hex");
}
