/* The Kinship: shared code for the Sects pages (password gate and page loading, both through the Kinship server). */
(function () {
  "use strict";

  // The sect passwords and the sect pages live on the Kinship server. Nothing secret is kept in this file.
  const API = "https://kinship-combat.thekinship-ffxiv.workers.dev/api/sects/open";

  // ---- The four sects (plus the hidden crypt). Passwords are checked by the server. ----
  const SECTS = {
    onyx:  { name: "The Onyx Blood Guard", leader: "The Prefect",            img: "images/onyx.jpg",       color: "#8b5cf6", blurb: "Magic, research, and the occult." },
    iron:  { name: "The Iron Vanguard",    leader: "The Vanguard Commander", img: "images/vanguard.jpg",   color: "#8fa6cf", blurb: "Military, patrols, and peacekeeping." },
    life:  { name: "The Life Watch",       leader: "The Life Warden",        img: "images/lifewatch.jpg",  color: "#4f9d5d", blurb: "Healing of body and mind." },
    ember: { name: "The Ember Court",      leader: "The Baron / Baroness",   img: "images/ember-court.jpg",color: "#d9472b", blurb: "Social RP, events, and welcomes." },
    crypt: { name: "The Onyx Crypt",       leader: "",                       img: "images/onyx.jpg",       color: "#8b5cf6", blurb: "", hidden: true }
  };
  const ORDER = ["onyx", "iron", "life", "ember"];

  // ---------- "Unlocked" memory: the server's entry token for a sect (never the password) ----------
  const flag = k => "kinship.sect." + k;
  const cache = {};   // sect pages already loaded in this visit
  function token(key) {
    try { const t = localStorage.getItem(flag(key)); if (t) return t; } catch (e) {}
    try { const t = sessionStorage.getItem(flag(key)); if (t) return t; } catch (e) {}
    return "";
  }
  function isUnlocked(key) { return !!token(key); }
  function forget(key) {
    delete cache[key];
    try { localStorage.removeItem(flag(key)); } catch (e) {}
    try { sessionStorage.removeItem(flag(key)); } catch (e) {}
  }
  function remember(key, t, keep) {
    forget(key);
    try { (keep ? localStorage : sessionStorage).setItem(flag(key), t); } catch (e) {}
  }

  async function ask(body) {
    let res;
    try { res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
    catch (e) { const err = new Error("Couldn't reach the server. Check your connection and try again."); err.status = 0; throw err; }
    let data = null;
    try { data = await res.json(); } catch (e) {}
    if (!res.ok) { const err = new Error((data && data.error) || "The server answered " + res.status + "."); err.status = res.status; throw err; }
    return data;
  }
  const toRows = (key, data) => (data.rows || []).map(r => ({ sect: key, section: String(r.section || "").toLowerCase(), title: r.title || "", text: r.text || "", order: Number.isFinite(r.order) ? r.order : 999 }));

  // Checks a password with the server. It only sends the pages if the password is right.
  async function enter(key, password, keep) {
    const data = await ask({ sect: key, password });
    remember(key, data.token, keep);
    cache[key] = toRows(key, data);
  }

  // The pages of an unlocked sect. If the saved entry stopped working (the password was changed), it is forgotten.
  async function loadRows(key) {
    if (cache[key]) return { rows: cache[key], sample: false };
    const t = token(key);
    if (!t) { const err = new Error("Locked"); err.status = 401; throw err; }
    try { cache[key] = toRows(key, await ask({ sect: key, token: t })); }
    catch (e) { if (e.status === 401) forget(key); throw e; }
    return { rows: cache[key], sample: false };
  }

  // ---------- The password prompt ----------
  function openGate(key, opts) {
    opts = opts || {};
    const s = SECTS[key]; if (!s) return;
    const ov = document.createElement("div");
    ov.className = "gate-ov";
    ov.style.setProperty("--c", s.color);

    const box = document.createElement("form");
    box.className = "gate"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Password for " + s.name);

    const img = document.createElement("img"); img.src = s.img; img.alt = "";
    const h = document.createElement("h3"); h.textContent = s.name;
    const p = document.createElement("p"); p.className = "gate-sub"; p.textContent = "Members only. Enter the password to continue.";
    const input = document.createElement("input");
    input.type = "password"; input.autocomplete = "off"; input.autocapitalize = "none"; input.spellcheck = false;
    input.placeholder = "Password"; input.setAttribute("aria-label", "Password");
    const err = document.createElement("p"); err.className = "gate-err"; err.setAttribute("role", "alert"); err.textContent = "";
    const rem = document.createElement("label"); rem.className = "gate-rem";
    const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = true;
    rem.append(cb, document.createTextNode(" Remember me on this device"));
    const go = document.createElement("button"); go.type = "submit"; go.className = "gate-go"; go.textContent = "Enter";
    box.append(img, h, p, input, err, rem, go);

    const close = document.createElement(opts.dismissable ? "button" : "a");
    close.className = "gate-close";
    if (opts.dismissable) { close.type = "button"; close.textContent = "Cancel"; close.addEventListener("click", () => ov.remove()); }
    else { close.href = opts.backHref || "sects.html"; close.textContent = "← Back to The Sects"; }
    box.append(close);

    box.addEventListener("submit", async e => {
      e.preventDefault();
      go.disabled = true;
      err.textContent = "";
      let ok = false, message = "";
      try { await enter(key, input.value, cb.checked); ok = true; }
      catch (e) { message = e.message; }
      go.disabled = false;
      if (ok) {
        ov.remove();
        if (opts.onSuccess) opts.onSuccess();
      } else {
        err.textContent = message || "That isn't right. Try again.";
        input.value = ""; input.focus();
        box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
      }
    });
    if (opts.dismissable) {
      ov.addEventListener("mousedown", e => { if (e.target === ov) ov.remove(); });
      document.addEventListener("keydown", function esc(e) {
        if (!document.body.contains(ov)) { document.removeEventListener("keydown", esc); return; }
        if (e.key === "Escape") ov.remove();
      });
    }
    ov.append(box); document.body.append(ov);
    setTimeout(() => input.focus(), 30);
  }

  window.Kinship = { SECTS, ORDER, openGate, isUnlocked, loadRows };
})();
