/* DetailPanel — the explorable side panel (Bit edition). Resolves the selected
   node id into rich content: core, external link, a team's human layer, or a
   fleet (with its agents). White = the AI layer, greige = the human layer. */
(function () {
  const Section = ({ label, c, children, warm }) =>
    React.createElement(
      "div",
      { style: { marginTop: 24 } },
      React.createElement(
        "div",
        { style: { fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: warm ? c.warm : c.faint, fontWeight: 700, marginBottom: 12 } },
        label
      ),
      children
    );

  const Bullet = ({ c, children }) =>
    React.createElement(
      "div",
      { style: { display: "flex", gap: 11, alignItems: "flex-start", marginBottom: 10 } },
      React.createElement("div", { style: { width: 5, height: 5, borderRadius: "50%", background: "#fff", marginTop: 7, flex: "none", boxShadow: "0 0 6px rgba(255,255,255,0.6)" } }),
      React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.45, color: c.text } }, children)
    );

  const Row = ({ c, k, v }) =>
    React.createElement(
      "div",
      { style: { display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${c.line}` } },
      React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: c.text, width: 92, flex: "none" } }, k),
      React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.4, color: c.muted } }, v)
    );

  const Chips = ({ c, items }) =>
    React.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 7 } },
      items.map((x, i) =>
        React.createElement(
          "div",
          { key: i, style: { fontSize: 11.5, color: c.muted, border: `1px solid ${c.nodeBorder}`, borderRadius: 999, padding: "4px 10px", background: c.nodeBg } },
          x
        )
      )
    );

  // agents — small white nodes, echoing the scene
  const AgentList = ({ c, items }) =>
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 9 } },
      items.map((a, i) =>
        React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 11 } },
          React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: "#fff", flex: "none", boxShadow: "0 0 8px rgba(255,255,255,0.7)" } }),
          React.createElement("div", { style: { fontSize: 13, color: c.text, fontWeight: 500 } }, a))
      )
    );

  const HumanList = ({ c, items }) =>
    React.createElement(
      "div",
      { style: { borderLeft: `2px solid ${c.warm}`, paddingLeft: 14, display: "flex", flexDirection: "column", gap: 12 } },
      items.map((it, i) =>
        Array.isArray(it)
          ? React.createElement(
              "div",
              { key: i },
              React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: c.warm } }, it[0]),
              React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.45, color: c.muted, marginTop: 2 } }, it[1])
            )
          : React.createElement(
              "div",
              { key: i, style: { fontSize: 13.5, lineHeight: 1.5, color: c.text, fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic" } },
              it
            )
      )
    );

  const LeadTag = ({ c, name }) =>
    React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 12, background: `${c.warm}1e`, border: `1px solid ${c.warm}55`, borderRadius: 999, padding: "5px 12px 5px 9px" } },
      React.createElement("div", { style: { width: 14, height: 14, position: "relative", flex: "none" } },
        React.createElement("div", { style: { position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: 7, height: 7, borderRadius: "50%", background: c.warm } }),
        React.createElement("div", { style: { position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: 13, height: 7, borderTopLeftRadius: 8, borderTopRightRadius: 8, background: c.warm } })),
      React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: c.warm } }, name));

  function resolve(BRAIN, sel) {
    if (sel === "core") return { type: "core" };
    if (sel === "external") return { type: "external" };
    if (sel && sel.indexOf("team-") === 0) {
      const team = BRAIN.TEAMS.find((t) => "team-" + t.id === sel);
      return team ? { type: "team", team } : null;
    }
    for (const team of BRAIN.TEAMS) {
      const f = team.fleets.find((x) => x.id === sel);
      if (f) return { type: "fleet", team, fleet: f };
    }
    return null;
  }

  function DetailPanel({ BRAIN, selected, colors, onClose, onSelect }) {
    const c = colors;
    const open = !!selected;
    const d = resolve(BRAIN, selected) || {};

    const head = (kicker, title, sub) =>
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } },
          React.createElement("div", { style: { width: 7, height: 7, borderRadius: "50%", background: c.warm } }),
          React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: c.warm, fontWeight: 700 } }, kicker)
        ),
        React.createElement("div", { style: { fontSize: 27, lineHeight: 1.06, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" } }, title),
        sub
          ? React.createElement("div", { style: { fontSize: 14, lineHeight: 1.5, color: c.muted, marginTop: 9 } }, sub)
          : null
      );

    const noteBlock = (txt) =>
      React.createElement("div", { style: { marginTop: 24, fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: c.text, borderLeft: `2px solid ${c.warm}`, paddingLeft: 14 } }, txt);

    let body = null;
    if (d.type === "core") {
      const x = BRAIN.CORE;
      body = React.createElement(
        React.Fragment, null,
        head(x.kicker, x.title, x.body),
        React.createElement(Section, { label: "What lives inside", c }, x.contains.map((r, i) => React.createElement(Row, { key: i, c, k: r[0], v: r[1] }))),
        noteBlock(x.note)
      );
    } else if (d.type === "external") {
      const x = BRAIN.EXTERNAL;
      body = React.createElement(
        React.Fragment, null,
        head(x.kicker, x.title, x.body),
        React.createElement(Section, { label: "Always-on streams", c, warm: true }, x.flows.map((r, i) => React.createElement(Row, { key: i, c, k: r[0], v: r[1] }))),
        noteBlock(x.note)
      );
    } else if (d.type === "team") {
      const t = d.team, H = BRAIN.HUMAN;
      body = React.createElement(
        React.Fragment, null,
        head(t.name + " · human in control", t.name, t.tagline),
        React.createElement("div", { style: { marginTop: 16 } }, React.createElement(LeadTag, { c, name: t.lead })),
        React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.55, color: c.muted } }, H.body),
        React.createElement(Section, { label: "The human role", c, warm: true }, React.createElement(HumanList, { c, items: H.roles })),
        React.createElement(Section, { label: "Fleets this team leads", c },
          React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
            t.fleets.map((f) =>
              React.createElement(
                "button",
                {
                  key: f.id, onClick: () => onSelect(f.id),
                  style: {
                    textAlign: "left", cursor: "pointer", border: `1px solid ${c.nodeBorder}`,
                    background: c.nodeBg, borderRadius: 12, padding: "12px 14px", color: c.text,
                    display: "flex", alignItems: "center", gap: 12, font: "inherit",
                  },
                },
                React.createElement("div", { style: { width: 9, height: 9, borderRadius: "50%", background: "#fff", flex: "none", boxShadow: "0 0 8px rgba(255,255,255,0.6)" } }),
                React.createElement("div", null,
                  React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700 } }, f.name),
                  React.createElement("div", { style: { fontSize: 12, color: c.muted, marginTop: 2, lineHeight: 1.4 } }, f.line)
                ),
                React.createElement("div", { style: { marginLeft: "auto", color: c.faint, fontSize: 18 } }, "›")
              )
            )
          )
        )
      );
    } else if (d.type === "fleet") {
      const f = d.fleet, t = d.team;
      body = React.createElement(
        React.Fragment, null,
        head(t.name + " · fleet", f.name, f.line),
        React.createElement("div", { style: { marginTop: 16 } }, React.createElement(LeadTag, { c, name: f.lead })),
        React.createElement(Section, { label: f.agents.length + " agents in this fleet", c }, React.createElement(AgentList, { c, items: f.agents })),
        React.createElement(Section, { label: "What it does", c }, f.tasks.map((x, i) => React.createElement(Bullet, { key: i, c }, x))),
        React.createElement(Section, { label: "Plugs into", c }, React.createElement(Chips, { c, items: f.data })),
        React.createElement(Section, { label: "Human in control", c, warm: true }, React.createElement(HumanList, { c, items: f.human }))
      );
    }

    return React.createElement(
      "div",
      {
        style: {
          position: "fixed", top: 0, right: 0, height: "100%", width: "min(440px, 92vw)",
          background: c.panelBg,
          borderLeft: `1px solid ${c.panelBorder}`,
          transform: open ? "translateX(0)" : "translateX(102%)",
          transition: "transform .42s cubic-bezier(.22,.61,.36,1)",
          zIndex: 60, boxShadow: open ? "-30px 0 80px rgba(2,6,20,0.55)" : "none",
          display: "flex", flexDirection: "column",
        },
      },
      React.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            position: "absolute", top: 18, right: 18, width: 34, height: 34, borderRadius: "50%",
            border: `1px solid ${c.nodeBorder}`, background: c.nodeBg, color: c.text, cursor: "pointer",
            fontSize: 16, lineHeight: 1, zIndex: 2,
          },
        },
        "×"
      ),
      React.createElement(
        "div",
        { style: { overflowY: "auto", padding: "40px 30px 48px", flex: 1 } },
        body
      )
    );
  }

  window.DetailPanel = DetailPanel;
})();
