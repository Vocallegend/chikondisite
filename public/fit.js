/**
 * Guarantee the desktop canvas fits the screen.
 *
 * The page declares a fixed 1280px layout viewport so that the desktop layout
 * and its breakpoints are used on every device. Most mobile browsers then
 * shrink the page to fit the screen automatically. A few do not, leaving the
 * 1280px layout at 1:1 and letting the user pan sideways across a page they
 * can only ever see a third of.
 *
 * This forces the fit in that case by pinning initial-scale to the real device
 * width. It deliberately only runs when the browser has NOT already shrunk the
 * page (visualViewport.scale is still 1) and the device is narrower than the
 * canvas, so it never fights a browser that got it right, and it is a no-op on
 * desktop where the viewport meta is ignored.
 *
 * No inline script: the site's CSP is `script-src 'self'`, so this is served
 * as a normal same-origin file and included render-blocking from <head> so the
 * first paint is already fitted.
 */
(function () {
  var CANVAS = 1280;
  var DEFAULT_VIEWPORT = "width=" + CANVAS;

  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;

  var vv = window.visualViewport;

  function deviceWidth() {
    return window.screen && window.screen.width ? window.screen.width : 0;
  }

  function fit() {
    // The browser already shrank the page to fit: leave it alone. This also
    // keeps the function idempotent, since forcing initial-scale drops
    // visualViewport.scale below 1.
    if (vv && vv.scale < 0.999) return;

    var width = deviceWidth();
    if (!width || width >= CANVAS) return;

    var scale = Math.round((width / CANVAS) * 100000) / 100000;
    meta.setAttribute("content", "width=" + CANVAS + ", initial-scale=" + scale);
  }

  function refit() {
    // Reset first so the browser gets to try its own shrink-to-fit for the new
    // orientation, then re-check. Without this the forced scale would be
    // carried across a rotation.
    meta.setAttribute("content", DEFAULT_VIEWPORT);
    window.setTimeout(fit, 120);
  }

  fit();

  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", refit);
  if (vv) {
    vv.addEventListener("resize", fit);
  }
})();
