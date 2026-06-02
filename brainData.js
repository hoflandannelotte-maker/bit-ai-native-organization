/* Company Brain — content model (Bit edition)
   Plain JS, attaches BRAIN to window. No build step.

   Structure: one intelligence core, a continuous external coupling,
   five teams (the 5 C's). Each team has a human lead and a set of fleets.
   Each fleet runs a handful of specialised agents (revealed on click). */
(function () {
  // ---- The intelligence core ----------------------------------------------
  const CORE = {
    id: "core",
    title: "The Company Brain",
    kicker: "One source of intelligence",
    body:
      "A living, shared memory of everything Bit knows. Every email, every intranet page, every document, every project we have ever shipped — unified, searchable, and reasoning in real time.",
    contains: [
      ["Memory", "Email, intranet, documents, decks, client history, finance, every project we shipped"],
      ["Tools", "The systems agents can act in — CRM, repos, design files, planning, accounting, comms"],
      ["Instructions", "How Bit works: our values, playbooks, tone of voice and guardrails"],
    ],
    note:
      "The brain does not replace people. It gives every person and every agent the same complete context to act on.",
  };

  // ---- The continuous external coupling -----------------------------------
  const EXTERNAL = {
    id: "external",
    title: "External Data",
    kicker: "A continuous connection to the world",
    body:
      "The brain is never sealed off. It stays continuously coupled to the outside world so its intelligence is always current, not a frozen snapshot.",
    flows: [
      ["Market & signals", "Industry news, trends, competitor moves, intent data"],
      ["Client systems", "Live data from the systems our clients let us connect to"],
      ["Public knowledge", "Open data, research, regulation, the broader web"],
    ],
    note: "Two-way and always on — the brain reads from the world and writes back what it learns.",
  };

  // ---- The human layer (shared framing; each team names its own lead) ------
  const HUMAN = {
    id: "human",
    title: "Humans in Control",
    kicker: "The outer layer — and the point of it all",
    body:
      "Around every fleet sits a person. People set the intent, feed in judgement the brain cannot have, and review or redact what agents produce before it ever acts. The loop is input down, review up.",
    roles: [
      ["Sets the intent", "A human decides what good looks like and points the fleet at it"],
      ["Reviews & redacts", "Nothing of consequence ships without a person signing off"],
      ["Stays human", "Relationships, culture, ethics, taste and the hard calls remain ours"],
    ],
  };

  // ---- The five teams (the 5 C's) ------------------------------------------
  const TEAMS = [
    {
      id: "culture",
      name: "Culture",
      lead: "People Lead",
      tagline: "People, community & how it feels to work here",
      fleets: [
        {
          id: "attract",
          name: "Attract",
          line: "Draws the right people toward Bit, long before a role opens.",
          tasks: [
            "Map and warm up talent communities",
            "Craft employer-brand stories in Bit's voice",
            "Run referral nudges across the team",
            "Keep a living view of who we'd love to hire",
          ],
          data: ["Talent networks & socials", "External: market & reputation", "Brain: who we are"],
          agents: ["Talent scout agent", "Employer-brand agent", "Referral agent", "Talent-pool agent"],
          lead: "Culture Lead",
          human: [
            "Who we genuinely want is a human call",
            "The first real conversation stays personal",
          ],
        },
        {
          id: "hire",
          name: "Hire",
          line: "Screens, prepares and moves candidates through with care.",
          tasks: [
            "Source and shortlist against an open role",
            "Draft personalised outreach in Bit's voice",
            "Prep interviewers with a brief per candidate",
            "Keep the pipeline and ATS tidy",
          ],
          data: ["ATS & job boards", "Resourcing signals (Control)", "Brain: role profiles, past hires"],
          agents: ["Screening agent", "Outreach agent", "Interview-prep agent", "Scheduling agent"],
          lead: "Hiring Manager",
          human: [
            "The culture-fit conversation stays face to face",
            "The hire / no-hire decision is always a person's",
          ],
        },
        {
          id: "develop",
          name: "Develop & Keep",
          line: "Grows people and keeps the ones we have happy and challenged.",
          tasks: [
            "Map personalised growth and learning paths",
            "Surface the right learning at the right moment",
            "Read sentiment and flag retention risk early",
            "Nudge managers and buddies at key moments",
          ],
          data: ["HRIS & learning", "Pulse & workload signals", "Brain: team history"],
          agents: ["Growth-path agent", "Learning agent", "Sentiment agent", "Retention agent"],
          lead: "People Lead",
          human: [
            "Sensitive 1:1s are never automated",
            "How to act on a signal is a manager's call",
          ],
        },
        {
          id: "challenge",
          name: "Challenge",
          line: "Keeps the culture honest — feedback, rituals and a bit of friction.",
          tasks: [
            "Surface friction and unspoken tension, gently",
            "Propose rituals and team moments",
            "Gather candid, anonymous feedback",
            "Track engagement trends over time",
          ],
          data: ["Pulse surveys", "Engagement signals", "Brain: team history"],
          agents: ["Feedback agent", "Ritual agent", "Engagement agent"],
          lead: "Culture Lead",
          human: [
            "Hard conversations stay human",
            "What we change is decided together",
          ],
        },
      ],
    },
    {
      id: "content",
      name: "Content",
      lead: "Creative Lead",
      tagline: "Bit's voice, brand and stories",
      fleets: [
        {
          id: "thought",
          name: "Thought Leadership",
          line: "Plans, writes and ships Bit's point of view across channels.",
          tasks: [
            "Plan and move the content calendar",
            "Draft articles, posts and newsletters on brief",
            "Schedule and tailor social per channel",
            "Prep talks, events and formats",
          ],
          data: ["Brand book & tone", "Brain: projects & expertise", "External: trends"],
          agents: ["Content-planning agent", "Content-development agent", "Social media agent", "Events agent"],
          lead: "Editorial Lead",
          human: [
            "Editorial direction and final approval are human",
            "Point of view and taste stay ours",
          ],
        },
        {
          id: "brand",
          name: "Brand Guardian",
          line: "Keeps everything we make unmistakably Bit.",
          tasks: [
            "Check assets against the identity rules",
            "Suggest on-brand fixes and alternatives",
            "Keep templates and the asset library tidy",
            "Catch off-brand work before it goes out",
          ],
          data: ["Brand book & identity", "Asset & template library", "Brain: prior work"],
          agents: ["Identity agent", "Asset-check agent", "Template agent"],
          lead: "Creative Director",
          human: [
            "Creative direction is led by people",
            "Breaking the rules on purpose is a human choice",
          ],
        },
        {
          id: "engage",
          name: "Engage",
          line: "Turns the brand into marketing, campaigns and account-based reach.",
          tasks: [
            "Build and run campaigns end to end",
            "Set up, tune and report on ads",
            "Tailor account-based marketing per client",
            "Feed what lands back to Client Development",
          ],
          data: ["Ad & marketing platforms", "Social & analytics", "Brain: delivered work · CRM"],
          agents: ["Campaign agent", "Ads agent", "Account-based agent", "Insight agent"],
          lead: "Marketing Lead",
          human: [
            "Community-sensitive replies stay human",
            "Permission to publish client work is a person's call",
          ],
        },
      ],
    },
    {
      id: "client-dev",
      name: "Client Development",
      lead: "Growth Lead",
      tagline: "Finding the right clients and growing the relationship",
      fleets: [
        {
          id: "outreach",
          name: "Outreach & Attract",
          line: "Finds the opportunities worth our time and wins the work.",
          tasks: [
            "Scan the market for fit and trigger events",
            "Score and prioritise inbound and outbound",
            "Draft outreach and brief first conversations",
            "Turn briefs into proposals, decks and estimates",
          ],
          data: ["External: market & intent", "CRM", "Brain: ideal-client profile, past pitches"],
          agents: ["Market-signal agent", "Lead-scoring agent", "Outreach agent", "Proposal agent"],
          lead: "New Business Lead",
          human: [
            "Which opportunities we chase is a human call",
            "Pricing and the pitch in the room stay ours",
          ],
        },
        {
          id: "maintain",
          name: "Maintaining",
          line: "Watches account health and grows the relationships we have.",
          tasks: [
            "Monitor account health across delivery and comms",
            "Surface upsell and cross-sell moments with context",
            "Draft check-ins, updates and renewal notes",
            "Flag risk before it becomes churn",
          ],
          data: ["Delivery data", "CRM & comms", "Brain: account history"],
          agents: ["Account-health agent", "Upsell agent", "Check-in agent", "Renewal agent"],
          lead: "Account Lead",
          human: [
            "The relationship is owned and carried by a person",
            "Commercial conversations stay human",
          ],
        },
        {
          id: "explore",
          name: "Exploring",
          line: "Tests new markets, services and partnerships before we commit.",
          tasks: [
            "Research adjacent markets and propositions",
            "Prototype and pressure-test new offers",
            "Map potential partners and channels",
            "Brief the team on what's worth chasing",
          ],
          data: ["External: market & research", "Brain: capabilities", "CRM"],
          agents: ["Market-research agent", "Proposition agent", "Partnership agent"],
          lead: "Growth Lead",
          human: [
            "What we actually pursue is a leadership call",
            "New bets are made with eyes open",
          ],
        },
      ],
    },
    {
      id: "client-delivery",
      name: "Client Delivery",
      lead: "Delivery Lead",
      tagline: "Doing the work — design, build and ship",
      fleets: [
        {
          id: "prepare",
          name: "Prepare",
          line: "Scopes, plans and sets expectations before a single thing is built.",
          tasks: [
            "Digest the brief, docs and research",
            "Define scope, risks and open questions",
            "Draft a plan and a first estimate",
            "Set clear expectations with the client",
          ],
          data: ["Client docs & research", "Brain: similar engagements", "Planning tools"],
          agents: ["Scoping agent", "Planning agent", "Estimate agent", "Expectations agent"],
          lead: "Project Lead",
          human: [
            "Scope and framing are agreed with the client",
            "What matters most is a human judgement call",
          ],
        },
        {
          id: "execute",
          name: "Execute",
          line: "Manages, designs and builds so people start from 80%, not zero.",
          tasks: [
            "Run project management and keep the plan live",
            "Scaffold code, components and tests",
            "Generate design options from the system",
            "Wire up integrations and boilerplate",
          ],
          data: ["Codebase & repos", "Design system", "Brain: patterns & standards"],
          agents: ["Project-management agent", "Build agent", "Design agent", "Integration agent"],
          lead: "Tech Lead",
          human: [
            "Architecture and code review are owned by engineers",
            "The decision to ship is always a person's",
          ],
        },
        {
          id: "exceed",
          name: "Exceed",
          line: "Guards quality, satisfaction and the next good idea.",
          tasks: [
            "Run tests, checks and accessibility passes",
            "Gather and read satisfaction signals",
            "Propose innovations and improvements",
            "Compare output against the brief and standards",
          ],
          data: ["CI & test tooling", "Satisfaction surveys", "Brain: definition of done"],
          agents: ["Quality agent", "Satisfaction agent", "Innovation agent"],
          lead: "Quality Lead",
          human: [
            "Release sign-off is a human decision",
            "Taste and quality bars stay ours",
          ],
        },
        {
          id: "connect",
          name: "Connect",
          line: "Keeps clients close and the inside of Bit aligned.",
          tasks: [
            "Draft client updates and communication",
            "Align internal teams and hand-offs",
            "Manage the account rhythm day to day",
            "Surface risks and re-planning early",
          ],
          data: ["Project & comms tools", "CRM", "Brain: account context"],
          agents: ["Client-comms agent", "Alignment agent", "Account agent", "Risk agent"],
          lead: "Delivery Lead",
          human: [
            "Client comms stay with the lead",
            "Re-planning is a human conversation",
          ],
        },
      ],
    },
    {
      id: "control",
      name: "Control",
      lead: "Operations Lead",
      tagline: "Running the company — finance, ops, risk & support",
      fleets: [
        {
          id: "manage",
          name: "Manage",
          line: "Keeps the numbers clean, the risks covered and the plan staffed.",
          tasks: [
            "Reconcile, categorise and flag anomalies",
            "Draft invoices from time and milestones",
            "Match capacity to demand and flag gaps",
            "Keep insurances and admin current",
          ],
          data: ["Accounting & time tracking", "Planning & timesheets", "Brain: contracts & rates"],
          agents: ["Finance agent", "Invoicing agent", "Resourcing agent", "Insurance agent"],
          lead: "Finance Lead",
          human: [
            "Payments and sign-off are approved by a person",
            "Who works on what is decided by people",
          ],
        },
        {
          id: "govern",
          name: "Govern",
          line: "Reads the fine print and keeps the operation honest.",
          tasks: [
            "Maintain operational strategy and policy",
            "Review contracts and flag unusual terms",
            "Check work against GDPR and policy",
            "Maintain an audit trail automatically",
          ],
          data: ["Legal & contract store", "Policy library", "Brain: precedent"],
          agents: ["Strategy agent", "Contracting agent", "Compliance agent", "Audit agent"],
          lead: "Operations Lead",
          human: [
            "Legal sign-off is always a person's",
            "Risk calls are made by a human, on the record",
          ],
        },
        {
          id: "support",
          name: "Support",
          line: "Keeps the systems healthy and the maths right.",
          tasks: [
            "Handle IT requests and provisioning",
            "Run calculations, models and what-ifs",
            "Keep systems and access healthy",
            "Automate the dull, repetitive plumbing",
          ],
          data: ["IT & access systems", "Spreadsheets & models", "Brain: how Bit works"],
          agents: ["IT agent", "Calculation agent", "Systems agent", "Access agent"],
          lead: "IT Lead",
          human: [
            "Access and security calls stay human",
            "What we automate is a deliberate choice",
          ],
        },
      ],
    },
  ];

  // ---- Cross-fleet communication (fleets that talk to each other) ----------
  // NOTE: the brief named fleets from the old model ("Resourcing", "Client
  // Growth", "Distribution & Insight"). Mapped to the closest fleet in the new
  // structure — adjust the ids below if a different pairing is intended.
  const LINKS = [
    { a: "manage", b: "hire", label: "Resourcing ↔ Hiring" },     // Control ↔ Culture
    { a: "engage", b: "maintain", label: "Reach ↔ Account growth" }, // Content ↔ Client Development
  ];

  window.BRAIN = { CORE, EXTERNAL, HUMAN, TEAMS, LINKS };
})();
