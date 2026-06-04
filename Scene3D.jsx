/* Scene3D — the Company Brain as a real, drag-to-rotate 3D system (Bit edition).
   A clean white dot-sphere (the brain) at the centre, with fleet nodes and a
   human ring orbiting it in 3D, on a Bit-navy universe. Click a fleet to fan
   out its agents. Two fleets are wired to each other. External data couples
   the brain to the world. Hand-rolled perspective, depth sort, inertia. */
(function () {
  const { useRef, useEffect } = React;

  function rgba(hex, a) {
    const h = hex.replace("#", "");
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TAU = 6.28318530718;

  // ---- build the unrotated 3D model from the data + viewport size ----------
  function build(BRAIN, w, h, lpadOverride) {
    const lpad = lpadOverride != null ? lpadOverride : Math.min(440, w * 0.34); // the solid legend block
    const cx = lpad + (w - lpad) * 0.5;
    const cy = h * 0.52;
    const base = Math.min(w - lpad, h);
    const R0 = base * 0.15;    // brain radius
    const R1 = base * 0.32;    // fleet ring
    const RA = base * 0.46;    // agent ring (its own band, between fleets and humans)
    const R2 = base * 0.62;    // human ring (pushed out so agents have room)
    const R3 = base * 0.92;    // external — well clear of the human ring
    const F = base * 2.1;      // focal length

    const onRing = (deg, r, lat) => {
      const t = (deg * Math.PI) / 180;
      return { x: Math.cos(t) * r, y: lat || 0, z: Math.sin(t) * r };
    };

    // brain dot-sphere — a single, even fibonacci shell (clean, not busy)
    const dots = [];
    const N = 540;
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.399963229;
      dots.push({ x: Math.cos(th) * r * R0, y: y * R0, z: Math.sin(th) * r * R0 });
    }

    // three guide rings around the brain (flat z-plane, drawn subtly)
    const rings = [
      { r: R1, kind: "fleet" },
      { r: RA, kind: "agent" },
      { r: R2, kind: "human" },
    ];

    const nodes = [{ id: "core", type: "core", p: { x: 0, y: 0, z: 0 } }];
    const conns = [];
    const fleetPos = {};
    let seed = 0; const sd = () => ((seed = (seed + 0.137) % 1), seed);

    BRAIN.TEAMS.forEach((team, i) => {
      const tDeg = -90 + i * 72;
      const humanP = onRing(tDeg, R2, 0);
      nodes.push({ id: "team-" + team.id, type: "human", teamId: team.id, p: humanP, label: team.name });
      const n = team.fleets.length;
      const span = Math.min(46, (n - 1) * 14);
      team.fleets.forEach((f, j) => {
        const off = n > 1 ? (j - (n - 1) / 2) * (span / (n - 1)) : 0;
        const fDeg = tDeg + off;
        const p = onRing(fDeg, R1, 0);
        fleetPos[f.id] = p;
        nodes.push({ id: f.id, type: "fleet", teamId: team.id, p, label: f.name });
        conns.push({ a: { x: 0, y: 0, z: 0 }, b: p, kind: "spoke", teamId: team.id, fleetId: f.id, seed: sd() });
        conns.push({ a: humanP, b: p, kind: "human", teamId: team.id, fleetId: f.id, seed: sd() });
        // agents sit on their OWN ring (RA), tightly fanned around the fleet's
        // angle so they never bleed into neighbouring teams. Shown on select.
        const m = f.agents.length;
        const aSpan = Math.min(20, (m - 1) * 6); // tight fan, in degrees
        f.agents.forEach((aName, k) => {
          const aOff = m > 1 ? (k - (m - 1) / 2) * (aSpan / (m - 1)) : 0;
          const ap = onRing(fDeg + aOff, RA, 0);
          nodes.push({ id: f.id + "~a" + k, type: "agent", teamId: team.id, fleetId: f.id, p: ap, label: aName });
          conns.push({ a: p, b: ap, kind: "agent", fleetId: f.id, seed: sd() });
        });
      });
    });

    // external coupling — out to the right and lifted up, well clear of the rings
    const extP = onRing(-28, R3, R0 * 0.9);
    nodes.push({ id: "external", type: "external", p: extP, label: "External data" });
    conns.push({ a: { x: 0, y: 0, z: 0 }, b: extP, kind: "external", seed: sd() });

    // a tiny dot-sphere for the external node, so it reads as a mini-brain
    const extDots = [];
    const NE = 80, RE = base * 0.03;
    for (let i = 0; i < NE; i++) {
      const y = 1 - (i / (NE - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * 2.399963229;
      extDots.push({ x: Math.cos(th) * r * RE, y: y * RE, z: Math.sin(th) * r * RE });
    }

    // cross-fleet communication links — each one bows in its OWN direction and
    // height, so the set fans out all around the sphere (over, under, left,
    // right, short and wide) instead of forming a symmetric basket.
    BRAIN.LINKS.forEach((lk, li) => {
      const A = fleetPos[lk.a], B = fleetPos[lk.b];
      if (!A || !B) return;
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, mz = (A.z + B.z) / 2;
      const span = Math.hypot(B.x - A.x, B.y - A.y, B.z - A.z);

      // a stable pseudo-random per link (varies direction + height, no flicker)
      const r1 = (Math.sin(li * 12.9898) * 43758.5453) % 1;
      const r2 = (Math.sin(li * 78.233) * 12543.123) % 1;
      const r3 = (Math.sin(li * 39.425) * 24634.642) % 1;
      const rnd = (x) => (x < 0 ? x + 1 : x);
      const a1 = rnd(r1) * TAU;            // azimuth of the bow
      const a2 = (rnd(r2) - 0.5) * Math.PI; // elevation: above or below
      const hgt = 0.28 + rnd(r3) * 0.32;    // gentle, low bow (no high loft)

      // direction the arc bulges toward, in 3D
      const dir = {
        x: Math.cos(a2) * Math.cos(a1),
        y: Math.sin(a2),
        z: Math.cos(a2) * Math.sin(a1),
      };
      const lift = (R0 * 0.18 + span * 0.22) * hgt;
      const ctrl = { x: mx + dir.x * lift, y: my + dir.y * lift, z: mz + dir.z * lift };

      const SEG = 30, path = [];
      for (let s = 0; s <= SEG; s++) {
        const u = s / SEG, v = 1 - u;
        path.push({
          x: v * v * A.x + 2 * v * u * ctrl.x + u * u * B.x,
          y: v * v * A.y + 2 * v * u * ctrl.y + u * u * B.y,
          z: v * v * A.z + 2 * v * u * ctrl.z + u * u * B.z,
        });
      }
      conns.push({ a: A, b: B, path, kind: "comms", aId: lk.a, bId: lk.b, seed: sd() });
    });

    return { cx, cy, base, R0, F, dots, nodes, conns, rings, extDots };
  }

  function Scene3D(props) {
    const canvasRef = useRef(null);
    const layerRef = useRef(null);
    const pr = useRef(props);
    pr.current = props;

    useEffect(() => {
      const canvas = canvasRef.current;
      const layer = layerRef.current;
      const ctx = canvas.getContext("2d");
      let raf, running = true, dpr = 1, curW = 0, curH = 0;
      let model = null, modelKey = "";
      const labelEls = {};

      const DEF_X = 0.62, DEF_Y = 0.0;
      let rotX = DEF_X, rotY = DEF_Y, velX = 0, velY = 0;
      let dragging = false, lastX = 0, lastY = 0, moved = 0;
      let tween = null;
      let hover = null;
      let hitList = [];
      let cxShift = 0; // eases the brain toward screen-centre when the legend hides

      function fit(w, h) {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        canvas.style.width = w + "px"; canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        curW = w; curH = h;
      }

      function ensureModel(w, h) {
        const key = w + "x" + h;
        if (key === modelKey && model) return;
        modelKey = key;
        model = build(pr.current.BRAIN, w, h);
        layer.innerHTML = "";
        for (const k in labelEls) delete labelEls[k];
        model.nodes.forEach((n) => {
          if (n.type === "core") return;
          const el = document.createElement("div");
          el.style.cssText =
            "position:absolute;left:0;top:0;white-space:nowrap;pointer-events:none;" +
            "font-family:'Roobert',sans-serif;will-change:transform,opacity;";
          el.textContent = n.label;
          layer.appendChild(el);
          labelEls[n.id] = el;
        });
      }

      function view(p) {
        const cy_ = Math.cos(rotY), sy_ = Math.sin(rotY);
        let x = p.x * cy_ + p.z * sy_;
        let z = -p.x * sy_ + p.z * cy_;
        const cx_ = Math.cos(rotX), sx_ = Math.sin(rotX);
        const y = p.y * cx_ - z * sx_;
        z = p.y * sx_ + z * cx_;
        return { x, y, z };
      }
      function project(q) {
        const k = model.F / (model.F - q.z);
        return { x: model.cx + cxShift + q.x * k, y: model.cy - q.y * k, k, z: q.z };
      }

      function speed(m) { return m === "still" ? 0 : m === "lively" ? 0.62 : 0.3; }
      function pcount(kind, m) {
        if (m === "still") return kind === "external" || kind === "comms" ? 3 : 0;
        const b = kind === "external" ? 12 : kind === "comms" ? 6 : kind === "agent" ? 2 : kind === "spoke" ? 2 : 1;
        return m === "lively" ? b + 2 : b;
      }

      // selection helpers
      function ctx2(P) {
        const sel = P.selected;
        let selFleet = null, selTeam = null;
        if (sel && sel.indexOf("team-") === 0) selTeam = sel.slice(5);
        else if (sel) {
          for (const team of P.BRAIN.TEAMS) {
            if (team.fleets.find((f) => f.id === sel)) { selFleet = sel; selTeam = team.id; break; }
          }
        }
        return { sel, selFleet, selTeam };
      }

      function frame(ts) {
        if (!running) return;
        const P = pr.current;
        const { w, h } = P.size;
        if (w !== curW || h !== curH) fit(w, h);
        ensureModel(w, h);
        const c = P.colors;
        const { sel, selFleet, selTeam } = ctx2(P);
        const t = ts / 1000;
        const focus = !!selFleet; // focus mode dims the rest

        // when a fleet is selected the left legend slides away, so glide the
        // brain toward the centre of the now-full canvas
        const lpadNow = Math.min(440, w * 0.34);
        const cxTarget = focus ? -lpadNow / 2 : 0;
        cxShift += (cxTarget - cxShift) * 0.12;
        if (Math.abs(cxTarget - cxShift) < 0.4) cxShift = cxTarget;

        if (tween) {
          const k = clamp((t - tween.t0) / 0.6, 0, 1);
          const e = 1 - Math.pow(1 - k, 3);
          rotX = tween.fromX + (DEF_X - tween.fromX) * e;
          rotY = tween.fromY + (DEF_Y - tween.fromY) * e;
          if (k >= 1) tween = null;
        } else if (!dragging) {
          rotY += velY; rotX += velX;
          velY *= 0.92; velX *= 0.92;
          if (Math.abs(velY) < 0.0004) velY = 0;
          if (Math.abs(velX) < 0.0004) velX = 0;
          if (P.autoRotate && !focus && velY === 0 && velX === 0) rotY += 0.0022;
          rotX = clamp(rotX, -1.05, 1.05);
        }

        ctx.clearRect(0, 0, w, h);
        const cProj = project(view({ x: 0, y: 0, z: 0 }));
        const R0k = model.R0 * cProj.k;

        const occ = (q, sx, sy) => {
          if (q.z >= 0) return 1;
          const d = Math.hypot(sx - cProj.x, sy - cProj.y);
          if (d < R0k * 0.92) return 0.1;
          return 1;
        };

        // relevance of a connection / node to current selection (for focus dim)
        const relConn = (cn) => {
          if (cn.kind === "external") return sel === "external" || sel === "core" || !sel ? 1 : 0.25;
          if (cn.kind === "comms") return (sel === cn.aId || sel === cn.bId) ? 1 : 0;
          if (cn.kind === "agent") return selFleet === cn.fleetId ? 1 : 0;
          // human lines: shown ONLY for the selected fleet/team, never in rest.
          // The human-to-team link is read from shared position, not a line.
          if (cn.kind === "human") {
            if (selFleet) return cn.fleetId === selFleet ? 1 : 0;
            if (selTeam) return cn.teamId === selTeam ? 1 : 0;
            return 0;
          }
          // spokes: faint everywhere in rest, bright for the selection
          if (!sel) return 0.5;
          if (selFleet) return cn.fleetId === selFleet ? 1 : 0.07;
          if (selTeam) return cn.teamId === selTeam ? 1 : 0.07;
          if (sel === "core") return 0.7;
          return 0.4;
        };

        // --- three subtle guide rings (fleet / agent / human bands) ---
        // Drawn first, behind everything, as faint projected circles in the
        // y=0 plane. They make the three layers legible without shouting.
        for (const rg of model.rings) {
          const SEG = 96;
          ctx.beginPath();
          for (let s = 0; s <= SEG; s++) {
            const a = (s / SEG) * TAU;
            const wp = { x: Math.cos(a) * rg.r, y: 0, z: Math.sin(a) * rg.r };
            const sp = project(view(wp));
            if (s === 0) ctx.moveTo(sp.x, sp.y); else ctx.lineTo(sp.x, sp.y);
          }
          // agent ring is hidden unless a fleet is selected; then it lifts a touch
          const isAgent = rg.kind === "agent";
          let alpha = rg.kind === "human" ? 0.07 : rg.kind === "fleet" ? 0.09 : 0.0;
          if (isAgent) alpha = focus ? 0.11 : 0.04;
          ctx.strokeStyle = rgba("#ffffff", alpha);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // --- spoke + human lines ---
        // Spokes stay very faint in rest (everything hangs off the centre);
        // human lines appear only for the selection. The chosen fleet lights up.
        for (const cn of model.conns) {
          if (cn.kind !== "spoke" && cn.kind !== "human") continue;
          const rel = relConn(cn);
          if (rel <= 0.001) continue;
          const a = project(view(cn.a)), b = project(view(cn.b));
          const on = rel >= 0.99 && (selFleet === cn.fleetId || selTeam === cn.teamId);
          const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          const tip = on ? rgba(c.accent, 0.75 * rel) : rgba("#ffffff", 0.22 * rel);
          if (cn.kind === "spoke") { g.addColorStop(0, rgba("#ffffff", 0)); g.addColorStop(0.4, rgba("#ffffff", 0.04 * rel)); g.addColorStop(1, tip); }
          else { g.addColorStop(0, rgba(c.warm, 0.14 * rel)); g.addColorStop(1, on ? rgba(c.accent, 0.75 * rel) : rgba(c.warm, 0.4 * rel)); }
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = g; ctx.lineWidth = on ? 1.7 : 1.0; ctx.stroke();
        }

        // --- cross-fleet communication links (high 3D arcs over the planet) ---
        // Big sweeping bows that loft above the sphere. A segment only fades when
        // it actually passes BEHIND the globe (negative depth + within the disc),
        // so the high front of every arc stays bright and the back sinks away.
        const commsArcs = [];
        for (const cn of model.conns) {
          if (cn.kind !== "comms") continue;
          const rel = relConn(cn);
          if (rel <= 0.02) continue;
          const pts = cn.path.map((p) => { const q = view(p); return { s: project(q), z: q.z }; });
          commsArcs.push({ pts, rel, seed: cn.seed });
          const lw = 1.0;
          for (let i = 1; i < pts.length; i++) {
            const a0 = pts[i - 1], a1 = pts[i];
            const z = (a0.z + a1.z) / 2;
            const mxs = (a0.s.x + a1.s.x) / 2, mys = (a0.s.y + a1.s.y) / 2;
            // is this segment hidden behind the sphere?
            const behind = z < 0 && Math.hypot(mxs - cProj.x, mys - cProj.y) < R0k * 0.96;
            let a;
            if (behind) a = 0.05 * rel;                 // tucked behind the globe
            else {
              const front = clamp((z / (model.base * 0.6) + 1) / 2, 0, 1);
              a = (0.28 + 0.32 * front) * rel;
            }
            ctx.beginPath();
            ctx.moveTo(a0.s.x, a0.s.y);
            ctx.lineTo(a1.s.x, a1.s.y);
            ctx.strokeStyle = rgba(c.accent, a);
            ctx.lineWidth = lw;
            ctx.lineCap = "round"; ctx.stroke();
          }
        }

        // --- external coupling line (bold, greige, from the brain's core outward) ---
        let extConn = null;
        for (const cn of model.conns) if (cn.kind === "external") extConn = cn;
        let extBez = null;
        if (extConn) {
          const rel = relConn(extConn);
          const a = project(view(extConn.a)), b = project(view(extConn.b));
          // start the visible line at the core CENTRE so it emerges from inside the brain
          const sx = cProj.x, sy = cProj.y;
          let dx = b.x - sx, dy = b.y - sy; const dl = Math.hypot(dx, dy) || 1;
          // bow the curve outward (perpendicular to the line) so it arcs over the rings
          const mx = (sx + b.x) / 2, my = (sy + b.y) / 2;
          const bow = R0k * 1.15;
          const ctlx = mx + (-dy / dl) * bow, ctly = my + (dx / dl) * bow;
          extBez = { sx, sy, bx: b.x, by: b.y, ctlx, ctly, rel };
          const g = ctx.createLinearGradient(sx, sy, b.x, b.y);
          // transparent at the core, so the line reads as growing out of the centre
          g.addColorStop(0, rgba(c.warm, 0));
          g.addColorStop(0.28, rgba(c.warm, 0.14 * rel));
          g.addColorStop(1, rgba(c.warm, 0.85 * rel));
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ctlx, ctly, b.x, b.y);
          ctx.strokeStyle = g; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.stroke();
          // arrowhead pointing outward, tangent to the curve at the end
          const tx = b.x - ctlx, ty = b.y - ctly;
          const ang = Math.atan2(ty, tx);
          const ah = 9;
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(ang) * ah, b.y + Math.sin(ang) * ah);
          ctx.lineTo(b.x + Math.cos(ang + 2.5) * ah, b.y + Math.sin(ang + 2.5) * ah);
          ctx.lineTo(b.x + Math.cos(ang - 2.5) * ah, b.y + Math.sin(ang - 2.5) * ah);
          ctx.closePath(); ctx.fillStyle = rgba(c.warm, 0.9 * rel); ctx.fill();
        }

        // --- depth-sorted items: dots + node markers + particles ---
        const items = [];
        for (const d of model.dots) {
          const q = view(d); const s = project(q);
          items.push({ z: q.z, kind: "dot", s });
        }
        const sp = speed(P.motion);
        for (const cn of model.conns) {
          if (cn.kind === "comms") continue; // comms particles drawn on the bezier below
          if (cn.kind === "external") continue; // external particles drawn on its bezier below
          const rel = relConn(cn);
          if (rel <= 0.02) continue;
          const n = pcount(cn.kind, P.motion);
          for (let i = 0; i < n; i++) {
            let pp = (t * sp / 6 + i / n + cn.seed) % 1;
            if (i % 2 === 1) pp = 1 - pp;
            const wx = cn.a.x + (cn.b.x - cn.a.x) * pp;
            const wy = cn.a.y + (cn.b.y - cn.a.y) * pp;
            const wz = cn.a.z + (cn.b.z - cn.a.z) * pp;
            const q = view({ x: wx, y: wy, z: wz }); const s = project(q);
            const edge = Math.min(pp, 1 - pp);
            const warm = cn.kind === "external";
            items.push({ z: q.z, kind: "particle", s, fade: Math.min(1, edge * 6) * rel, warm, big: warm });
          }
        }
        hitList = [];
        for (const nd of model.nodes) {
          if (nd.type === "core") continue;
          if (nd.type === "agent" && selFleet !== nd.fleetId) continue;
          const q = view(nd.p); const s = project(q);
          items.push({ z: q.z, kind: "node", node: nd, s });
          hitList.push({ id: nd.id, type: nd.type, x: s.x, y: s.y, r: Math.max(14, 13 * s.k), z: q.z });
        }
        hitList.push({ id: "core", type: "core", x: cProj.x, y: cProj.y, r: R0k * 0.85, z: 0 });

        items.sort((A, B) => A.z - B.z);

        // --- draw items back to front ---
        for (const it of items) {
          const s = it.s;
          if (it.kind === "dot") {
            const fr = (it.z / model.R0 + 1) / 2; // 0 back .. 1 front
            const a = (0.1 + 0.62 * fr * fr) * (focus ? 0.7 : 1);
            ctx.beginPath();
            ctx.fillStyle = rgba(c.accent, a);
            ctx.arc(s.x, s.y, Math.max(0.5, 1.1 * s.k), 0, TAU);
            ctx.fill();
          } else if (it.kind === "particle") {
            const o = occ(s, s.x, s.y);
            const col = it.warm ? c.warm : c.accent;
            ctx.beginPath();
            ctx.fillStyle = rgba(col, (it.big ? 0.95 : 0.8) * it.fade * o);
            ctx.shadowColor = rgba(col, 0.9); ctx.shadowBlur = it.big ? 8 : 5;
            ctx.arc(s.x, s.y, (it.big ? 2.1 : 1.5) * Math.max(0.7, s.k), 0, TAU);
            ctx.fill(); ctx.shadowBlur = 0;
          } else if (it.kind === "node") {
            drawNode(ctx, c, it.node, s, sel, hover, occ(s, s.x, s.y), selFleet, selTeam, focus);
          }
        }

        // --- comms particles travelling along the 3D arcs (both directions) ---
        const cn2 = pcount("comms", P.motion);
        for (const arc of commsArcs) {
          const pts = arc.pts, last = pts.length - 1;
          for (let i = 0; i < cn2; i++) {
            let pp = (t * sp / 6 + i / cn2 + arc.seed) % 1;
            if (i % 2 === 1) pp = 1 - pp;
            // walk the sampled polyline at fraction pp
            const f = pp * last, idx = Math.floor(f), frac = f - idx;
            const p0 = pts[idx].s, p1 = pts[Math.min(idx + 1, last)].s;
            const x = p0.x + (p1.x - p0.x) * frac;
            const y = p0.y + (p1.y - p0.y) * frac;
            const edge = Math.min(pp, 1 - pp);
            ctx.beginPath();
            ctx.fillStyle = rgba(c.accent, Math.min(1, edge * 6) * (0.6 * arc.rel));
            ctx.shadowColor = rgba(c.accent, 0.6); ctx.shadowBlur = 4;
            ctx.arc(x, y, 1.5, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
          }
        }

        // --- external data particles travelling along its curve (two-way flow) ---
        if (extBez) {
          const en = pcount("external", P.motion);
          for (let i = 0; i < en; i++) {
            let pp = (t * sp / 6 + i / en + 0.31) % 1;
            if (i % 2 === 1) pp = 1 - pp;
            const u = 1 - pp;
            const x = u * u * extBez.sx + 2 * u * pp * extBez.ctlx + pp * pp * extBez.bx;
            const y = u * u * extBez.sy + 2 * u * pp * extBez.ctly + pp * pp * extBez.by;
            const edge = Math.min(pp, 1 - pp);
            ctx.beginPath();
            ctx.fillStyle = rgba(c.warm, Math.min(1, edge * 6) * (0.95 * extBez.rel));
            ctx.shadowColor = rgba(c.warm, 0.9); ctx.shadowBlur = 8;
            ctx.arc(x, y, 2.1, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
          }
        }

        // central brain glow (soft, cool)
        const halo = ctx.createRadialGradient(cProj.x, cProj.y, R0k * 0.15, cProj.x, cProj.y, R0k * 1.3);
        halo.addColorStop(0, rgba("#cfe0ff", focus ? 0.18 : 0.22));
        halo.addColorStop(1, rgba("#cfe0ff", 0));
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(cProj.x, cProj.y, R0k * 1.3, 0, TAU); ctx.fill();

        // --- external node: a small dot-sphere, a mini-brain out in the world ---
        let extNode = null;
        for (const nd of model.nodes) if (nd.type === "external") extNode = nd;
        if (extNode && model.extDots) {
          const relE = relConn({ kind: "external" });
          // depth-sort the mini-brain's own dots so it reads as a little globe
          const eItems = model.extDots
            .map((d) => {
              const q = view({ x: extNode.p.x + d.x, y: extNode.p.y + d.y, z: extNode.p.z + d.z });
              return { s: project(q), lz: d.z };
            })
            .sort((A, B) => A.lz - B.lz);
          for (const it of eItems) {
            const fr = (it.lz / (model.base * 0.03) + 1) / 2; // 0 back .. 1 front
            const a = (0.22 + 0.7 * fr * fr) * relE;
            ctx.beginPath();
            ctx.fillStyle = rgba(c.warm, a);
            ctx.arc(it.s.x, it.s.y, Math.max(0.5, 1.1 * it.s.k), 0, TAU);
            ctx.fill();
          }
        }

        // --- labels (DOM) ---
        for (const nd of model.nodes) {
          if (nd.type === "core") continue;
          const el = labelEls[nd.id]; if (!el) continue;
          if (nd.type === "agent" && selFleet !== nd.fleetId) { el.style.opacity = 0; continue; }
          const q = view(nd.p); const s = project(q);
          const fr = clamp((q.z / (model.base * 0.6) + 1) / 2, 0, 1);
          const o = occ(s, s.x, s.y);
          const teamActive = nd.teamId && (sel === "team-" + nd.teamId || hover === "team-" + nd.teamId);
          const on = sel === nd.id || hover === nd.id || teamActive;
          const off = nd.type === "human" ? 24 : nd.type === "external" ? 22 : nd.type === "agent" ? 13 : 14;
          el.style.transform = `translate(-50%,-50%) translate(${s.x}px,${s.y}px)`;
          el.style.marginTop = (off * s.k) + "px";

          // focus dim
          let dim = 1;
          if (focus) {
            if (nd.fleetId === selFleet || nd.id === selFleet) dim = 1;
            else if (nd.teamId === selTeam && nd.type === "human") dim = 0.85;
            else dim = 0.32;
          }

          let vis;
          if (nd.type === "agent") vis = (on ? 1 : 0.92) * o;
          else if (nd.type === "external") vis = (on ? 1 : 0.9) * o;
          else if (nd.type === "fleet") vis = (on ? 1 : 0.62 * fr * fr) * o * dim;
          else vis = (on ? 1 : 0.55 + 0.4 * fr) * o * dim; // human
          el.style.opacity = vis;
          el.style.zIndex = String(1000 + Math.round(q.z));

          const warmType = nd.type === "human" || nd.type === "external";
          el.style.color = warmType ? c.warm : (on ? c.text : "rgba(243,245,252,0.82)");
          el.style.fontSize = (nd.type === "human" ? 13.5 : nd.type === "external" ? 13 : nd.type === "agent" ? 11 : 12) * clamp(s.k, 0.82, 1.22) + "px";
          el.style.fontWeight = nd.type === "human" ? 600 : nd.type === "fleet" ? (on ? 600 : 500) : nd.type === "external" ? 600 : 500;
          el.style.letterSpacing = nd.type === "human" ? "0.01em" : "0";
          el.style.textShadow = "0 1px 8px rgba(2,6,20,0.85)";
        }

        raf = requestAnimationFrame(frame);
      }

      function drawPerson(ctx, x, y, r, fill, stroke) {
        // clean Bit/Havas-style person glyph: filled head + bust
        ctx.fillStyle = fill;
        ctx.beginPath(); ctx.arc(x, y - r * 0.42, r * 0.46, 0, TAU); ctx.fill(); // head
        ctx.beginPath();
        ctx.moveTo(x - r * 0.92, y + r * 0.95);
        ctx.quadraticCurveTo(x - r * 0.92, y + r * 0.18, x, y + r * 0.18);
        ctx.quadraticCurveTo(x + r * 0.92, y + r * 0.18, x + r * 0.92, y + r * 0.95);
        ctx.closePath(); ctx.fill();
      }

      function drawNode(ctx, c, nd, s, sel, hover, o, selFleet, selTeam, focus) {
        const on = sel === nd.id || hover === nd.id;
        const k = Math.max(0.75, s.k);
        let dim = 1;
        if (focus) {
          if (nd.fleetId === selFleet || nd.id === selFleet) dim = 1;
          else if (nd.teamId === selTeam && nd.type === "human") dim = 0.9;
          else dim = 0.34;
        }
        ctx.globalAlpha = o * dim;

        if (nd.type === "fleet") {
          if (on || nd.id === selFleet) { ctx.shadowColor = rgba(c.accent, 0.9); ctx.shadowBlur = 16; }
          const active = on || nd.id === selFleet;
          const r = (active ? 6.2 : 4.6) * k;
          ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, TAU);
          ctx.fillStyle = active ? c.accent : rgba(c.accent, 0.14);
          ctx.fill();
          ctx.lineWidth = 1.8; ctx.strokeStyle = c.accent; ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (nd.type === "agent") {
          ctx.shadowColor = rgba(c.accent, 0.8); ctx.shadowBlur = on ? 12 : 7;
          const r = (on ? 5 : 4) * k;
          ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, TAU);
          ctx.fillStyle = c.accent; ctx.fill(); ctx.shadowBlur = 0;
        } else if (nd.type === "human") {
          const r = (on ? 9 : 7.6) * k;
          if (on) { ctx.shadowColor = rgba(c.warm, 0.8); ctx.shadowBlur = 14; }
          drawPerson(ctx, s.x, s.y, r, on ? c.warm : rgba(c.warm, 0.82));
          ctx.shadowBlur = 0;
        } else if (nd.type === "external") {
          // soft warm halo only; the dot-sphere itself is drawn in the frame
          // loop (drawExternalBrain) where view/project are available.
          const r = (on ? 13 : 11) * k;
          const halo = ctx.createRadialGradient(s.x, s.y, r * 0.2, s.x, s.y, r * 1.6);
          halo.addColorStop(0, rgba(c.warm, on ? 0.3 : 0.2));
          halo.addColorStop(1, rgba(c.warm, 0));
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(s.x, s.y, r * 1.6, 0, TAU); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // ---- pointer interaction ----
      function hit(px, py) {
        let best = null, bestZ = -Infinity;
        for (const hgt of hitList) {
          const d = Math.hypot(px - hgt.x, py - hgt.y);
          if (d <= hgt.r && hgt.z > bestZ) { best = hgt; bestZ = hgt.z; }
        }
        return best;
      }
      function rel(e) {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }
      function onDown(e) {
        dragging = true; tween = null; moved = 0;
        const p = rel(e); lastX = p.x; lastY = p.y; velX = velY = 0;
        try { canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
      function onMove(e) {
        const p = rel(e);
        if (dragging) {
          const dx = p.x - lastX, dy = p.y - lastY;
          lastX = p.x; lastY = p.y; moved += Math.abs(dx) + Math.abs(dy);
          rotY += dx * 0.006; rotX = clamp(rotX + dy * 0.006, -1.05, 1.05);
          velY = dx * 0.006; velX = dy * 0.006;
        } else {
          const hgt = hit(p.x, p.y);
          const id = hgt ? hgt.id : null;
          canvas.style.cursor = hgt ? "pointer" : "grab";
          if (id !== hover) hover = id;
        }
      }
      function onUp(e) {
        if (!dragging) return;
        dragging = false;
        const p = rel(e);
        if (moved < 6) {
          const hgt = hit(p.x, p.y);
          pr.current.onSelect(hgt ? hgt.id : null);
        }
      }
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      props._register && props._register({ reset: () => { tween = { fromX: rotX, fromY: rotY, t0: performance.now() / 1000 }; } });

      raf = requestAnimationFrame(frame);
      return () => {
        running = false; cancelAnimationFrame(raf);
        canvas.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, []);

    return React.createElement(
      "div",
      { style: { position: "absolute", inset: 0 } },
      React.createElement("canvas", { ref: canvasRef, style: { position: "absolute", inset: 0, touchAction: "none" } }),
      React.createElement("div", { ref: layerRef, style: { position: "absolute", inset: 0, pointerEvents: "none" } })
    );
  }

  window.Scene3D = Scene3D;
})();
