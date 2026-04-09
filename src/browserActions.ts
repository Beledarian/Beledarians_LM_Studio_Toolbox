export type BrowserAction =
  | { type: "wait_for_selector"; selector?: string }
  | { type: "wait"; milliseconds?: number }
  | { type: "click"; selector?: string }
  | { type: "type"; selector?: string; text?: string }
  | { type: "press"; key?: string }
  | { type: "select"; selector?: string; value?: string }
  | { type: "hover"; selector?: string }
  | { type: "scroll"; selector?: string; x?: number; y?: number }
  | { type: "evaluate"; script?: string };

export type BrowserLikePage = {
  waitForSelector(selector: string, options?: { timeout?: number }): Promise<unknown>;
  click(selector: string, options?: { clickCount?: number }): Promise<unknown>;
  type(selector: string, text: string, options?: { delay?: number }): Promise<unknown>;
  select(selector: string, ...values: string[]): Promise<string[]>;
  hover(selector: string): Promise<unknown>;
  keyboard: { press(key: string): Promise<unknown> };
  evaluate<T>(pageFunction: (...args: any[]) => T | Promise<T>, ...args: any[]): Promise<T>;
};

export async function executeBrowserActions(page: BrowserLikePage, actions: BrowserAction[]): Promise<string[]> {
  const actionLog: string[] = [];
  const clickRetryDelayMs = 300;

  const safeClick = async (selector: string, clickCount?: number) => {
    await page.waitForSelector(selector, { timeout: 15000 });
    const performClick = async () => {
      if (clickCount) {
        await page.click(selector, { clickCount });
      } else {
        await page.click(selector);
      }
    };

    try {
      await performClick();
      return;
    } catch {
      try {
        await new Promise(resolve => setTimeout(resolve, clickRetryDelayMs));
        await performClick();
        return;
      } catch {
        // Continue to DOM fallback.
      }

      const fallbackResult = await page.evaluate(
        ({ targetSelector, targetClickCount }) => {
          const target = document.querySelector(targetSelector);
          if (!(target instanceof HTMLElement)) {
            return { ok: false, reason: "not-an-element" };
          }

          target.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
          const rect = target.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) {
            return { ok: false, reason: "not-clickable" };
          }

          if (targetClickCount && targetClickCount >= 3 && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
            target.select();
          }
          target.click();
          return { ok: true };
        },
        { targetSelector: selector, targetClickCount: clickCount ?? 1 },
      );

      if (!fallbackResult?.ok) {
        const reason = fallbackResult?.reason || "unknown";
        throw new Error(`Action 'click' failed for selector '${selector}' (${reason}).`);
      }
    }
  };

  for (const action of actions) {
    if (action.type === "wait_for_selector") {
      if (!action.selector) throw new Error("Action 'wait_for_selector' requires 'selector'.");
      await page.waitForSelector(action.selector, { timeout: 15000 });
      actionLog.push(`wait_for_selector:${action.selector}`);
    } else if (action.type === "wait") {
      const ms = action.milliseconds ?? 500;
      await new Promise(resolve => setTimeout(resolve, ms));
      actionLog.push(`wait:${ms}`);
    } else if (action.type === "click") {
      if (!action.selector) throw new Error("Action 'click' requires 'selector'.");
      await safeClick(action.selector);
      actionLog.push(`click:${action.selector}`);
    } else if (action.type === "type") {
      if (!action.selector) throw new Error("Action 'type' requires 'selector'.");
      if (typeof action.text !== "string") throw new Error("Action 'type' requires 'text'.");
      await safeClick(action.selector, 3);
      await page.keyboard.press("Backspace");
      await page.type(action.selector, action.text, { delay: 20 });
      actionLog.push(`type:${action.selector}`);
    } else if (action.type === "press") {
      if (!action.key) throw new Error("Action 'press' requires 'key'.");
      await page.keyboard.press(action.key);
      actionLog.push(`press:${action.key}`);
    } else if (action.type === "select") {
      if (!action.selector) throw new Error("Action 'select' requires 'selector'.");
      if (typeof action.value !== "string") throw new Error("Action 'select' requires 'value'.");
      const selected = await page.select(action.selector, action.value);
      if (selected.length === 0) throw new Error(`Action 'select' found no matching option for '${action.value}'.`);
      actionLog.push(`select:${action.selector}`);
    } else if (action.type === "hover") {
      if (!action.selector) throw new Error("Action 'hover' requires 'selector'.");
      await page.hover(action.selector);
      actionLog.push(`hover:${action.selector}`);
    } else if (action.type === "scroll") {
      if (action.selector) {
        await page.evaluate((selector) => {
          const target = document.querySelector(selector);
          if (!target) throw new Error(`Selector not found: ${selector}`);
          target.scrollIntoView({ behavior: "auto", block: "center", inline: "nearest" });
        }, action.selector);
        actionLog.push(`scroll_into_view:${action.selector}`);
      } else {
        const x = action.x ?? 0;
        const y = action.y ?? 600;
        await page.evaluate(
          ({ dx, dy }) => { window.scrollBy(dx, dy); },
          { dx: x, dy: y },
        );
        actionLog.push(`scroll:${x},${y}`);
      }
    } else if (action.type === "evaluate") {
      if (!action.script) throw new Error("Action 'evaluate' requires 'script'.");
      await page.evaluate((script) => {
        // Intentionally executes custom page-side code for advanced automation.
        // eslint-disable-next-line no-new-func
        return Function(`"use strict";\n${script}`)();
      }, action.script);
      actionLog.push("evaluate");
    }
  }

  return actionLog;
}
