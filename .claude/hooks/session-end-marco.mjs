// Hook SessionEnd: envia resumo da sessão do Claude Code para o n8n → Marco inbox.
// Token lido do .env (CC_HOOK_TOKEN) — nunca hardcodar (repo pode ser público).
// Sempre sai com código 0: falha de captura não pode atrapalhar o fim da sessão.
import { readFileSync, existsSync } from "node:fs";
import { basename, join } from "node:path";

const WEBHOOK_URL = "https://workflowsmatriz.cassinweb.shop/webhook/marco-claude-code";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function readHookToken(cwd) {
  for (const dir of [cwd, process.cwd()]) {
    const envPath = join(dir || ".", ".env");
    if (!existsSync(envPath)) continue;
    const line = readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("CC_HOOK_TOKEN="));
    if (line) return line.slice("CC_HOOK_TOKEN=".length).trim();
  }
  return null;
}

function firstUserMessage(transcriptPath) {
  try {
    const lines = readFileSync(transcriptPath, "utf8").split("\n");
    let count = 0;
    let first = null;
    for (const line of lines) {
      if (!line.trim()) continue;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      const msg = entry.message;
      if (entry.type === "user" && msg && typeof msg.content === "string" && msg.content.trim()) {
        count += 1;
        if (!first) first = msg.content.trim();
      } else if (entry.type === "user" && msg && Array.isArray(msg.content)) {
        const textBlock = msg.content.find((b) => b.type === "text" && b.text && b.text.trim());
        if (textBlock) {
          count += 1;
          if (!first) first = textBlock.text.trim();
        }
      }
    }
    return { first, count };
  } catch {
    return { first: null, count: 0 };
  }
}

async function main() {
  const input = JSON.parse(readStdin() || "{}");
  const cwd = input.cwd || process.cwd();
  const token = readHookToken(cwd);
  if (!token) return;

  const { first, count } = firstUserMessage(input.transcript_path || "");
  if (count === 0) return; // sessão vazia — nada a registrar

  const project = basename(cwd);
  const snippet = (first || "").replace(/\s+/g, " ").slice(0, 280);
  const text = `Sessão de trabalho no Claude Code — projeto ${project} (${count} interações). Tema: ${snippet}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-marco-hook-token": token,
      },
      body: JSON.stringify({ text, project, interactions: count }),
      signal: controller.signal,
    });
  } catch {
    // silencioso de propósito
  } finally {
    clearTimeout(timer);
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(0));
