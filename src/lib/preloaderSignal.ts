/**
 * Sygnał końca preloadera.
 *
 * Preloader ustawia stan "running" przy pierwszym renderze, a Hero czeka
 * z choreografią wejścia, aż kurtyna się podniesie. Gdy preloadera nie ma
 * (kolejna wizyta w sesji, inna podstrona), callback wykonuje się od razu.
 */

type PreloaderState = "idle" | "running" | "done";

const DONE_EVENT = "preloader:done";

let state: PreloaderState = "idle";

export const markPreloaderRunning = () => {
  state = "running";
};

export const markPreloaderDone = () => {
  state = "done";
  window.dispatchEvent(new Event(DONE_EVENT));
};

/** Wywołuje `callback` po zejściu kurtyny; zwraca funkcję sprzątającą. */
export const whenPreloaderDone = (callback: () => void): (() => void) => {
  if (state !== "running") {
    callback();
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(DONE_EVENT, handler, { once: true });
  return () => window.removeEventListener(DONE_EVENT, handler);
};
