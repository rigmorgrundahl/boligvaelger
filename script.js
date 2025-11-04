
import units from './data/units.json' assert { type: 'json' };

const imgWidth = 1398, imgHeight = 908;

const map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 3,
  zoomSnap: 0.25,
});

const bounds = [[0,0],[imgHeight,imgWidth]]; // y,x order in CRS.Simple
L.imageOverlay('./assets/plan.png', bounds).addTo(map);
map.fitBounds(bounds);

function styleByStatus(status){
  const s = (status||'').toUpperCase();
  return { className: 'poly-' + s };
}

function polygonFromUnit(u){
  const poly = L.polygon(u.coords, styleByStatus(u.status)).addTo(map);
  poly.on('mouseover', ()=> poly.getElement()?.classList.add('poly-HOVER'));
  poly.on('mouseout', ()=> poly.getElement()?.classList.remove('poly-HOVER'));
  poly.on('click', ()=> openModal(u));
  poly.bindTooltip(`${u.label} · ${u.status}`, {sticky:true});
  return poly;
}

function openModal(u){
  const m = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <h2>Bolig ${u.label}</h2>
    <div class="meta">${u.rooms} værelser · ${u.size} m² · ${u.status}</div>
    <p>${u.desc||''}</p>
    <div class="cta">
      <a class="secondary" href="${u.more_url||'#'}" target="_blank" rel="noopener">Se flere detaljer</a>
      <a href="${u.cta_url||'#'}" target="_blank" rel="noopener">Skriv dig op</a>
    </div>
  `;
  m.setAttribute('aria-hidden','false');
}
document.getElementById('closeModal').addEventListener('click', ()=> document.getElementById('modal').setAttribute('aria-hidden','true'));
document.getElementById('modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') document.getElementById('modal').setAttribute('aria-hidden','true'); });

units.forEach(polygonFromUnit);
console.log(`Loaded ${units.length} units.`);
