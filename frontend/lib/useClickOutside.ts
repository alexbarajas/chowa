import { RefObject, useEffect } from "react";

/**
 * Calls `onOutsideClick` when a click happens outside the given ref's element.
 * Use for dropdowns/menus that should close when the user clicks elsewhere.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  onOutsideClick: () => void
) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onOutsideClick]);
}
