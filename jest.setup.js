import '@testing-library/jest-dom';

// jsdom no implementa matchMedia ni ResizeObserver; se mockean para los componentes.
if (typeof window !== 'undefined') {
  window.matchMedia =
    window.matchMedia ||
    function matchMedia() {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    };
}
