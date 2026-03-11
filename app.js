const LOCAL_FALLBACK = {
  app: {
    title: 'EU AI Act Navigator (Prototyp)',
    subtitle: 'Fragebasierter Schnellcheck mit Systemklasse, Pflichten und Artikel-4-Hilfestellungen.',
    disclaimer: 'Hinweis: Dies ist ein orientierender Prototyp und keine Rechtsberatung. Fuer verbindliche Einstufungen bitte juristisch pruefen.',
    copyright: 'Copyright by Dr. DirKInstitue',
  },
  roles: [
    { value: 'management', label: 'Geschaeftsfuehrung / Management' },
    { value: 'provider', label: 'Anbieter / Hersteller' },
    { value: 'deployer', label: 'Betreiber / Anwenderorganisation' },
    { value: 'compliance', label: 'Compliance / Datenschutz / Recht' },
    { value: 'it', label: 'IT / Security / Architektur' },
  ],
  systemTypes: [
    { value: 'chatbot', label: 'Chatbot / Assistent' },
    { value: 'scoring', label: 'Scoring / Klassifikation von Personen' },
    { value: 'decision_support', label: 'Entscheidungsunterstuetzung' },
    { value: 'biometric', label: 'Biometrisches System' },
    { value: 'content_gen', label: 'Generative KI / Content-Erzeugung' },
    { value: 'other', label: 'Sonstiges' },
  ],
  kritisSectors: [
    'Ernaehrung',
    'Finanz- und Versicherungswesen',
    'Gesundheit',
    'Informationstechnik und Telekommunikation',
    'Medien und Kultur',
    'Siedlungsabfallentsorgung',
    'Staat und Verwaltung',
    'Transport und Verkehr',
    'Wasser',
  ],
  systemSections: [
    {
      key: 'unacceptable',
      label: 'Potenziell Verboten',
      color: 'danger',
      description: 'Hinweise auf Praktiken, die nach EU AI Act untersagt sein koennen.',
      typicalTriggers: ['Social Scoring', 'Manipulative oder ausnutzende Systeme', 'Biometrische Kategorisierung in sensitiven Kontexten'],
      actions: ['Use Case sofort stoppen und juristisch bewerten', 'Management-Entscheidung dokumentieren', 'Alternativen ohne verbotene Funktion pruefen'],
    },
    {
      key: 'high',
      label: 'Potenziell Hochrisiko',
      color: 'warning',
      description: 'Hinweise auf Annex-III-nahe Einsaetze (z. B. Bildung, Arbeit, kritische Dienste).',
      typicalTriggers: ['Entscheidungen ueber Zugang zu Bildung oder Arbeit', 'Bewertung von Personen mit Grundrechtsbezug', 'Einsatz in KRITIS oder kritischer Infrastruktur'],
      actions: ['Risikomanagement und Daten-Governance planen', 'Technische Dokumentation aufbauen', 'Menschliche Aufsicht und Logging definieren'],
    },
    {
      key: 'limited',
      label: 'Begrenztes Risiko',
      color: 'info',
      description: 'Typisch fuer Systeme mit Transparenzpflichten (z. B. Nutzerhinweise).',
      typicalTriggers: ['Chatbot/Interaktionssystem', 'KI-generierte Inhalte fuer Endnutzer', 'Automatisierte Kommunikation'],
      actions: ['Transparenzhinweise sichtbar machen', 'Nutzer ueber KI-Einsatz informieren', 'Eskalation an Mensch bei Unsicherheit anbieten'],
    },
    {
      key: 'minimal',
      label: 'Minimales Risiko',
      color: 'success',
      description: 'Niedrige Auswirkungen ohne klare Hochrisiko-Indikatoren.',
      typicalTriggers: ['Interne Produktivitaet ohne Personenbewertung', 'Nicht-kritische Assistenzfunktionen', 'Kein Grundrechtsbezug'],
      actions: ['Basis-Governance trotzdem dokumentieren', 'Freiwillige Kontrollen etablieren', 'Artikel-4-Kompetenzmassnahmen beibehalten'],
    },
  ],
  article4: {
    title: 'Artikel 4 - AI Literacy (Kompetenzpflicht)',
    summary: 'Anbieter und Betreiber sollen angemessene Massnahmen treffen, damit beteiligte Personen ausreichende KI-Kompetenz besitzen.',
    checklist: [
      'Rollen mit KI-Verantwortung sind benannt',
      'Einstiegsschulung fuer alle relevanten Teams vorhanden',
      'Vertiefung fuer Hochrisiko-nahe Rollen definiert',
      'Dokumentierte Leitlinien zur sicheren Nutzung verfuegbar',
      'Regelmaessige Auffrischung und Wirksamkeitskontrolle eingeplant',
    ],
    evidenceExamples: [
      'Schulungskalender und Teilnahmeprotokolle',
      'Rollenmatrix (Owner, Reviewer, Freigabe)',
      'Nutzungsrichtlinie inkl. Do/Don\'t-Liste',
      'Audit-Notizen und Lessons Learned',
    ],
  },
  references: [
    { label: 'AI Act Uebersicht (DE)', url: 'https://artificialintelligenceact.eu/de/' },
  ],
};

const state = {
  framework: null,
};

const SECTOR_LABELS = {
  general: 'Allgemein',
  education: 'Bildung',
  employment: 'Arbeit / HR',
  health: 'Gesundheit',
  public: 'Oeffentliche Verwaltung',
  critical: 'Kritische Infrastruktur',
};

async function loadFramework() {
  try {
    const res = await fetch('./data/framework.de.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('framework load failed');
    return await res.json();
  } catch (_err) {
    return LOCAL_FALLBACK;
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sectionBadgeClass(color) {
  if (color === 'danger') return 'badge danger';
  if (color === 'warning') return 'badge warning';
  if (color === 'info') return 'badge info';
  if (color === 'success') return 'badge success';
  return 'badge neutral';
}

function fillSelect(id, options) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="">Bitte waehlen</option>' + options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('');
}

function labelFor(list, value) {
  const found = list.find((x) => x.value === value);
  return found ? found.label : value;
}

function sectorLabel(value) {
  return SECTOR_LABELS[value] || value;
}

function renderTop(framework) {
  setText('appTitle', framework.app.title);
  setText('appSubtitle', framework.app.subtitle);
  setText('appDisclaimer', framework.app.disclaimer);
  setText('copyrightText', framework.app.copyright);
}

function renderKritis(framework) {
  const target = document.getElementById('kritisList');
  target.innerHTML = framework.kritisSectors
    .map((s, i) => `<label class="kritis-item"><input type="checkbox" data-kritis="1" value="${s}" id="krit_${i}" /> ${s}</label>`)
    .join('');
}

function renderSystemSections(framework) {
  const target = document.getElementById('systemSections');
  target.innerHTML = '';

  framework.systemSections.forEach((section) => {
    const card = document.createElement('article');
    card.className = 'card sys-card';

    const triggers = section.typicalTriggers.map((x) => `<li>${x}</li>`).join('');
    const actions = section.actions.map((x) => `<li>${x}</li>`).join('');

    card.innerHTML = `
      <div class="${sectionBadgeClass(section.color)}">${section.label}</div>
      <p>${section.description}</p>
      <h4>Typische Trigger</h4>
      <ul>${triggers}</ul>
      <h4>Empfohlene Aktionen</h4>
      <ul>${actions}</ul>
    `;

    target.appendChild(card);
  });
}

function renderArticle4(framework) {
  setText('a4Title', framework.article4.title);
  setText('a4Summary', framework.article4.summary);

  const checklist = document.getElementById('a4Checklist');
  checklist.innerHTML = '';

  framework.article4.checklist.forEach((item, idx) => {
    const id = `a4_${idx}`;
    const wrap = document.createElement('label');
    wrap.innerHTML = `<input type="checkbox" data-a4="1" id="${id}" /> ${item}`;
    checklist.appendChild(wrap);
  });

  const ev = document.getElementById('a4Evidence');
  ev.innerHTML = framework.article4.evidenceExamples.map((x) => `<li>${x}</li>`).join('');

  updateA4Score();
}

function renderReferences(framework) {
  const list = document.getElementById('references');
  list.innerHTML = framework.references
    .map((r) => `<li><a href="${r.url}" target="_blank" rel="noreferrer">${r.label}</a></li>`)
    .join('');
}

function getA4Stats() {
  const boxes = Array.from(document.querySelectorAll('input[data-a4="1"]'));
  const done = boxes.filter((b) => b.checked).length;
  return { done, total: boxes.length };
}

function updateA4Score() {
  const stats = getA4Stats();
  setText('a4Score', `Reifegrad: ${stats.done}/${stats.total}`);
}

function getCheckedKritis() {
  return Array.from(document.querySelectorAll('input[data-kritis="1"]:checked')).map((x) => x.value);
}

function collectInputs() {
  return {
    role: document.getElementById('role').value,
    roleFree: document.getElementById('roleFree').value.trim(),
    systemType: document.getElementById('systemType').value,
    systemName: document.getElementById('systemName').value.trim(),
    sector: document.getElementById('sector').value,
    sectorFree: document.getElementById('sectorFree').value.toLowerCase().trim(),
    purpose: document.getElementById('purpose').value.toLowerCase().trim(),
    kritis: getCheckedKritis(),
    cPeople: document.getElementById('cPeople').checked,
    cRights: document.getElementById('cRights').checked,
    cBiometric: document.getElementById('cBiometric').checked,
    cVulnerable: document.getElementById('cVulnerable').checked,
    cScoring: document.getElementById('cScoring').checked,
    a4: getA4Stats(),
  };
}

function evaluateRisk(input) {
  const hasProhibitedSignal = input.purpose.includes('social scoring') || (input.cBiometric && input.cVulnerable && input.cScoring);
  if (hasProhibitedSignal) {
    return {
      key: 'unacceptable',
      reason: 'Es bestehen deutliche Signale fuer potenziell verbotene Praxis. Bitte sofort vertieft pruefen.',
      meta: input,
    };
  }

  const highSector = ['education', 'employment', 'health', 'public', 'critical'].includes(input.sector);
  const kritisSignal = input.kritis.length > 0 || input.sectorFree.includes('kritis');
  const highSystemType = ['scoring', 'decision_support', 'biometric'].includes(input.systemType);
  const hasHighSignal = (highSector && (input.cRights || input.cScoring)) || (highSystemType && (input.cRights || input.cBiometric)) || kritisSignal;

  if (hasHighSignal) {
    return {
      key: 'high',
      reason: 'Der Use Case wirkt Annex-III-nah und kann in Richtung Hochrisiko fallen.',
      meta: input,
    };
  }

  if (input.cPeople || input.systemType === 'chatbot' || input.systemType === 'content_gen' || input.purpose.includes('chatbot') || input.purpose.includes('generativ')) {
    return {
      key: 'limited',
      reason: 'Transparenzpflichten sind wahrscheinlich relevant (z. B. Kennzeichnung und Nutzerhinweise).',
      meta: input,
    };
  }

  return {
    key: 'minimal',
    reason: 'Aktuell keine starken Hochrisiko- oder Verbotsindikatoren erkannt.',
    meta: input,
  };
}

function computeRadarProfile(input) {
  const a4Done = input.a4.done;
  const a4Total = input.a4.total || 1;
  const a4Ratio = a4Done / a4Total;

  const stressSignals = [
    input.cRights,
    input.cBiometric,
    input.cVulnerable,
    input.cScoring,
    input.kritis.length > 0,
    input.sector === 'critical',
    ['scoring', 'decision_support', 'biometric'].includes(input.systemType),
  ].filter(Boolean).length;

  const governance = clamp(
    2 +
      (['management', 'compliance', 'provider'].includes(input.role) ? 1 : 0) +
      (a4Done >= 3 ? 1 : 0) +
      (input.systemName ? 1 : 0) -
      (stressSignals >= 4 ? 1 : 0),
    0,
    5
  );

  const transparency = clamp(
    2 +
      (input.cPeople ? 0 : 1) +
      (['chatbot', 'content_gen'].includes(input.systemType) ? 0 : 1) +
      ((input.purpose.includes('hinweis') || input.purpose.includes('kennzeich')) ? 1 : 0) +
      (a4Done >= 2 ? 1 : 0) -
      (input.cPeople && !input.purpose.includes('hinweis') ? 1 : 0),
    0,
    5
  );

  const dataProtection = clamp(
    2 +
      (input.role === 'compliance' ? 1 : 0) +
      (a4Done >= 3 ? 1 : 0) -
      (input.cBiometric ? 2 : 0) -
      (input.cRights ? 1 : 0) -
      (input.kritis.length > 0 ? 1 : 0),
    0,
    5
  );

  const humanOversight = clamp(
    2 +
      (['management', 'compliance'].includes(input.role) ? 1 : 0) +
      (a4Done >= 4 ? 1 : a4Done >= 2 ? 0 : -1) -
      (input.cScoring ? 1 : 0) -
      (input.cRights ? 1 : 0),
    0,
    5
  );

  const robustness = clamp(
    2 +
      (a4Done >= 3 ? 1 : 0) +
      (input.purpose.length >= 80 ? 1 : 0) -
      (input.kritis.length > 0 ? 1 : 0) -
      (input.sector === 'critical' ? 1 : 0) -
      (input.systemType === 'biometric' ? 1 : 0),
    0,
    5
  );

  const accountability = clamp(
    2 +
      (input.systemName ? 1 : 0) +
      (input.purpose.length >= 60 ? 1 : 0) +
      (a4Done >= 2 ? 1 : 0) -
      (stressSignals >= 5 ? 1 : 0),
    0,
    5
  );

  const aiLiteracy = clamp(Math.round(a4Ratio * 5), 0, 5);

  return {
    dimensions: [
      { key: 'governance', label: 'Governance', score: governance },
      { key: 'transparency', label: 'Transparenz', score: transparency },
      { key: 'dataProtection', label: 'Daten & Privacy', score: dataProtection },
      { key: 'humanOversight', label: 'Human Oversight', score: humanOversight },
      { key: 'robustness', label: 'Robustheit', score: robustness },
      { key: 'aiLiteracy', label: 'AI Literacy', score: aiLiteracy },
      { key: 'accountability', label: 'Accountability', score: accountability },
    ],
  };
}

function drawRadarChart(profile) {
  const canvas = document.getElementById('radarChart');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2 + 8;
  const maxRadius = Math.min(w, h) * 0.32;
  const levels = 5;
  const dims = profile.dimensions;
  const count = dims.length;

  const pointAt = (idx, radius) => {
    const angle = (-Math.PI / 2) + (idx * (Math.PI * 2) / count);
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  };

  for (let level = 1; level <= levels; level += 1) {
    const radius = (maxRadius * level) / levels;
    ctx.beginPath();
    for (let i = 0; i < count; i += 1) {
      const p = pointAt(i, radius);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = level === levels ? '#9eb4d2' : '#d6dfeb';
    ctx.lineWidth = level === levels ? 1.3 : 1;
    ctx.stroke();
  }

  for (let i = 0; i < count; i += 1) {
    const p = pointAt(i, maxRadius);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#d6dfeb';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.font = '12px Segoe UI';
  ctx.fillStyle = '#2b415f';
  dims.forEach((dim, i) => {
    const p = pointAt(i, maxRadius + 24);
    ctx.textAlign = p.x < cx - 10 ? 'right' : p.x > cx + 10 ? 'left' : 'center';
    ctx.textBaseline = p.y < cy ? 'bottom' : 'top';
    ctx.fillText(`${dim.label} (${dim.score})`, p.x, p.y);
  });

  ctx.beginPath();
  dims.forEach((dim, i) => {
    const radius = (maxRadius * dim.score) / levels;
    const p = pointAt(i, radius);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(11, 91, 211, 0.22)';
  ctx.strokeStyle = '#0b5bd3';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  dims.forEach((dim, i) => {
    const radius = (maxRadius * dim.score) / levels;
    const p = pointAt(i, radius);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0b5bd3';
    ctx.fill();
  });

  const avg = (dims.reduce((sum, d) => sum + d.score, 0) / dims.length).toFixed(1);
  ctx.fillStyle = '#0f2748';
  ctx.font = '600 13px Segoe UI';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Gesamt-Reifegrad: ${avg}/5`, cx, cy);
}

function buildRecommendations(profile, riskResult, input) {
  const recommendations = [];
  const byKey = {
    governance: 'Governance-Modell mit Rollen, Freigaben und Eskalationspfaden dokumentieren.',
    transparency: 'Transparenzhinweise fuer Nutzer sichtbar im System und in der Kommunikation platzieren.',
    dataProtection: 'DSGVO-/Privacy-Impact inkl. Datenklassifikation und Loeschkonzept formalisieren.',
    humanOversight: 'Menschliche Aufsicht mit klaren Override-Regeln und Vier-Augen-Prinzip einrichten.',
    robustness: 'Technische Kontrollen fuer Monitoring, Incident Response und Qualitaetsmetriken aufsetzen.',
    aiLiteracy: 'Artikel-4-Schulungsprogramm rollenbasiert planen und Teilnahme nachweisbar dokumentieren.',
    accountability: 'Use-Case-Dossier mit Zweck, Verantwortlichen, Versionierung und Audit-Trail fuehren.',
  };

  const sorted = [...profile.dimensions].sort((a, b) => a.score - b.score);
  sorted.forEach((dim) => {
    if (dim.score <= 2) recommendations.push(byKey[dim.key]);
  });

  if (riskResult.key === 'high' || riskResult.key === 'unacceptable') {
    recommendations.push('Vor produktivem Einsatz eine vertiefte juristische und regulatorische Pruefung durchfuehren.');
  }

  if (input.kritis.length > 0) {
    recommendations.push('KRITIS-Bezug im Risikoregister gesondert fuehren und sektorspezifische Anforderungen mappen.');
  }

  if (input.cPeople && !input.purpose.includes('hinweis')) {
    recommendations.push('Fuer direkte Mensch-Interaktion einen expliziten KI-Hinweis in UI/Output ergaenzen.');
  }

  if (input.a4.done < Math.ceil((input.a4.total || 1) * 0.6)) {
    recommendations.push('AI-Literacy-Reifegrad unter 60 %: kurzfristig Basis-Trainingszyklus fuer alle relevanten Rollen starten.');
  }

  const unique = [];
  recommendations.forEach((text) => {
    if (!unique.includes(text)) unique.push(text);
  });

  return unique.slice(0, 6);
}

function renderAutoRecommendations(items) {
  const list = document.getElementById('autoRecommendations');
  if (!items.length) {
    list.innerHTML = '<li>Aktuell keine zusaetzlichen Empfehlungen erforderlich.</li>';
    return;
  }
  list.innerHTML = items.map((x) => `<li>${x}</li>`).join('');
}

function showResult(resultKey, reason, meta) {
  const section = state.framework.systemSections.find((s) => s.key === resultKey);
  const badge = document.getElementById('resultBadge');
  badge.className = sectionBadgeClass(section.color);
  badge.textContent = section.label;

  setText('resultReason', reason);

  const list = document.getElementById('resultActions');
  list.innerHTML = section.actions.map((x) => `<li>${x}</li>`).join('');

  const metaText = [
    `Rolle: ${meta.role ? labelFor(state.framework.roles, meta.role) : '-'}${meta.roleFree ? ' | Freitext: ' + meta.roleFree : ''}`,
    `Systemtyp: ${labelFor(state.framework.systemTypes, meta.systemType)}`,
    `Systemname: ${meta.systemName || '-'}`,
    `Sektor: ${sectorLabel(meta.sector)}`,
    `KRITIS: ${meta.kritis.length ? meta.kritis.join(', ') : '-'}`,
  ].join(' | ');
  setText('resultMeta', metaText);
}

function renderBaselineInsights() {
  const baseline = {
    dimensions: [
      { key: 'governance', label: 'Governance', score: 2 },
      { key: 'transparency', label: 'Transparenz', score: 2 },
      { key: 'dataProtection', label: 'Daten & Privacy', score: 2 },
      { key: 'humanOversight', label: 'Human Oversight', score: 2 },
      { key: 'robustness', label: 'Robustheit', score: 2 },
      { key: 'aiLiteracy', label: 'AI Literacy', score: 2 },
      { key: 'accountability', label: 'Accountability', score: 2 },
    ],
  };

  drawRadarChart(baseline);
  renderAutoRecommendations(['Nach dem Schnellcheck erscheinen hier priorisierte Empfehlungen.']);
}

function clearFieldInvalidState(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const wrap = field.closest('.field');
  if (wrap) wrap.classList.remove('invalid');
}

function markFieldInvalid(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  const wrap = field.closest('.field');
  if (wrap) wrap.classList.add('invalid');
}

function setValidationMessage(messages) {
  const el = document.getElementById('validationMessage');
  if (!el) return;

  if (!messages.length) {
    el.textContent = '';
    el.classList.add('hidden');
    return;
  }

  el.textContent = messages.join(' ');
  el.classList.remove('hidden');
}

function validateRequiredInputs() {
  const messages = [];
  ['role', 'roleFree', 'systemType', 'sector', 'purpose'].forEach((id) => clearFieldInvalidState(id));

  const consentBox = document.getElementById('consentBox');
  if (consentBox) consentBox.classList.remove('invalid');

  const role = document.getElementById('role').value;
  const roleFree = document.getElementById('roleFree').value.trim();
  if (!role && !roleFree) {
    markFieldInvalid('role');
    markFieldInvalid('roleFree');
    messages.push('Bitte Rolle auswaehlen oder als Freitext eintragen.');
  }

  const systemType = document.getElementById('systemType').value;
  if (!systemType) {
    markFieldInvalid('systemType');
    messages.push('Bitte Systemtyp auswaehlen.');
  }

  const sector = document.getElementById('sector').value;
  if (!sector) {
    markFieldInvalid('sector');
    messages.push('Bitte Sektor/Kontext auswaehlen.');
  }

  const purpose = document.getElementById('purpose').value.trim();
  if (!purpose || purpose.length < 12) {
    markFieldInvalid('purpose');
    messages.push('Bitte Anwendungsfall aussagekraeftig beschreiben (mind. 12 Zeichen).');
  }

  const legalAck = document.getElementById('legalAck');
  if (!legalAck || !legalAck.checked) {
    if (consentBox) consentBox.classList.add('invalid');
    messages.push('Bitte den rechtlichen Hinweis bestaetigen.');
  }

  setValidationMessage(messages);
  return { ok: messages.length === 0, messages };
}

function buildResultExportText() {
  const badge = document.getElementById('resultBadge')?.textContent?.trim() || '-';
  const reason = document.getElementById('resultReason')?.textContent?.trim() || '-';
  const meta = document.getElementById('resultMeta')?.textContent?.trim() || '-';
  const actions = Array.from(document.querySelectorAll('#resultActions li')).map((li) => `- ${li.textContent.trim()}`);
  const recommendations = Array.from(document.querySelectorAll('#autoRecommendations li')).map((li) => `- ${li.textContent.trim()}`);

  return [
    'EU AI Act Navigator - Ergebnis',
    '',
    `Status: ${badge}`,
    `Begruendung: ${reason}`,
    `Kontext: ${meta}`,
    '',
    'Priorisierte naechste Schritte:',
    ...(actions.length ? actions : ['- Keine']),
    '',
    'Automatische Empfehlungen:',
    ...(recommendations.length ? recommendations : ['- Keine']),
    '',
    'Hinweis: Unverbindliche Orientierung, keine Rechtsberatung.',
  ].join('\n');
}

function handlePrintResult() {
  if (!state.lastEvaluation) {
    setValidationMessage(['Bitte zuerst eine gueltige Einstufung berechnen.']);
    return;
  }

  const printWin = window.open('', '_blank', 'noopener,noreferrer,width=1000,height=780');
  if (!printWin) {
    window.print();
    return;
  }

  const content = buildResultExportText().replace(/\n/g, '<br/>');
  const ts = new Date().toLocaleString('de-DE');
  printWin.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>EU AI Act Ergebnis</title><style>body{font-family:Segoe UI,Calibri,sans-serif;padding:28px;color:#122033}h1{margin:0 0 10px}p{margin:0 0 8px}hr{margin:14px 0;border:none;border-top:1px solid #d6dfeb}</style></head><body><h1>EU AI Act Navigator - Ergebnis</h1><p>Exportzeit: ${ts}</p><hr><div>${content}</div></body></html>`);
  printWin.document.close();
  printWin.focus();
  setTimeout(() => {
    printWin.print();
    printWin.close();
  }, 200);
}

function handleEmailResult() {
  if (!state.lastEvaluation) {
    setValidationMessage(['Bitte zuerst eine gueltige Einstufung berechnen.']);
    return;
  }

  const subject = encodeURIComponent('EU AI Act Navigator - Ergebnis');
  const body = encodeURIComponent(buildResultExportText());
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function wireUi() {
  document.getElementById('toggleSystemHelp').addEventListener('click', () => {
    document.getElementById('systemHelp').classList.toggle('hidden');
  });

  document.getElementById('toggleA4Help').addEventListener('click', () => {
    document.getElementById('a4Explain').classList.toggle('hidden');
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('input[data-a4="1"]')) updateA4Score();
    if (e.target.matches('#role, #roleFree, #systemType, #sector, #purpose, #legalAck')) validateRequiredInputs();
  });

  document.getElementById('purpose').addEventListener('input', () => {
    validateRequiredInputs();
  });
  const printBtn = document.getElementById('printResult');
  if (printBtn) printBtn.addEventListener('click', handlePrintResult);

  const emailBtn = document.getElementById('emailResult');
  if (emailBtn) emailBtn.addEventListener('click', handleEmailResult);

  document.getElementById('runCheck').addEventListener('click', () => {
    const validation = validateRequiredInputs();
    if (!validation.ok) {
      const badge = document.getElementById('resultBadge');
      if (badge) {
        badge.className = 'badge warning';
        badge.textContent = 'Eingaben unvollstaendig';
      }
      setText('resultReason', 'Bitte Pflichtfelder und Disclaimer bestaetigen.');
      setText('resultMeta', 'Validierung fehlgeschlagen.');
      return;
    }

    setValidationMessage([]);
    const input = collectInputs();
    const riskResult = evaluateRisk(input);
    showResult(riskResult.key, riskResult.reason, riskResult.meta);

    const profile = computeRadarProfile(input);
    drawRadarChart(profile);

    const recommendations = buildRecommendations(profile, riskResult, input);
    renderAutoRecommendations(recommendations);

    state.lastEvaluation = { input, riskResult, profile, recommendations, createdAt: new Date().toISOString() };
  });
}

async function boot() {
  state.framework = await loadFramework();
  renderTop(state.framework);
  fillSelect('role', state.framework.roles);
  fillSelect('systemType', state.framework.systemTypes);
  renderKritis(state.framework);
  renderSystemSections(state.framework);
  renderArticle4(state.framework);
  renderReferences(state.framework);
  wireUi();
  renderBaselineInsights();
}

boot().catch((err) => {
  console.error(err);
  const badge = document.getElementById('resultBadge');
  if (badge) {
    badge.className = 'badge danger';
    badge.textContent = 'Initialisierung fehlgeschlagen';
  }
  setText('resultReason', 'Bitte Seite neu laden oder ueber einen lokalen Server starten (z. B. Live Server).');
});









