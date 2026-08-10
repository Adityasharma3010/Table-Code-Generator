/* ===================== THEME ===================== */
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('tg-theme') || 'dark';
root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('tg-theme', next);
});

/* ===================== CUSTOM CURSOR ===================== */
const dot = document.createElement('div');
dot.id = 'cursor-dot';
const ring = document.createElement('div');
ring.id = 'cursor-ring';
document.body.appendChild(dot);
document.body.appendChild(ring);

let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let ringX = mouseX, ringY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top = mouseY + 'px';
  spawnParticle(mouseX, mouseY);
});

document.querySelectorAll('button, textarea, a, input').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

function animateRing(){
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

/* ===================== PARTICLE TRAIL ===================== */
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnParticle(x, y){
  if(particles.length > 60) return;
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    life: 1,
    size: Math.random() * 2.5 + 1.5,
    hue: Math.random() > 0.5 ? '124,155,255' : '0,224,198'
  });
}

function tickParticles(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue}, ${p.life * 0.5})`;
    ctx.fill();
  });
  particles = particles.filter(p => p.life > 0);
  requestAnimationFrame(tickParticles);
}
tickParticles();

/* ===================== TABLE GENERATION ===================== */
let lastRows = null;      // last parsed [header, ...body] rows
let lastExample = '';     // last example HTML used
let transposed = false;   // rotate state

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/**
 * Parse pasted data into a 2D array of rows.
 * Handles:
 *  - Tab-separated rows (normal paste from Word/Excel/Sheets/Docs tables)
 *  - Comma-separated as a fallback if no tabs but consistent commas per line
 *  - "One value per line" blocks (like a table copied as plain text with each
 *    cell on its own line) — inferred by finding a header-row length that
 *    evenly divides the remaining lines.
 */
function parseData(raw){
  const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
  if(lines.length === 0) return [];

  if(lines.some(l => l.includes('\t'))){
    return lines.map(l => l.split('\t').map(c => c.trim()));
  }

  // fallback: consistent comma count across all lines (simple CSV-ish paste)
  const commaCounts = lines.map(l => l.split(',').length);
  if(commaCounts.every(c => c === commaCounts[0]) && commaCounts[0] > 1){
    return lines.map(l => l.split(',').map(c => c.trim()));
  }

  // fallback: one value per line, infer header length
  for(let h = 2; h <= 12; h++){
    if((lines.length - h) > 0 && (lines.length - h) % h === 0){
      const rows = [lines.slice(0, h)];
      for(let i = h; i < lines.length; i += h){
        rows.push(lines.slice(i, i + h));
      }
      return rows;
    }
  }
  return [lines];
}

function transposeRows(rows){
  if(rows.length === 0) return rows;
  const numCols = Math.max(...rows.map(r => r.length));
  const result = [];
  for(let c = 0; c < numCols; c++){
    const newRow = [];
    for(let r = 0; r < rows.length; r++){
      newRow.push(rows[r][c] !== undefined ? rows[r][c] : '');
    }
    result.push(newRow);
  }
  return result;
}

function buildHtml(rows, exampleRaw){
  const header = rows[0];
  const body = rows.slice(1);

  if(exampleRaw){
    const tableStart = exampleRaw.search(/<table[^>]*>/i);
    const tableEndMatch = exampleRaw.match(/<\/table>/i);
    const tableEnd = tableEndMatch ? tableEndMatch.index + tableEndMatch[0].length : exampleRaw.length;

    const prefix = tableStart >= 0 ? exampleRaw.slice(0, tableStart) : '';
    const suffix = tableStart >= 0 ? exampleRaw.slice(tableEnd) : '';
    const tableBlock = tableStart >= 0 ? exampleRaw.slice(tableStart, tableEnd) : exampleRaw;

    const tableOpenMatch = tableBlock.match(/<table[^>]*>/i);
    const tableOpenTag = tableOpenMatch ? tableOpenMatch[0] : '<table>';
    const usesTh = /<th[\s>]/i.test(tableBlock);

    const trMatches = [...tableBlock.matchAll(/<tr[^>]*>/gi)];
    const headerTrTag = trMatches[0] ? trMatches[0][0] : '<tr>';
    const bodyTrTag = trMatches[1] ? trMatches[1][0] : headerTrTag;

    const thMatch = tableBlock.match(/<th[^>]*>/i);
    const thTag = thMatch ? thMatch[0] : '<th>';
    const tdMatch = tableBlock.match(/<td[^>]*>/i);
    const tdTag = tdMatch ? tdMatch[0] : '<td>';

    const hasThead = /<thead[^>]*>/i.test(tableBlock);
    const hasTbody = /<tbody[^>]*>/i.test(tableBlock);
    const theadOpen = hasThead ? tableBlock.match(/<thead[^>]*>/i)[0] : '';
    const tbodyOpen = hasTbody ? tableBlock.match(/<tbody[^>]*>/i)[0] : '';

    let out = prefix + tableOpenTag + '\n';
    if(hasThead) out += theadOpen + '\n';
    out += headerTrTag + '\n';
    header.forEach(h => {
      const cellTag = usesTh ? thTag : tdTag;
      const closeTag = usesTh ? '</th>' : '</td>';
      out += '    ' + cellTag + escapeHtml(h) + closeTag + '\n';
    });
    out += '</tr>\n';
    if(hasThead) out += '</thead>\n';

    if(hasTbody) out += tbodyOpen + '\n';
    body.forEach(r => {
      out += bodyTrTag + '\n';
      r.forEach(cell => {
        out += '    ' + tdTag + escapeHtml(cell || '') + '</td>\n';
      });
      out += '</tr>\n';
    });
    if(hasTbody) out += '</tbody>\n';

    out += '</table>' + suffix;
    return out;
  } else {
    let out = '<table>\n<tr>\n';
    header.forEach(h => out += '  <th>' + escapeHtml(h) + '</th>\n');
    out += '</tr>\n';
    body.forEach(r => {
      out += '<tr>\n';
      r.forEach(cell => out += '  <td>' + escapeHtml(cell || '') + '</td>\n');
      out += '</tr>\n';
    });
    out += '</table>';
    return out;
  }
}

function render(){
  if(!lastRows || lastRows.length === 0){
    document.getElementById('output').value = '';
    document.getElementById('preview').innerHTML = '';
    return;
  }
  const rows = transposed ? transposeRows(lastRows) : lastRows;
  const html = buildHtml(rows, lastExample);
  document.getElementById('output').value = html;
  document.getElementById('preview').innerHTML = html;
}

document.getElementById('generate-btn').addEventListener('click', () => {
  lastExample = document.getElementById('example').value.trim();
  lastRows = parseData(document.getElementById('data').value);
  transposed = false;
  render();
});

document.getElementById('rotate-btn').addEventListener('click', () => {
  if(!lastRows){
    lastExample = document.getElementById('example').value.trim();
    lastRows = parseData(document.getElementById('data').value);
  }
  transposed = !transposed;
  render();
});

document.getElementById('copy-btn').addEventListener('click', () => {
  const el = document.getElementById('output');
  el.select();
  document.execCommand('copy');
  const btn = document.getElementById('copy-btn');
  btn.textContent = 'Copied!';
  btn.classList.add('copied');
  setTimeout(() => {
    btn.textContent = 'Copy code';
    btn.classList.remove('copied');
  }, 1500);
});
