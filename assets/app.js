// assets/app.js
(() => {
const storage = {
get(key, fallback = null) {
try {
const value = localStorage.getItem(key);
return value === null ? fallback : value;
} catch {
return fallback;
}
},
set(key, value) {
try {
localStorage.setItem(key, value);
} catch {}
},
remove(key) {
try {
localStorage.removeItem(key);
} catch {}
},
};

async function copyText(text) {
try {
await navigator.clipboard.writeText(text);
return true;
} catch {
try {
const temp = document.createElement("textarea");
temp.value = text;
temp.setAttribute("readonly", "");
temp.style.position = "absolute";
temp.style.left = "-9999px";
document.body.appendChild(temp);
temp.select();
const ok = document.execCommand("copy");
document.body.removeChild(temp);
return ok;
} catch {
return false;
}
}
}

function flashButtonText(button, nextText, delay = 900, restoreDisabled = null) {
if (!button) return;
const oldText = button.textContent;
button.textContent = nextText;

setTimeout(() => {
button.textContent = oldText;
if (typeof restoreDisabled === "boolean") {
button.disabled = restoreDisabled;
}
}, delay);
}

// ----------------------------
// 1) Mobile / desktop nav toggle
// ----------------------------
function setupNavToggle() {
const navBtn = document.getElementById("navToggle");
if (!navBtn) return;

navBtn.addEventListener("click", () => {
document.body.classList.toggle("navCollapsed");
});
}

// ----------------------------
// 2) Pre / post setup switching
// ----------------------------
function setupDashboardState() {
const complete = storage.get("commonshub_setup_complete") === "1";

const pre = document.getElementById("preSetup");
const post = document.getElementById("postSetup");
const navSubtitle = document.getElementById("navSubtitle");

if (pre && post) {
pre.style.display = complete ? "none" : "block";
post.style.display = complete ? "block" : "none";
}

if (navSubtitle) {
navSubtitle.textContent = complete
? "Health + key actions"
: "Live + next step";
}
}

// ----------------------------
// 3) DNS state (dashboard header)
// Uses:
//   body data-domain-type / data-dns-status
//   localStorage overrides if present
// Allowed domain types:
//   commonshub_subdomain
//   external_subdomain
//   custom_domain
// ----------------------------
function setupDnsState() {
const body = document.body;
const dnsPendingWrap = document.getElementById("dnsPendingWrap");
const dnsVerifiedWrap = document.getElementById("dnsVerifiedWrap");
const checkDnsBtn = document.getElementById("checkDnsBtn");

if (!dnsPendingWrap || !dnsVerifiedWrap || !checkDnsBtn) return;

let domainType =
storage.get("commonshub_domain_type") ||
body.dataset.domainType ||
"commonshub_subdomain";

let dnsStatus =
storage.get("commonshub_dns_status") ||
body.dataset.dnsStatus ||
"not_applicable";

function needsDns(domainTypeValue) {
return (
domainTypeValue === "external_subdomain" ||
domainTypeValue === "custom_domain"
);
}

function renderDnsState() {
dnsPendingWrap.style.display = "none";
dnsVerifiedWrap.style.display = "none";

if (!needsDns(domainType)) return;

if (dnsStatus === "verified") {
dnsVerifiedWrap.style.display = "inline-flex";
} else {
dnsPendingWrap.style.display = "inline-flex";
}
}

checkDnsBtn.addEventListener("click", () => {
const oldText = checkDnsBtn.textContent;
checkDnsBtn.textContent = "Checking...";
checkDnsBtn.disabled = true;

setTimeout(() => {
dnsStatus = "verified";
storage.set("commonshub_dns_status", "verified");
body.dataset.dnsStatus = "verified";

renderDnsState();

checkDnsBtn.textContent = oldText;
checkDnsBtn.disabled = false;
}, 900);
});

renderDnsState();
}

// ----------------------------
// 4) Mastodon access buttons
// Show "Sign in" first, then "Mastodon dashboard"
// after login button has been clicked once
// ----------------------------
function setupMastodonAdminButtons() {
const loginBtn = document.getElementById("mastodonLoginBtn");
const adminBtn = document.getElementById("mastodonAdminBtn");
const hint = document.getElementById("mastodonHint");

if (!loginBtn || !adminBtn) return;

const KEY = "commonshub_mastodon_login_attempted";
const loginAttempted = storage.get(KEY) === "1";

loginBtn.style.display = loginAttempted ? "none" : "inline-flex";
adminBtn.style.display = loginAttempted ? "inline-flex" : "none";
if (hint) hint.style.display = loginAttempted ? "none" : "block";

loginBtn.addEventListener("click", () => {
storage.set(KEY, "1");
setTimeout(() => window.location.reload(), 150);
});
}

// ----------------------------
// 5) Guided setup checklist
// ----------------------------
function setupChecklist() {
const checklistEl = document.getElementById("setupChecklist");
if (!checklistEl) return;

const host = "https://peakx.social";
const DONE_KEY = "commonshub_setup_checklist_done_v1";

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
"I’m opening a new community space on Mastodon. It’s a calm, chronological room for thoughtful discussion — no ads, no algorithmic feed.\n\nJoin here: [INVITE LINK]\n\nIf you join, reply with an intro + what you hope to contribute.",
};

const steps = [
{
id: "login",
title: "Sign in to Mastodon",
why: "You’ll need an authenticated Mastodon session before admin links will work.",
openUrl: `${host}/auth/sign_in`,
},
{
id: "owner_profile",
title: "Owner profile basics",
why: "Set display name + bio so the room feels hosted and credible.",
openUrl: `${host}/settings/profile`,
},
{
id: "about",
title: "About text",
why: "This becomes the server description + sets expectations for new members.",
openUrl: `${host}/admin/settings/about`,
copyKey: "about_long_description",
copyLabel: "Suggested About / long description",
},
{
id: "registrations",
title: "Registrations",
why: "Decide whether signups are invite-only, approval-based, or open.",
openUrl: `${host}/admin/settings/registrations`,
},
{
id: "branding",
title: "Branding",
why: "Optional. If you want: set icon + banner. (We’re not storing assets in MVP.)",
openUrl: `${host}/admin/settings/branding`,
},
{
id: "discovery",
title: "Discovery",
why: "Controls how visible the instance is (directory, discovery surfaces).",
openUrl: `${host}/admin/settings/discovery`,
},
{
id: "invites",
title: "Invites",
why: "Generate invite links and share them with your initial collaborators.",
openUrl: `${host}/admin/invites`,
copyKey: "invite_message",
copyLabel: "Suggested invite message",
},
];

function loadDone() {
try {
return JSON.parse(storage.get(DONE_KEY, "{}"));
} catch {
return {};
}
}

function saveDone(done) {
storage.set(DONE_KEY, JSON.stringify(done));
}

function render() {
const done = loadDone();
checklistEl.innerHTML = "";

steps.forEach((step) => {
const isDone = !!done[step.id];
const row = document.createElement("div");
row.className = "item";
row.style.alignItems = "flex-start";
row.style.gap = "12px";
row.style.padding = "14px 0";
row.style.borderBottom = "1px solid var(--line, #d9e2dc)";

row.innerHTML = `
<div style="flex:1;">
<div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
<b style="font-size:14px;">${step.title}</b>
${
isDone
? `<span class="chip" style="font-size:12px;">Done</span>`
: `<span class="chip" style="font-size:12px; opacity:.75;">To do</span>`
}
</div>

<div class="muted" style="margin-top:6px; font-size:13px; line-height:1.35;">
${step.why}
</div>

${
step.copyKey
? `
<div style="margin-top:10px;">
<a
href="#"
data-toggle-copy="${step.id}"
class="secondary"
style="display:inline-flex; width:auto; padding:8px 10px;"
>
${isDone ? "Show suggested copy" : "Hide suggested copy"}
</a>

<div data-copy-wrap="${step.id}" style="margin-top:10px; ${isDone ? "display:none;" : ""}">
<div class="muted" style="font-size:12px; margin-bottom:6px;">
${step.copyLabel}
</div>
<textarea
readonly
style="width:100%; min-height:110px; resize:vertical; padding:10px; border-radius:12px; border:1px solid #d9e2dc; font-size:12px; line-height:1.35; background:rgba(16,32,24,.03);"
>${copyPack[step.copyKey]}</textarea>
<div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
<button
class="secondary"
data-copy-btn="${step.id}"
type="button"
style="width:auto;"
>
Copy text
</button>
</div>
</div>
</div>
`
: ""
}
</div>

<div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
<a
class="secondary"
href="${step.openUrl}"
target="_blank"
rel="noopener"
style="width:auto;"
>
Open
</a>
<button
class="secondary"
type="button"
data-done-btn="${step.id}"
style="width:auto;"
>
${isDone ? "Mark not done" : "Mark done"}
</button>
</div>
`;

checklistEl.appendChild(row);
});

checklistEl.querySelectorAll("[data-done-btn]").forEach((btn) => {
btn.addEventListener("click", () => {
const id = btn.getAttribute("data-done-btn");
const done = loadDone();
done[id] = !done[id];
saveDone(done);
render();
});
});

checklistEl.querySelectorAll("[data-toggle-copy]").forEach((link) => {
link.addEventListener("click", (e) => {
e.preventDefault();
const id = link.getAttribute("data-toggle-copy");
const wrap = checklistEl.querySelector(`[data-copy-wrap="${id}"]`);
if (!wrap) return;

const showing = wrap.style.display !== "none";
wrap.style.display = showing ? "none" : "block";
link.textContent = showing
? "Show suggested copy"
: "Hide suggested copy";
});
});

checklistEl.querySelectorAll("[data-copy-btn]").forEach((btn) => {
btn.addEventListener("click", async () => {
const id = btn.getAttribute("data-copy-btn");
const step = steps.find((s) => s.id === id);
if (!step?.copyKey) return;

const ok = await copyText(copyPack[step.copyKey]);
flashButtonText(btn, ok ? "Copied" : "Copy failed");
});
});
}

render();
}

// ----------------------------
// 6) Copy invite link
// ----------------------------
function setupInviteCopy() {
const copyBtn = document.getElementById("copyInviteBtn");
const inviteField = document.getElementById("inviteField");
const inviteInput = document.getElementById("inviteLink");

if (!copyBtn || !inviteInput) return;

copyBtn.addEventListener("click", async () => {
if (inviteField) inviteField.style.display = "block";

inviteInput.focus();
inviteInput.select();

const ok = await copyText(inviteInput.value);
flashButtonText(copyBtn, ok ? "Copied" : "Copy failed");
});
}

// ----------------------------
// 7) Reset flow
// ----------------------------
function resetFlow(kind) {
const baseKeys = [
"commonshub_server_live",
"commonshub_setup_complete",
"commonshub_setup_step",
"commonshub_celebrate_once",
"commonshub_mastodon_login_attempted",
];

const fundingKeys = [
"commonshub_stripe_connected",
"commonshub_funding_enabled",
"commonshub_funding_subs_on",
"commonshub_funding_tips_on",
];

if (kind === "all" || kind === "server") {
[...baseKeys, ...fundingKeys].forEach((key) => storage.remove(key));
} else if (kind === "community") {
[
"commonshub_setup_complete",
"commonshub_setup_step",
"commonshub_celebrate_once",
"commonshub_mastodon_login_attempted",
].forEach((key) => storage.remove(key));
}

try {
sessionStorage.removeItem("commonshub_in_setup_flow");
} catch {}

const target =
kind === "server"
? "setup.html"
: kind === "community"
? "dashboard.html"
: "index.html";

window.location.href = target;
}

function setupResetHandlers() {
document.addEventListener("click", (e) => {
const el = e.target?.closest?.("[data-reset]");
if (!el) return;

e.preventDefault();
const kind = (el.getAttribute("data-reset") || "all").toLowerCase();

if (!["all", "server", "community"].includes(kind)) return;
resetFlow(kind);
});
}

// ----------------------------
// 8) Funding UI (dashboard)
// ----------------------------
function setupFundingUi() {
const stripeStatus = document.getElementById("stripeStatus");
const fundingStatus = document.getElementById("fundingStatus");
const fundingSubcopy = document.getElementById("fundingSubcopy");
const fundingPrimaryBtn = document.getElementById("fundingPrimaryBtn");
const fundingCtaWrap = document.getElementById("fundingCtaWrap");
const fundingLiveActions = document.getElementById("fundingLiveActions");

if (!fundingPrimaryBtn || !fundingCtaWrap || !fundingLiveActions) return;

const stripeConnected = storage.get("commonshub_stripe_connected") === "1";
const fundingEnabled = storage.get("commonshub_funding_enabled") === "1";

fundingCtaWrap.style.display = "flex";
fundingLiveActions.style.display = "none";

if (stripeStatus) {
stripeStatus.textContent = stripeConnected ? "Connected" : "Not connected";
}

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

if (fundingStatus) fundingStatus.textContent = "Live";
if (fundingSubcopy) {
fundingSubcopy.textContent = "Community funding is live and shareable.";
}

fundingCtaWrap.style.display = "none";
fundingLiveActions.style.display = "block";
}

// ----------------------------
// 9) Service tabs
// ----------------------------
function setupServiceTabs() {
const tabs = Array.from(document.querySelectorAll("[data-service-tab]"));
const panels = Array.from(document.querySelectorAll("[data-service-panel]"));

if (!tabs.length || !panels.length) return;

function activateTab(name) {
tabs.forEach((tab) => {
const active = tab.getAttribute("data-service-tab") === name;
tab.classList.toggle("active", active);
});

panels.forEach((panel) => {
const show = panel.getAttribute("data-service-panel") === name;
panel.classList.toggle("active", show);
panel.style.display = show ? "block" : "none";
});
}

tabs.forEach((tab) => {
tab.addEventListener("click", () => {
activateTab(tab.getAttribute("data-service-tab"));
});
});

const initial =
document.querySelector("[data-service-tab].active")?.getAttribute("data-service-tab") ||
"mastodon";

activateTab(initial);
}

// ----------------------------
// 10) Launch setup steps page
// ----------------------------
function setupLaunchSteps() {
const TOTAL_STEPS = 7;
const steps = Array.from(document.querySelectorAll(".setupStep"));
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");

if (!steps.length || !progressBar || !progressText || !progressPercent) return;

function setStepState(step, state) {
step.classList.remove("locked", "open", "done");
step.classList.add(state);

const toggleLink = step.querySelector(".stepToggleLink");
if (!toggleLink) return;

if (state === "open") toggleLink.textContent = "Close";
if (state === "done") toggleLink.textContent = "Manage";
if (state === "locked") toggleLink.textContent = "Setup";
}

function updateProgress() {
const completed = document.querySelectorAll(".setupStep.done").length;
const percent = (completed / TOTAL_STEPS) * 100;
const nextStep = Math.min(completed + 1, TOTAL_STEPS);

progressBar.style.width = `${percent}%`;
progressText.textContent =
completed === TOTAL_STEPS
? "All steps complete"
: `Step ${nextStep} of ${TOTAL_STEPS}`;
progressPercent.textContent = `${Math.round(percent)}% complete`;
}

function markStepDone(step) {
const textWrap = step.querySelector(".stepTextWrap");
const doneBar = step.querySelector(".setupStepDoneBar");
const toggleLink = step.querySelector(".stepToggleLink");

if (textWrap) {
textWrap.classList.add("is-hidden");
}

setStepState(step, "done");

if (toggleLink) {
toggleLink.textContent = "Manage";
}

updateProgress();
}

steps.forEach((step) => {
const doneBtn = step.querySelector(".doneBtn");
const closeBtn = step.querySelector(".closeBtn");
const toggleLink = step.querySelector(".stepToggleLink");
const copyBtn = step.querySelector(".copyBtn");
const textArea = step.querySelector("textarea");
const textWrap = step.querySelector(".stepTextWrap");
const hasText = step.dataset.hasText === "true";

if (doneBtn) {
doneBtn.addEventListener("click", () => {
markStepDone(step);
});
}
if (toggleLink) {
toggleLink.addEventListener("click", (e) => {
e.preventDefault();

if (step.classList.contains("done")) {
setStepState(step, "open");
if (textWrap) {
textWrap.classList.add("is-hidden");
}
return;
}

if (step.classList.contains("open")) {
setStepState(step, "locked");
if (textWrap) {
textWrap.classList.remove("is-hidden");
}
return;
}

setStepState(step, "open");
});
}

if (closeBtn) {
closeBtn.addEventListener("click", () => {
setStepState(step, "locked");
if (textWrap) {
textWrap.classList.remove("is-hidden");
}
});
}

if (copyBtn && textArea) {
copyBtn.addEventListener("click", async () => {
const ok = await copyText(textArea.value.trim());
flashButtonText(copyBtn, ok ? "Copied" : "Copy failed");
});
}

if (textWrap && step.classList.contains("done")) {
textWrap.classList.add("is-hidden");
}
});

updateProgress();
}


// ----------------------------
// Init
// ----------------------------
setupNavToggle();
setupDashboardState();
setupDnsState();
setupMastodonAdminButtons();
setupChecklist();
setupInviteCopy();
setupResetHandlers();
setupFundingUi();
setupServiceTabs();
setupLaunchSteps();
})();
