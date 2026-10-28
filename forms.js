// The Kinship: application forms. Sends each form by email through Web3Forms (a free form service).
// ---------------------------------------------------------------------------------------------
// STEP 1: paste your Web3Forms access keys below. One key per email address. If all three forms
//         should go to the same inbox, paste the SAME key three times. Keys are safe to be public.
// ---------------------------------------------------------------------------------------------
const FORM_KEYS = {
  fc:    "PASTE-FC-KEY-HERE",
  sect:  "PASTE-SECT-KEY-HERE",
  alpha: "PASTE-ALPHA-KEY-HERE",
};
const CONTACT_EMAIL = "Thekinship.ffxiv@gmail.com";   // shown if something goes wrong
// The Google Sheet (Faction tab) is also used by the Alpha page to show how many spots are left.
const FACTION_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAGpMH_xMZvl3V_Pxo-e57S1D9Q2RhjpGxtN2romaYZer0CjAI3qlYzgZa4SUpNZsIbX0Dt3ag6-Jg/pub?gid=0&single=true&output=csv";

const WORLDS = {
  "Aether": ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"],
  "Primal": ["Behemoth", "Excalibur", "Exodus", "Famfrit", "Hyperion", "Lamia", "Leviathan", "Ultros"],
  "Crystal": ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"],
  "Dynamis": ["Cuchulainn", "Golem", "Halicarnassus", "Kraken", "Maduin", "Marilith", "Rafflesia", "Seraph"],
  "Chaos": ["Cerberus", "Louisoix", "Moogle", "Omega", "Phantom", "Ragnarok", "Sagittarius", "Spriggan"],
  "Light": ["Alpha", "Lich", "Odin", "Phoenix", "Raiden", "Shiva", "Twintania", "Zodiark"],
  "Shadow": ["Innocence", "Pixie", "Titania", "Tycoon"],
  "Materia": ["Bismarck", "Ravana", "Sephirot", "Sophia", "Zurvan"],
  "Elemental": ["Aegis", "Atomos", "Carbuncle", "Garuda", "Gungnir", "Kujata", "Tonberry", "Typhon"],
  "Gaia": ["Alexander", "Bahamut", "Durandal", "Fenrir", "Ifrit", "Ridill", "Tiamat", "Ultima"],
  "Mana": ["Anima", "Asura", "Chocobo", "Hades", "Ixion", "Masamune", "Pandaemonium", "Titan"],
  "Meteor": ["Belias", "Mandragora", "Ramuh", "Shinryu", "Unicorn", "Valefor", "Yojimbo", "Zeromus"],
};
const SECTS = ["Onyx Blood Guard", "Iron Vanguard", "Life Watch", "Ember Court"];

const $ = id => document.getElementById(id);
const opt = (value, label) => { const o = document.createElement("option"); o.value = value; o.textContent = label || value; return o; };

// Home world / data center pair: choosing a data center fills in its worlds.
function worldPicker(dcId, worldId) {
  const dc = $(dcId), w = $(worldId);
  dc.append(opt("", "Choose a data center"));
  Object.keys(WORLDS).forEach(k => dc.append(opt(k)));
  dc.append(opt("Other", "Other / not listed"));
  const fill = () => {
    w.textContent = "";
    const list = WORLDS[dc.value];
    if (!dc.value) { w.append(opt("", "Choose a data center first")); w.disabled = true; return; }
    w.disabled = false;
    w.append(opt("", "Choose a home world"));
    (list || []).forEach(x => w.append(opt(x)));
    w.append(opt("Other", "Other / not listed"));
  };
  dc.addEventListener("change", fill);
  fill();
}
function sectPicker(id, extra) {
  const s = $(id);
  s.append(opt("", "Choose a sect"));
  SECTS.forEach(x => s.append(opt(x)));
  (extra || []).forEach(x => s.append(opt(x)));
}
// Shows or hides a block when a radio / select changes. `show` gets the current value.
function toggleOn(inputName, blockId, show) {
  const block = $(blockId);
  const inputs = document.querySelectorAll(`[name="${inputName}"]`);
  const update = () => {
    const el = [...inputs].find(i => i.type === "radio" ? i.checked : true);
    const v = inputs[0].type === "radio" ? (el ? el.value : "") : inputs[0].value;
    const on = show(v);
    block.hidden = !on;
    block.querySelectorAll("input, textarea, select").forEach(i => { i.disabled = !on; if (i.dataset.reqwhen) i.required = on; });
  };
  inputs.forEach(i => i.addEventListener("change", update));
  update();
}

// Sends the form. `subjectField` is the name of the field used in the email's subject line.
function wireForm(formId, key, title, subjectField) {
  const form = $(formId), btn = form.querySelector(".send"), err = $("formErr");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    err.hidden = true;
    if (/^PASTE-/.test(key)) { err.hidden = false; err.innerHTML = "This form isn't switched on yet. Please contact us at <a href=\"mailto:" + CONTACT_EMAIL + "\">" + CONTACT_EMAIL + "</a>."; return; }
    const data = new FormData(form), body = {};
    for (const [k, v] of data.entries()) { const t = String(v).trim(); if (t !== "" && !k.startsWith("_")) body[k] = t; }
    if (data.get("botcheck")) { done(); return; }          // a bot ticked the hidden box: pretend it worked
    body.access_key = key;
    body.subject = title + ": " + (data.get(subjectField) || "new application");
    body.from_name = "The Kinship website";
    btn.disabled = true; btn.textContent = "Sending...";
    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || out.success === false) throw new Error(out.message || ("HTTP " + res.status));
      done();
    } catch (ex) {
      btn.disabled = false; btn.textContent = "Send application";
      err.hidden = false;
      err.innerHTML = "Sorry, that didn't go through. Please try again, or email us at <a href=\"mailto:" + CONTACT_EMAIL + "\">" + CONTACT_EMAIL + "</a>.";
    }
  });
  function done() { form.hidden = true; $("thanks").hidden = false; window.scrollTo({ top: 0, behavior: "smooth" }); }
}

function parseCSV(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim() !== ""));
}
async function factionSheet() {
  const res = await fetch(FACTION_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const d = {};
  parseCSV(await res.text()).slice(1).forEach(r => { d[(r[0] || "").trim().toLowerCase()] = (r[1] || "").trim(); });
  return d;
}
