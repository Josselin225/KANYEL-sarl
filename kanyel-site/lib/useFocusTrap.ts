import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Fait boucler Tab/Shift+Tab à l'intérieur d'une modale tant qu'elle est ouverte,
 * puis rend le focus à l'élément déclencheur à la fermeture — pour que les
 * utilisateurs clavier/lecteur d'écran ne passent pas en douce sous l'overlay. */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    function getFocusable(): HTMLElement[] {
      return Array.from(container!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    }

    const [first] = getFocusable();
    (first ?? container).focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [active]);

  return ref;
}
