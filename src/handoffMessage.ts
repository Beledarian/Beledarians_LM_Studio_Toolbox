export type HandoffExtraction = {
  response: string;
  handoffMessage?: string;
};

export function extractHandoffMessage(rawContent: string): HandoffExtraction {
  const markerRegex = /\[HANDOFF_MESSAGE\]([\s\S]*?)\[\/HANDOFF_MESSAGE\]/i;
  const markerMatch = rawContent.match(markerRegex);
  if (markerMatch) {
    const handoff = markerMatch[1].trim();
    const response = rawContent.replace(markerRegex, "").trim();
    return {
      response,
      handoffMessage: handoff || undefined,
    };
  }

  const candidates: Array<{ json: string; fullMatch?: string }> = [];
  const trimmed = rawContent.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    candidates.push({ json: trimmed });
  }

  const fenceRegex = /```json\s*([\s\S]*?)```/gi;
  let fenceMatch: RegExpExecArray | null;
  while ((fenceMatch = fenceRegex.exec(rawContent)) !== null) {
    candidates.push({ json: fenceMatch[1], fullMatch: fenceMatch[0] });
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.json);
      if (!parsed || typeof parsed !== "object") continue;

      const handoff =
        typeof (parsed as any).handoff_message === "string"
          ? (parsed as any).handoff_message.trim()
          : "";

      if (!handoff) continue;

      const explicitResponse =
        typeof (parsed as any).response === "string"
          ? (parsed as any).response.trim()
          : typeof (parsed as any).final_response === "string"
            ? (parsed as any).final_response.trim()
            : "";

      let response = explicitResponse;
      if (!response && candidate.fullMatch) {
        response = rawContent.replace(candidate.fullMatch, "").trim();
      }
      if (!response && !candidate.fullMatch) {
        response = "";
      }

      return {
        response,
        handoffMessage: handoff,
      };
    } catch {
      // Not valid JSON; continue scanning.
    }
  }

  return { response: rawContent };
}
