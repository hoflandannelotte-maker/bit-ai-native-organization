/* Theme tokens for the Company Brain — Bit edition.
   System:
     • Bit navy   = the universe (the company / the world)
     • Cool white = intelligence + agents (the brain, fleets, agent dots)
     • Warm greige = the human layer + the external world (people & data)
   Roobert is the brand sans; Century the editorial serif accent. */
(function () {
  // Warm "greige" options for the human / external layer.
  const WARMS = [
    "#D8CFB8", // Bit greige (default)
    "#E6C988", // soft gold
    "#E9E2D2", // warm white
  ];

  // Bit blue options for the universe + legend block.
  const BLUES = [
    "#12307F", // Bit blue (default)
    "#173A8C", // brighter
    "#0E255F", // deeper
  ];

  function palette(blue, warm) {
    const b = blue || BLUES[0];
    const w = warm || WARMS[0];
    return {
      // primary "node" colour — cool white for the AI layer
      accent: "#FFFFFF",
      // warm tone for humans + external data
      warm: w,
      // the Bit blue used for the legend block + glows
      blue: b,
      // universe background (radial: bright navy core -> deep edge)
      bg0: "#0B1E52",
      bg1: "#04091F",
      // the solid Bit-navy panels (legend left, detail right)
      block: b,
      panelBg: "#0A1A47",
      panelBorder: "rgba(255,255,255,0.12)",
      text: "#F3F5FC",
      textWarm: w,
      muted: "rgba(243,245,252,0.62)",
      faint: "rgba(243,245,252,0.36)",
      line: "rgba(255,255,255,0.10)",
      lineWarm: "rgba(216,207,184,0.22)",
      nodeBg: "rgba(255,255,255,0.05)",
      nodeBorder: "rgba(243,245,252,0.18)",
      dark: true,
    };
  }

  window.THEME = { WARMS, BLUES, palette };
})();
