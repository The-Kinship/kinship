/* The Kinship: shared code for the Sects pages (password gate, sheet reader, sect details). */
(function () {
  "use strict";

  // ---- Paste the published link of your "SectContent" tab here (CSV format). ----
  // While this is empty, the pages show built-in SAMPLE content so you can see the layout.
  const SECT_URL = "";

  // ---- The four sects (plus the hidden crypt). Passwords are stored as hashes, not plain text. ----
  const SECTS = {
    onyx:  { name: "The Onyx Blood Guard", leader: "The Prefect",            img: "images/onyx.jpg",       color: "#8b5cf6", blurb: "Magic, research, and the occult.",       hash: "13f4452695183739eb80a1a250be23147b44575ef3659698e1b084a8a074cbe5" },
    iron:  { name: "The Iron Vanguard",    leader: "The Vanguard Commander", img: "images/vanguard.jpg",   color: "#8fa6cf", blurb: "Military, patrols, and peacekeeping.",    hash: "e5e5517567dd14197466174be604ca1e7da814d301130f8905f9d78d53f838b0" },
    life:  { name: "The Life Watch",       leader: "The Life Warden",        img: "images/lifewatch.jpg",  color: "#4f9d5d", blurb: "Healing of body and mind.",               hash: "1845ef570a25ca2cf3d34645b5b05d31d7866eb6067a4d040929da6f76dc81d2" },
    ember: { name: "The Ember Court",      leader: "The Baron / Baroness",   img: "images/ember-court.jpg",color: "#d9472b", blurb: "Social RP, events, and welcomes.",        hash: "edf229697b75a44502a466456593e7297c3306f921f4a898b173e99fcade09ea" },
    crypt: { name: "The Onyx Crypt",       leader: "",                       img: "images/onyx.jpg",       color: "#8b5cf6", blurb: "",                                        hash: "9cad0d76f349ee9d23b3a9d877db38d9450708b2aa669292560044a4a7c2f4bc", hidden: true }
  };
  const ORDER = ["onyx", "iron", "life", "ember"];
  const SALT = "kinship:";

  const SAMPLE = [{"sect": "onyx", "section": "info", "title": "About this sect", "text": "Our magic section. It handles the research, study, and employment of all magical aspects for the FC. Great for summoners, mages, warlocks, anyone interested in the occult, and RPs with heavy magic.", "order": 1}, {"sect": "onyx", "section": "plot", "title": "Sample plot", "text": "This is a sample plot. Replace it in the SectContent tab of your Google Sheet.", "order": 1}, {"sect": "onyx", "section": "notice", "title": "Sample notice", "text": "Notices for this sect appear here. Replace this in your sheet.", "order": 1}, {"sect": "onyx", "section": "rules", "title": "Sample rule 1", "text": "Replace this with one of your sect's rules (rule 1).", "order": 1}, {"sect": "onyx", "section": "rules", "title": "Sample rule 2", "text": "Replace this with one of your sect's rules (rule 2).", "order": 2}, {"sect": "onyx", "section": "rules", "title": "Sample rule 3", "text": "Replace this with one of your sect's rules (rule 3).", "order": 3}, {"sect": "onyx", "section": "member", "title": "Sample Character", "text": "Member", "order": 1}, {"sect": "onyx", "section": "member", "title": "Another Character", "text": "Member", "order": 2}, {"sect": "iron", "section": "info", "title": "About this sect", "text": "Our military sect and peacekeepers. Heavy RP combat. Great for anyone RPing a fighter, guard, or knight, or anyone whose main RP style is fighting.", "order": 1}, {"sect": "iron", "section": "plot", "title": "Sample plot", "text": "This is a sample plot. Replace it in the SectContent tab of your Google Sheet.", "order": 1}, {"sect": "iron", "section": "notice", "title": "Sample notice", "text": "Notices for this sect appear here. Replace this in your sheet.", "order": 1}, {"sect": "iron", "section": "rules", "title": "Sample rule 1", "text": "Replace this with one of your sect's rules (rule 1).", "order": 1}, {"sect": "iron", "section": "rules", "title": "Sample rule 2", "text": "Replace this with one of your sect's rules (rule 2).", "order": 2}, {"sect": "iron", "section": "rules", "title": "Sample rule 3", "text": "Replace this with one of your sect's rules (rule 3).", "order": 3}, {"sect": "iron", "section": "member", "title": "Sample Character", "text": "Member", "order": 1}, {"sect": "iron", "section": "member", "title": "Another Character", "text": "Member", "order": 2}, {"sect": "life", "section": "info", "title": "About this sect", "text": "Our healing sect, for those whose main focus is the health and well-being of not only our members' bodies, but their minds as well. Great for healers and combat medics.", "order": 1}, {"sect": "life", "section": "plot", "title": "Sample plot", "text": "This is a sample plot. Replace it in the SectContent tab of your Google Sheet.", "order": 1}, {"sect": "life", "section": "notice", "title": "Sample notice", "text": "Notices for this sect appear here. Replace this in your sheet.", "order": 1}, {"sect": "life", "section": "rules", "title": "Sample rule 1", "text": "Replace this with one of your sect's rules (rule 1).", "order": 1}, {"sect": "life", "section": "rules", "title": "Sample rule 2", "text": "Replace this with one of your sect's rules (rule 2).", "order": 2}, {"sect": "life", "section": "rules", "title": "Sample rule 3", "text": "Replace this with one of your sect's rules (rule 3).", "order": 3}, {"sect": "life", "section": "member", "title": "Sample Character", "text": "Member", "order": 1}, {"sect": "life", "section": "member", "title": "Another Character", "text": "Member", "order": 2}, {"sect": "ember", "section": "info", "title": "About this sect", "text": "Strictly our social sect, designed to help push RP plots along, start and engage with new members in casual RP, and help new members find a sect to join. They plan events and social RPs.", "order": 1}, {"sect": "ember", "section": "plot", "title": "Sample plot", "text": "This is a sample plot. Replace it in the SectContent tab of your Google Sheet.", "order": 1}, {"sect": "ember", "section": "notice", "title": "Sample notice", "text": "Notices for this sect appear here. Replace this in your sheet.", "order": 1}, {"sect": "ember", "section": "rules", "title": "Sample rule 1", "text": "Replace this with one of your sect's rules (rule 1).", "order": 1}, {"sect": "ember", "section": "rules", "title": "Sample rule 2", "text": "Replace this with one of your sect's rules (rule 2).", "order": 2}, {"sect": "ember", "section": "rules", "title": "Sample rule 3", "text": "Replace this with one of your sect's rules (rule 3).", "order": 3}, {"sect": "ember", "section": "member", "title": "Sample Character", "text": "Member", "order": 1}, {"sect": "ember", "section": "member", "title": "Another Character", "text": "Member", "order": 2}, {"sect": "crypt", "section": "info", "title": "Welcome", "text": "This is a placeholder page. Replace this text in the SectContent tab of your Google Sheet.", "order": 1}, {"sect": "crypt", "section": "plot", "title": "Sample plot", "text": "This is a sample plot for the Crypt. Replace it in your sheet.", "order": 1}];

  // ---------- SHA-256 (built-in browser version, with a small fallback) ----------
  function sha256Fallback(bytes) {
    const primes = []; for (let n = 2; primes.length < 64; n++) { if (primes.every(p => n % p)) primes.push(n); }
    const frac = x => Math.floor((x - Math.floor(x)) * 4294967296);
    const K = primes.map(p => frac(Math.cbrt(p)));
    let H = primes.slice(0, 8).map(p => frac(Math.sqrt(p)));
    const l = bytes.length, padded = new Uint8Array(((l + 9 + 63) >> 6) << 6);
    padded.set(bytes); padded[l] = 0x80;
    const dv = new DataView(padded.buffer);
    dv.setUint32(padded.length - 4, (l * 8) >>> 0);
    dv.setUint32(padded.length - 8, Math.floor(l * 8 / 4294967296));
    const w = new Uint32Array(64);
    const rr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < padded.length; i += 64) {
      for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) {
        const s0 = rr(w[t - 15], 7) ^ rr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rr(w[t - 2], 17) ^ rr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
        const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H = [a, b, c, d, e, f, g, h].map((x, j) => (H[j] + x) >>> 0);
    }
    return H.map(x => x.toString(16).padStart(8, "0")).join("");
  }
  async function sha256Hex(str) {
    const bytes = new TextEncoder().encode(str);
    if (window.crypto && crypto.subtle) {
      try {
        const buf = await crypto.subtle.digest("SHA-256", bytes);
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
      } catch (e) { /* fall through */ }
    }
    return sha256Fallback(bytes);
  }
  async function checkPassword(key, pw) {
    const s = SECTS[key]; if (!s) return false;
    return (await sha256Hex(SALT + String(pw).trim().toLowerCase())) === s.hash;
  }

  // ---------- "Unlocked" memory (never stores the password itself) ----------
  const flag = k => "kinship.unlock." + k;
  function isUnlocked(key) {
    try { if (localStorage.getItem(flag(key)) === "1") return true; } catch (e) {}
    try { if (sessionStorage.getItem(flag(key)) === "1") return true; } catch (e) {}
    return false;
  }
  function setUnlocked(key, remember) {
    try { (remember ? localStorage : sessionStorage).setItem(flag(key), "1"); } catch (e) {}
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
      const ok = await checkPassword(key, input.value);
      go.disabled = false;
      if (ok) {
        setUnlocked(key, cb.checked);
        ov.remove();
        if (opts.onSuccess) opts.onSuccess();
      } else {
        err.textContent = "That isn't right. Try again.";
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

  // ---------- Sheet reader ----------
  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim() !== ""));
  }
  async function loadRows() {
    if (!SECT_URL) return { rows: SAMPLE, sample: true };
    const res = await fetch(SECT_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const table = parseCSV(await res.text());
    const head = table[0].map(h => h.trim().toLowerCase());
    const ix = n => head.indexOf(n);
    const rows = table.slice(1).map(r => ({
      sect: (r[ix("sect")] || "").trim().toLowerCase(),
      section: (r[ix("section")] || "").trim().toLowerCase(),
      title: (r[ix("title")] || "").trim(),
      text: (r[ix("text")] || "").trim(),
      order: parseFloat(r[ix("order")]) || 999
    })).filter(r => r.sect && r.section);
    return { rows, sample: false };
  }

  window.Kinship = { SECTS, ORDER, openGate, isUnlocked, setUnlocked, checkPassword, loadRows };
})();
