/**
 * Guarantee the desktop canvas fits the screen — and report whether it did.
 *
 * The page declares a fixed 1280px layout viewport so that the desktop layout
 * and its breakpoints are used on every device. Most mobile browsers then
 * shrink the page to fit the screen automatically. A few do not, leaving the
 * 1280px layout at 1:1 and letting the user pan sideways across a page they
 * can only ever see a third of. This forces the fit in that case by pinning
 * initial-scale to the real device width. It deliberately only runs when the
 * browser has NOT already shrunk the page (visualViewport.scale is still 1)
 * and the device is narrower than the canvas, so it never fights a browser
 * that got it right, and it is a no-op on desktop where the viewport meta is
 * ignored.
 *
 * It also marks the document with `.narrow-device`. Because the layout
 * viewport is pinned at 1280px, no media query can tell a phone from a
 * desktop — both report 1280 — so the class is the only way CSS learns the
 * screen is actually small. That is what swaps the desktop navigation for the
 * drawer toggle in styles.css.
 *
 * It publishes that same shrink factor as `--canvas-scale` too, so CSS can
 * undo it where it should: the header and the drawer are mobile chrome, and
 * they are sized for the hand rather than for the canvas (see styles.css).
 *
 * No inline script: the site's CSP is `script-src 'self'`, so this is served
 * as a normal same-origin file and included render-blocking from <head> so the
 * first paint is already fitted and already marked.
 */
(function () {
  var CANVAS = 1280;
  var DEFAULT_VIEWPORT = "width=" + CANVAS;

  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta) return;

  var vv = window.visualViewport;
  var root = document.documentElement;
  var knownNarrow = null;

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

  /**
   * Is the visitor really looking at a narrow screen?
   *
   * The first signal is the honest one: if the page was scaled down to fit,
   * the screen is smaller than the canvas. The second covers the moment
   * before a browser that refused to shrink has been corrected — but it only
   * counts when the layout viewport really is the fixed 1280px canvas, so a
   * desktop window (or a small monitor) is never mistaken for a phone.
   */
  function isNarrow() {
    if (vv && vv.scale < 0.999) return true;
    var width = deviceWidth();
    return width > 0 && width < CANVAS && window.innerWidth >= CANVAS - 1;
  }

  function syncNarrow() {
    var narrow = isNarrow();
    if (narrow === knownNarrow) return;
    var first = knownNarrow === null;
    knownNarrow = narrow;
    root.classList.toggle("narrow-device", narrow);
    if (!first) {
      document.dispatchEvent(new CustomEvent("narrowchange", { detail: { narrow: narrow } }));
    }
  }

  /**
   * How much the page is shrunk relative to the 1280px canvas.
   *
   * 1 on a screen wide enough to hold the canvas — including the moment
   * before a browser that refused to shrink has been corrected, and any
   * desktop window. CSS divides lengths by this to render them at true size.
   */
  function canvasScale() {
    if (vv && vv.scale < 0.999) return vv.scale;
    var width = deviceWidth();
    if (width > 0 && width < CANVAS && window.innerWidth >= CANVAS - 1) return width / CANVAS;
    return 1;
  }

  function publishScale() {
    root.style.setProperty("--canvas-scale", String(Math.round(canvasScale() * 100000) / 100000));
  }

  function update() {
    fit();
    publishScale();
    syncNarrow();
  }

  function refit() {
    // Reset first so the browser gets to try its own shrink-to-fit for the new
    // orientation, then re-check. Without this the forced scale would be
    // carried across a rotation.
    meta.setAttribute("content", DEFAULT_VIEWPORT);
    window.setTimeout(update, 120);
  }

  update();

  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", refit);
  // The shrink is not always settled by the time this script runs, so check
  // again once everything has loaded.
  window.addEventListener("load", update);
  if (vv) {
    vv.addEventListener("resize", update);
  }
})();
