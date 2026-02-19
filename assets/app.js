
// assets/app.js
(() => {
  // ----------------------------
  // 1) Mobile/desktop nav toggle
  // ----------------------------
  const navBtn = document.getElementById("navToggle");
  if (navBtn) {
    navBtn.addEventListener("click", () => {
      document.body.classList.toggle("navCollapsed");
    });
  }

  // ----------------------------
  // 2) Pre/Post setup switching (dashboard only)
  // ----------------------------
  let complete = false;
  try {
    complete = localStorage.getItem("commonshub_setup_complete") === "1";
  } catch {}

  const pre = document.getElementById("preSetup");
  const post = document.getElementById("postSetup");
  const navSubtitle = document.getElementById("navSubtitle");
  const headerSubcopy = document.getElementById("headerSubcopy");

  if (pre && post) {
    pre.style.display = complete ? "none" : "block";
    post.style.display = complete ? "block" : "none";
  }
  if (navSubtitle) {
    navSubtitle.textContent = complete ? "Health + key actions" : "Live + next step";
  }
  if (headerSubcopy) {
    headerSubcopy.textContent = complete
      ? "Your server is running. Your community is ready — post in Mastodon, invite your audience, enable funding if you want."
      : "Your server is running. Next, we’ll help you make it feel “real” before you invite anyone.";
  }

  // ----------------------------
// 2.5) Mastodon access buttons (MVP mock)
// ----------------------------
// Show "Sign in" first, then "Mastodon dashboard" after 1 click
// ----------------------------
(function setupMastodonAdminButtons() {
  const loginBtn = document.getElementById("mastodonLoginBtn");
  const adminBtn = document.getElementById("mastodonAdminBtn");
  const hint = document.getElementById("mastodonHint");

  if (!loginBtn || !adminBtn) return;

  const KEY = "commonshub_mastodon_login_attempted";

  let loginAttempted = false;
  try {
    loginAttempted = localStorage.getItem(KEY) === "1";
  } catch {}

  // Default render
  loginBtn.style.display = loginAttempted ? "none" : "inline-flex";
  adminBtn.style.display = loginAttempted ? "inline-flex" : "none";
  if (hint) hint.style.display = loginAttempted ? "none" : "block";

  // IMPORTANT: DO NOT preventDefault.
  // Let the link open in a new tab, but flip the local flag here.
  loginBtn.addEventListener("click", () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}

    // Optional: refresh this tab shortly after so the Admin button appears
    setTimeout(() => window.location.reload(), 150);
  });
})();

// ----------------------------
// 2.7) Guided setup checklist (dashboard)
// ----------------------------
(() => {
  const host = "https://peakx.social"; // swap to provisioned instance domain later
  const checklistEl = document.getElementById("setupChecklist");
  if (!checklistEl) return;

  const DONE_KEY = "commonshub_setup_checklist_done_v1";

  // Suggested copy pack (in real product: derived from Blueprint + provisioning outputs)
  const copyPack = {
    about_short_description:
      "A calm home for your community — chronological signal, visible participants, no algorithmic incentives.",
    about_long_description:
      "This space is designed for serious conversation that compounds over time. Posts are chronological. Participants are visible. Discussion is stewarded, not optimized for engagement.\n\nUse this as a working room: make claims, share sources, ask better questions, and build shared context.\n\nCommonshub handles hosting and invites. Mastodon provides the social layer.",
    rules:
      "• Be constructive.\n• Argue with sources when possible.\n• No harassment or pile-ons.\n• Keep the signal high.\n• Moderation exists to protect the room, not to win arguments.",
    welcome_post:
      "Welcome — this is the first thread in the room.\n\nStart here:\n• Introduce yourself (who you are + what you’re here to learn/build)\n• Share one question you’d love the community to tackle\n\nThis space is chronological. The goal is to build shared context over time.",
    invite_message:
      "I’m opening a new community space on Mastodon. It’s a calm, chronological room for thoughtful discussion — no ads, no algorithmic feed.\n\nJoin here: [INVITE LINK]\n\nIf you join, reply with an intro + what you hope to contribute."
  };

  // Checklist steps (edit/extend freely)
  const steps = [
    {
      id: "login",
      title: "Sign in to Mastodon",
      why: "You’ll need an authenticated Mastodon session before admin links will work.",
      openUrl: `${host}/auth/sign_in`,
      copyKey: null,
      copyLabel: null
    },
    {
      id: "owner_profile",
      title: "Owner profile basics",
      why: "Set display name + bio so the room feels hosted and credible.",
      openUrl: `${host}/settings/profile`,
      copyKey: null,
      copyLabel: null
    },
    {
      id: "about",
      title: "About text",
      why: "This becomes the server description + sets expectations for new members.",
      openUrl: `${host}/admin/settings/about`,
      copyKey: "about_long_description",
      copyLabel: "Suggested About / long description"
    },
    {
      id: "registrations",
      title: "Registrations",
      why: "Decide whether signups are invite-only, approval-based, or open.",
      openUrl: `${host}/admin/settings/registrations`,
      copyKey: null,
      copyLabel: null
    },
    {
      id: "branding",
      title: "Branding",
      why: "Optional. If you want: set icon + banner. (We’re not storing assets in MVP.)",
      openUrl: `${host}/admin/settings/branding`,
      copyKey: null,
      copyLabel: null
    },
    {
      id: "discovery",
      title: "Discovery",
      why: "Controls how visible the instance is (directory, discovery surfaces).",
      openUrl: `${host}/admin/settings/discovery`,
      copyKey: null,
      copyLabel: null
    },
    {
      id: "invites",
      title: "Invites",
      why: "Generate invite links and share them with your initial collaborators.",
      openUrl: `${host}/admin/invites`,
      copyKey: "invite_message",
      copyLabel: "Suggested invite message"
    }
  ];

  function loadDone() {
    try {
      return JSON.parse(localStorage.getItem(DONE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveDone(done) {
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify(done));
    } catch {}
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  function render() {
    const done = loadDone();
    checklistEl.innerHTML = "";

    steps.forEach((s) => {
      const isDone = !!done[s.id];

      const row = document.createElement("div");
      row.className = "item";
      row.style.alignItems = "flex-start";
      row.style.gap = "12px";
      row.style.padding = "14px 0";
      row.style.borderBottom = "1px solid var(--line, #d9e2dc)";

      row.innerHTML = `
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <b style="font-size:14px;">${s.title}</b>
            ${
              isDone
                ? `<span class="chip" style="font-size:12px;">Done</span>`
                : `<span class="chip" style="font-size:12px; opacity:.75;">To do</span>`
            }
          </div>
          <div class="muted" style="margin-top:6px; font-size:13px; line-height:1.35;">
            ${s.why}
          </div>

          ${
            s.copyKey
              ? `
              <div style="margin-top:10px;">
                <a href="#" data-toggle-copy="${s.id}" class="secondary" style="display:inline-flex; width:auto; padding:8px 10px;">
                  ${isDone ? "Show suggested copy" : "Hide suggested copy"}
                </a>

                <div data-copy-wrap="${s.id}" style="margin-top:10px; ${isDone ? "display:none;" : ""}">
                  <div class="muted" style="font-size:12px; margin-bottom:6px;">${s.copyLabel}</div>
                  <textarea readonly style="width:100%; min-height:110px; resize:vertical; padding:10px; border-radius:12px; border:1px solid #d9e2dc; font-size:12px; line-height:1.35; background:rgba(16,32,24,.03);">${copyPack[s.copyKey]}</textarea>
                  <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                    <button class="secondary" data-copy-btn="${s.id}" type="button" style="width:auto;">Copy text</button>
                  </div>
                </div>
              </div>
              `
              : ``
          }
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
          <a class="secondary" href="${s.openUrl}" target="_blank" rel="noopener" style="width:auto;">Open</a>
          <button class="secondary" type="button" data-done-btn="${s.id}" style="width:auto;">
            ${isDone ? "Mark not done" : "Mark done"}
          </button>
        </div>
      `;

      checklistEl.appendChild(row);
    });

    // Wire events
    checklistEl.querySelectorAll("[data-done-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-done-btn");
        const done = loadDone();
        done[id] = !done[id];
        saveDone(done);
        render();
      });
    });

    checklistEl.querySelectorAll("[data-toggle-copy]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const id = a.getAttribute("data-toggle-copy");
        const wrap = checklistEl.querySelector(`[data-copy-wrap="${id}"]`);
        if (!wrap) return;
        const showing = wrap.style.display !== "none";
        wrap.style.display = showing ? "none" : "block";
        a.textContent = showing ? "Show suggested copy" : "Hide suggested copy";
      });
    });

    checklistEl.querySelectorAll("[data-copy-btn]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-copy-btn");
        const step = steps.find((s) => s.id === id);
        if (!step || !step.copyKey) return;

        const ok = await copyText(copyPack[step.copyKey]);
        const old = btn.textContent;
        btn.textContent = ok ? "Copied" : "Copy failed";
        setTimeout(() => (btn.textContent = old), 900);
      });
    });
  }

  render();
})();

  // ----------------------------
  // 3) Copy invite (post-setup)
  // ----------------------------
  const copyBtn = document.getElementById("copyInviteBtn");
  const inviteField = document.getElementById("inviteField");
  const inviteInput = document.getElementById("inviteLink");

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  if (copyBtn && inviteInput) {
    copyBtn.addEventListener("click", async () => {
      if (inviteField) inviteField.style.display = "block";

      inviteInput.focus();
      inviteInput.select();

      const ok = await copyText(inviteInput.value);
      if (!ok) {
        try {
          document.execCommand("copy");
        } catch {}
      }

      const old = copyBtn.textContent;
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = old), 900);
    });
  }

  // ----------------------------
  // 5) Reset demo flow (works on ALL pages)
  // ----------------------------
  function resetFlow(kind) {
    try {
      if (kind === "all") {
        localStorage.removeItem("commonshub_server_live");
        localStorage.removeItem("commonshub_setup_complete");
        localStorage.removeItem("commonshub_setup_step");
        localStorage.removeItem("commonshub_celebrate_once");
        localStorage.removeItem("commonshub_mastodon_login_attempted");
      } else if (kind === "server") {
        localStorage.removeItem("commonshub_server_live");
        localStorage.removeItem("commonshub_setup_complete");
        localStorage.removeItem("commonshub_setup_step");
        localStorage.removeItem("commonshub_celebrate_once");
        localStorage.removeItem("commonshub_mastodon_login_attempted");
      } else if (kind === "community") {
        localStorage.removeItem("commonshub_setup_complete");
        localStorage.removeItem("commonshub_setup_step");
        localStorage.removeItem("commonshub_celebrate_once");
        localStorage.removeItem("commonshub_mastodon_login_attempted");
      }
    } catch {}

    const target =
      kind === "server" ? "setup.html" :
      kind === "community" ? "dashboard.html" :
      "index.html";

    window.location.href = target;
  }

  document.addEventListener("click", (e) => {
    const el = e.target && e.target.closest ? e.target.closest("[data-reset]") : null;
    if (!el) return;

    e.preventDefault();
    const kind = (el.getAttribute("data-reset") || "all").toLowerCase();
    if (kind !== "all" && kind !== "server" && kind !== "community") return;

    resetFlow(kind);
  });

  document.querySelectorAll("[data-reset='all']").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        localStorage.removeItem("commonshub_server_live");
        localStorage.removeItem("commonshub_setup_complete");
        localStorage.removeItem("commonshub_setup_step");
        localStorage.removeItem("commonshub_celebrate_once");
        localStorage.removeItem("commonshub_mastodon_login_attempted");
        localStorage.removeItem("commonshub_stripe_connected");
        localStorage.removeItem("commonshub_funding_enabled");
        localStorage.removeItem("commonshub_funding_subs_on");
        localStorage.removeItem("commonshub_funding_tips_on");
      } catch {}
      try { sessionStorage.removeItem("commonshub_in_setup_flow"); } catch {}
      window.location.href = "index.html";
    });
  });

  // ----------------------------
  // 6) Funding UI (dashboard) — 3-state
  // ----------------------------
  (() => {
    const stripeStatus = document.getElementById("stripeStatus");
    const fundingStatus = document.getElementById("fundingStatus");
    const fundingSubcopy = document.getElementById("fundingSubcopy");

    const fundingPrimaryBtn = document.getElementById("fundingPrimaryBtn");
    const fundingCtaWrap = document.getElementById("fundingCtaWrap");
    const fundingLiveActions = document.getElementById("fundingLiveActions");

    // Only run on pages that actually have the funding block
    if (!fundingPrimaryBtn || !fundingCtaWrap || !fundingLiveActions) return;

    let stripeConnected = false;
    let fundingEnabled = false;

    try {
      stripeConnected = localStorage.getItem("commonshub_stripe_connected") === "1";
      fundingEnabled = localStorage.getItem("commonshub_funding_enabled") === "1";
    } catch {}

    // Default: show single CTA, hide live actions
    fundingCtaWrap.style.display = "flex";
    fundingLiveActions.style.display = "none";

    if (stripeStatus) stripeStatus.textContent = stripeConnected ? "Connected" : "Not connected";

    // State A: Stripe not connected
    if (!stripeConnected) {
      if (fundingStatus) fundingStatus.textContent = "Off";
      if (fundingSubcopy) {
        fundingSubcopy.textContent =
          "Optional. Participation is always free. Connect Stripe to enable community funding.";
      }

      fundingPrimaryBtn.textContent = "Enable community funding";
      fundingPrimaryBtn.href = "funding-start.html";
      return;
    }

    // State B: Stripe connected, funding off
    if (!fundingEnabled) {
      if (fundingStatus) fundingStatus.textContent = "Off";
      if (fundingSubcopy) {
        fundingSubcopy.textContent =
          "Stripe is connected. Turn on community funding when you’re ready.";
      }

      fundingPrimaryBtn.textContent = "Turn on community funding";
      fundingPrimaryBtn.href = "funding-options.html";
      return;
    }

    // State C: Funding live
    if (fundingStatus) fundingStatus.textContent = "Live";
    if (fundingSubcopy) fundingSubcopy.textContent = "Community funding is live and shareable.";

    fundingCtaWrap.style.display = "none";
    fundingLiveActions.style.display = "block";
  })();
})();
