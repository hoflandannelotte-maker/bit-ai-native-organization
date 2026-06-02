/* App — composes the Company Brain: the 3D scene, the solid Bit-navy legend
   block (left), the explorable detail panel (right), the rocket fly-by and
   the Tweaks. */
(function () {
  const { useState, useEffect, useMemo, useRef, useCallback } = React;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
    blue: "#12307F",
    warm: "#D8CFB8",
    motion: "calm",
    rocket: true,
  } /*EDITMODE-END*/;

  function App() {
    const BRAIN = window.BRAIN;
    const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
    const colors = useMemo(() => window.THEME.palette(t.blue, t.warm), [t.blue, t.warm]);

    const wrapRef = useRef(null);
    const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
    useEffect(() => {
      const update = () => {
        const el = wrapRef.current;
        if (el) setSize({ w: el.clientWidth, h: el.clientHeight });
      };
      update();
      const ro = new ResizeObserver(update);
      if (wrapRef.current) ro.observe(wrapRef.current);
      window.addEventListener("resize", update);
      return () => { ro.disconnect(); window.removeEventListener("resize", update); };
    }, []);

    const W = size.w || window.innerWidth;
    const H = size.h || window.innerHeight;

    const [selected, setSelected] = useState(null);
    const [autoRotate, setAutoRotate] = useState(true);
    const sceneApi = useRef(null);

    const onSelect = useCallback((id) => {
      if (id && id.indexOf("~a") > -1) id = id.split("~a")[0]; // agent → its fleet
      setSelected(id);
    }, []);
    const close = useCallback(() => setSelected(null), []);
    const noop = useCallback(() => {}, []);
    const registerScene = useCallback((api) => { sceneApi.current = api; }, []);

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") setSelected(null); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    const lpad = Math.min(440, W * 0.34);
    const cxFrac = ((lpad + (W - lpad) * 0.5) / W) * 100;
    const shift = selected ? -Math.min(220, W * 0.16) : 0;

    return React.createElement(
      "div",
      {
        ref: wrapRef,
        style: {
          position: "fixed", inset: 0, overflow: "hidden",
          background: `radial-gradient(120% 120% at ${cxFrac}% 50%, ${colors.bg0}, ${colors.bg1} 70%)`,
          color: colors.text, fontFamily: "'Roobert', system-ui, sans-serif",
        },
      },
      // rocket fly-by (behind the legend block, above the universe)
      React.createElement(Rocket, { enabled: !!t.rocket, warm: colors.warm }),

      // sliding 3D stage (shifts left when the panel opens)
      React.createElement(
        "div",
        { style: { position: "absolute", inset: 0, transform: `translateX(${shift}px)`, transition: "transform .42s cubic-bezier(.22,.61,.36,1)" } },
        React.createElement(window.Scene3D, {
          size: { w: W, h: H }, colors, motion: t.motion, autoRotate, selected,
          onSelect, setActive: noop, BRAIN, _register: registerScene,
        })
      ),

      // ---- the solid Bit-navy legend block (left) ----
      React.createElement(LegendBlock, { colors, width: lpad }),

      // bottom controls (in the universe, to the right of the block)
      React.createElement(
        "div",
        { style: { position: "absolute", left: `calc(${cxFrac}% + ${shift}px)`, transform: "translateX(-50%)", bottom: 28, zIndex: 45, display: "flex", alignItems: "center", gap: 10, transition: "left .42s cubic-bezier(.22,.61,.36,1)" } },
        React.createElement(Btn, { colors, onClick: () => sceneApi.current && sceneApi.current.reset() }, "Reset view"),
        React.createElement(Btn, { colors, active: autoRotate, onClick: () => setAutoRotate((v) => !v) },
          React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: autoRotate ? colors.warm : "transparent", border: `1.5px solid ${colors.warm}`, display: "inline-block", marginRight: 7, verticalAlign: "middle" } }),
          "Auto-rotate")
      ),

      React.createElement(window.DetailPanel, { BRAIN, selected, colors, onClose: close, onSelect }),

      // Tweaks
      React.createElement(
        window.TweaksPanel, null,
        React.createElement(window.TweakSection, { label: "Universe" }),
        React.createElement(window.TweakColor, { label: "Bit blue", value: t.blue, options: window.THEME.BLUES, onChange: (v) => setTweak("blue", v) }),
        React.createElement(window.TweakColor, { label: "Warm accent", value: t.warm, options: window.THEME.WARMS, onChange: (v) => setTweak("warm", v) }),
        React.createElement(window.TweakSection, { label: "Motion" }),
        React.createElement(window.TweakRadio, { label: "Data flow", value: t.motion, options: ["still", "calm", "lively"], onChange: (v) => setTweak("motion", v) }),
        React.createElement(window.TweakSection, { label: "Extras" }),
        React.createElement(window.TweakToggle, { label: "Rocket fly-by", value: !!t.rocket, onChange: (v) => setTweak("rocket", v) })
      )
    );
  }

  // ------------------------------------------------------------------ block
  function LegendBlock({ colors, width }) {
    const c = colors;
    const ink = c.block;                 // Bit dark blue
    const bodyInk = "rgba(16,26,58,0.64)";
    const items = [
      ["brain", "Company Brain", "Intelligence + all company data"],
      ["fleet", "Fleets", "Specialised teams of AI agents"],
      ["human", "Humans", "In control — steering & approving"],
      ["external", "External data", "A live link to the outside world"],
    ];
    return React.createElement(
      "div",
      {
        style: {
          position: "absolute", left: 0, top: 0, height: "100%", width,
          background: "#FFFFFF", zIndex: 40,
          boxShadow: "24px 0 70px rgba(2,6,20,0.40)",
          display: "flex", flexDirection: "column", padding: "40px 40px 30px",
          overflow: "auto",
        },
      },
      React.createElement("img", { src: "images/bit-circle.png", alt: "Bit", style: { height: 44, width: 44, display: "block", marginBottom: "auto" } }),
      React.createElement("div", { style: { marginTop: 34 } },
        React.createElement("h1", { style: { margin: 0, fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 0.96, fontWeight: 800, letterSpacing: "-0.03em", color: ink } },
          "The", React.createElement("br"), "Company", React.createElement("br"), "Brain"),
        React.createElement("p", { style: { fontSize: "clamp(15px,1.15vw,17px)", lineHeight: 1.5, color: bodyInk, marginTop: 22, maxWidth: 360 } },
          "An AI-native operating model. Intelligence at the core, fleets of specialised agents around it, and people in control.")
      ),
      React.createElement("div", { style: { marginTop: 34, display: "flex", flexDirection: "column", gap: 18 } },
        items.map(([kind, label, sub], i) =>
          React.createElement("div", { key: i, style: { display: "flex", gap: 16, alignItems: "flex-start" } },
            React.createElement("div", { style: { width: 26, flex: "none", display: "flex", justifyContent: "center", paddingTop: 1 } },
              React.createElement(LegendIcon, { kind, ink })),
            React.createElement("div", null,
              React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: ink, lineHeight: 1.1 } }, label),
              React.createElement("div", { style: { fontSize: 13.5, color: bodyInk, marginTop: 3, lineHeight: 1.35 } }, sub))
          )
        )
      ),
      React.createElement("div", { style: { marginTop: 30, paddingTop: 18, borderTop: "1px solid rgba(18,30,70,0.14)", display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 500, color: bodyInk } },
        React.createElement(SpinGlyph, { ink }),
        "Drag the planet to rotate · click any node")
    );
  }

  function SpinGlyph({ ink }) {
    const col = ink || "#12307F";
    return React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", style: { flex: "none" } },
      React.createElement("path", { d: "M13 8a5 5 0 1 1-1.46-3.54", stroke: col, strokeWidth: 1.5, strokeLinecap: "round" }),
      React.createElement("path", { d: "M11 1.5V5H7.5", stroke: col, strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" })
    );
  }

  function LegendIcon({ kind, ink }) {
    const col = ink || "#12307F";
    if (kind === "brain")
      return React.createElement("div", { style: { width: 16, height: 16, borderRadius: "50%", background: col } });
    if (kind === "fleet")
      return React.createElement("div", { style: { width: 15, height: 15, borderRadius: "50%", border: `2px solid ${col}`, background: "transparent" } });
    if (kind === "external")
      return React.createElement("div", { style: { width: 15, height: 15, borderRadius: "50%", border: `2px solid ${col}`, background: "transparent", position: "relative" } },
        React.createElement("div", { style: { position: "absolute", inset: "1px 4px", borderRadius: "50%", border: `1px solid ${col}` } }));
    // human glyph
    return React.createElement(
      "div",
      { style: { width: 16, height: 16, position: "relative" } },
      React.createElement("div", { style: { position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: col } }),
      React.createElement("div", { style: { position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: 15, height: 8, borderTopLeftRadius: 9, borderTopRightRadius: 9, background: col } })
    );
  }

  // ------------------------------------------------------------------ rocket
  function Rocket({ enabled, warm }) {
    const ref = useRef(null);
    useEffect(() => {
      if (!enabled) return;
      let timer = null, raf = null;
      const fly = () => {
        const el = ref.current; if (!el) return;
        const vw = window.innerWidth, vh = window.innerHeight;
        const y0 = vh * (0.55 + Math.random() * 0.4);
        const y1 = vh * (0.02 + Math.random() * 0.28);
        const x0 = -90, x1 = vw + 130;
        const dur = 5200 + Math.random() * 2400;
        const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI; // travel angle
        const rot = ang + 45; // apple rocket nose points NE (-45deg)
        el.style.transition = "none";
        el.style.opacity = "0";
        el.style.transform = `translate(${x0}px, ${y0}px) rotate(${rot}deg)`;
        el.getBoundingClientRect();
        raf = requestAnimationFrame(() => {
          el.style.transition = `transform ${dur}ms linear, opacity .6s ease`;
          el.style.opacity = "1";
          el.style.transform = `translate(${x1}px, ${y1}px) rotate(${rot}deg)`;
        });
        setTimeout(() => { if (ref.current) ref.current.style.opacity = "0"; }, dur - 500);
        timer = setTimeout(fly, dur + 8000 + Math.random() * 10000);
      };
      timer = setTimeout(fly, 2600 + Math.random() * 3500);
      return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
    }, [enabled]);
    if (!enabled) return null;
    return React.createElement("div", {
      ref,
      style: {
        position: "fixed", left: 0, top: 0, fontSize: 30, lineHeight: 1, zIndex: 20,
        pointerEvents: "none", willChange: "transform, opacity", opacity: 0,
        filter: `drop-shadow(0 0 12px ${warm}88)`,
      },
    }, "🚀");
  }

  function Btn({ colors, onClick, active, children }) {
    return React.createElement(
      "button",
      {
        onClick,
        style: {
          font: "inherit", fontSize: 12.5, fontWeight: 500, cursor: "pointer",
          color: colors.text, background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${active ? colors.warm : colors.nodeBorder}`,
          borderRadius: 999, padding: "8px 15px", display: "inline-flex", alignItems: "center",
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", transition: "border-color .2s, background .2s",
        },
      },
      children
    );
  }

  window.App = App;
})();
