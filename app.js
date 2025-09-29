let movs = JSON.parse(localStorage.getItem('movs')) || [];
const form = document.getElementById('form');
const lista = document.getElementById('lista');
const totalSpan = document.getElementById('total');
const btnCSV = document.getElementById('btnCSV');
const grafico = document.getElementById('grafico');
const ctx = grafico.getContext('2d');

form.addEventListener('submit', e => {
  e.preventDefault();
  const desc = document.getElementById('desc').value.trim();
  const monto = parseFloat(document.getElementById('monto').value);
  const cat = document.getElementById('cat').value;
  movs.push({desc, monto, cat, fecha: new Date().toISOString()});
  localStorage.setItem('movs', JSON.stringify(movs));
  form.reset();
  render();
});

btnCSV.addEventListener('click', () => {
  if (!movs.length) return alert('No hay datos');
  const csv = ['Descripción,Categoría,Monto,Fecha']
    .concat(movs.map(m => `${m.desc},${m.cat},${m.monto},${m.fecha.slice(0,10)}`))
    .join('\n');
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gastos.csv'; a.click();
  URL.revokeObjectURL(url);
});

function render() {
  lista.innerHTML = '';
  let total = 0; const porCat = {};
  movs.forEach(m => {
    total += m.monto;
    porCat[m.cat] = (porCat[m.cat] || 0) + m.monto;
    const li = document.createElement('li');
    li.innerHTML = `<span>${m.desc} (${m.cat})</span><span>S/${m.monto.toFixed(2)}</span>`;
    lista.appendChild(li);
  });
  totalSpan.textContent = total.toFixed(2);
  dibujarGrafico(porCat);
  // Alerta Comida > 50
  const comida = porCat['Comida'] || 0;
  if (comida > 50) {
    if (!document.getElementById('alerta')) {
      const div = document.createElement('div');
      div.id = 'alerta'; div.className = 'alerta';
      div.textContent = '⚠️ ¡Alerta! Superaste S/50 en Comida';
      form.after(div);
    }
  } else {
    const a = document.getElementById('alerta'); if (a) a.remove();
  }
}

function dibujarGrafico(datos) {
  const colores = ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF'];
  const total = Object.values(datos).reduce((a,b)=>a+b,0) || 1;
  let anguloActual = 0;
  const centro = 150, radio = 100;
  ctx.clearRect(0,0,300,300);
  Object.entries(datos).forEach(([cat,val],i)=>{
    const angulo = (val/total)*2*Math.PI;
    ctx.beginPath(); ctx.moveTo(centro,centro);
    ctx.arc(centro,centro,radio,anguloActual,anguloActual+angulo);
    ctx.closePath(); ctx.fillStyle = colores[i % colores.length]; ctx.fill();
    anguloActual+=angulo;
  });
}

render();

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js');
}
