const canvas = document.getElementById('ruleta');
const ctx    = canvas.getContext('2d');
const boton  = document.getElementById('girarBtn');
const resultado = document.getElementById('resultado');

const sectores = [
  { numero: 0,   color: 'green' }, { numero: 28,  color: 'black' },
  { numero: 9,   color: 'red'   }, { numero: 26,  color: 'black' },
  { numero: 30,  color: 'red'   }, { numero: 11,  color: 'black' },
  { numero: 7,   color: 'red'   }, { numero: 20,  color: 'black' },
  { numero: 32,  color: 'red'   }, { numero: 17,  color: 'black' },
  { numero: 5,   color: 'red'   }, { numero: 22,  color: 'black' },
  { numero: 34,  color: 'red'   }, { numero: 15,  color: 'black' },
  { numero: 3,   color: 'red'   }, { numero: 24,  color: 'black' },
  { numero: 36,  color: 'red'   }, { numero: 13,  color: 'black' },
  { numero: 1,   color: 'red'   }, { numero: '00',color: 'green' },
  { numero: 27,  color: 'red'   }, { numero: 10,  color: 'black' },
  { numero: 25,  color: 'red'   }, { numero: 29,  color: 'black' },
  { numero: 12,  color: 'red'   }, { numero: 8,   color: 'black' },
  { numero: 19,  color: 'red'   }, { numero: 31,  color: 'black' },
  { numero: 18,  color: 'red'   }, { numero: 6,   color: 'black' },
  { numero: 21,  color: 'red'   }, { numero: 33,  color: 'black' },
  { numero: 16,  color: 'red'   }, { numero: 4,   color: 'black' },
  { numero: 23,  color: 'red'   }, { numero: 35,  color: 'black' },
  { numero: 14,  color: 'red'   }, { numero: 2,   color: 'black' }
];

const radius = canvas.width / 2;
const total  = sectores.length;
const anglePerSector = (2 * Math.PI) / total;

let ruletaAngle         = 0;
let bolaAngle           = 0;
let spinning            = false;
let startTime           = null;
let duration            = 8000;            // Duración total (ms)
let ruletaTotalRotation = 0;
let bolaTotalRotation   = 0;
let cayendo             = false;
let bolaRadio           = radius - 70;
let bolaFinalRadio      = radius - 90;
let bolaCaidaStartTime  = null;
let bolaCaidaDuration   = 800;
let bolaMostrada        = false;

// Normaliza un ángulo a [0, 2π)
function normalize(angle) {
  angle %= 2 * Math.PI;
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

// Función de aceleración: t^2
function easeInQuad(t) {
  return t * t;
}

// Función de desaceleración: 1 - (1 - t)^3
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Progreso "montaña rusa": acelera rápido el primer 20%, luego desacelera el 80% restante
function rollerProgress(elapsed) {
  const p = elapsed / duration;
  const accelRatio = 0.2;

  if (p < accelRatio) {
    // fase de aceleración rápida
    return easeInQuad(p / accelRatio) * accelRatio;
  } else {
    // fase de desaceleración lenta
    const q = (p - accelRatio) / (1 - accelRatio);
    return accelRatio + easeOutCubic(q) * (1 - accelRatio);
  }
}

function drawRuleta(angle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- Dibujo de la ruleta ---
  const border = 15;
  ctx.beginPath();
  ctx.arc(radius, radius, radius, 0, 2*Math.PI);
  ctx.arc(radius, radius, radius - border, 0, 2*Math.PI, true);
  ctx.fillStyle = '#6b4226';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(radius, radius, radius - border, 0, 2*Math.PI);
  ctx.arc(radius, radius, radius - border - 10, 0, 2*Math.PI, true);
  ctx.fillStyle = '#000';
  ctx.fill();

  for (let i = 0; i < total; i++) {
    const start = angle + i * anglePerSector;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - border - 10, start, start + anglePerSector);
    ctx.fillStyle = sectores[i].color;
    ctx.fill();

    const mid = start + anglePerSector/2;
    ctx.save();
    ctx.translate(
      radius + Math.cos(mid)*radius*0.72,
      radius + Math.sin(mid)*radius*0.72
    );
    ctx.rotate(mid + Math.PI/2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(sectores[i].numero.toString(),
                 -ctx.measureText(sectores[i].numero.toString()).width/2, 0);
    ctx.restore();
  }

  ctx.beginPath();
  ctx.arc(radius, radius, radius - 100, 0, 2*Math.PI);
  ctx.arc(radius, radius, radius - 80, 0, 2*Math.PI, true);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.arc(0,0,65,0,2*Math.PI);
  ctx.fillStyle = '#c49e65';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  ctx.stroke();
  for (let i=0; i<4; i++){
    const rad = i*(Math.PI/2);
    const x = Math.cos(rad)*45, y = Math.sin(rad)*45;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(x,y);
    ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.beginPath(); ctx.arc(x,y,6,0,2*Math.PI);
    ctx.fillStyle = '#8b5a2b'; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(0,0,8,0,2*Math.PI);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();

  // --- Dibujo de la bola SIEMPRE ---
  ctx.save();
  ctx.translate(radius, radius);
  ctx.rotate(-bolaAngle);
  ctx.beginPath();
  ctx.arc(bolaRadio, 0, 8, 0, 2 * Math.PI);
  ctx.fillStyle   = '#fff';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur  = 6;
  ctx.fill();
  ctx.restore();
}

function animate(timestamp) {
  if (spinning) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    if (elapsed < duration) {
      const p = rollerProgress(elapsed);
      ruletaAngle = p * ruletaTotalRotation;
      bolaAngle   = p * bolaTotalRotation;
    } else {
      spinning           = false;
      startTime          = null;
      cayendo            = true;
      bolaCaidaStartTime = timestamp;
    }
  }

  if (cayendo) {
    const e = timestamp - bolaCaidaStartTime;
    if (e < bolaCaidaDuration) {
      const t = e / bolaCaidaDuration;
      bolaRadio = (radius - 70) - ((radius - 70 - bolaFinalRadio) * easeOutCubic(t));
    } else {
      cayendo     = false;
      bolaRadio   = bolaFinalRadio;
      bolaMostrada = true;

      // Determinar ganador
      const ballA = normalize(-bolaAngle);
      let best = 0, minD = Infinity;
      for (let i = 0; i < total; i++) {
        let center = normalize(ruletaAngle + (i+0.5)*anglePerSector);
        let d = Math.abs(center - ballA);
        if (d > Math.PI) d = 2*Math.PI - d;
        if (d < minD) { minD = d; best = i; }
      }
      const g = sectores[best];
      mostrarResultadoAnimado(g);
      desbloquearClicks()
      // === Calcular ganancias ===
      const apuestas = guardarYEliminarApuestas();
      const numeroGanador = Number(g.numero);
      const colorGanador = g.color;

      const ganancia = evaluarGanancias(apuestas, numeroGanador, colorGanador);
      console.log(`Ganaste: ${ganancia} puntos`);
      mostrarResultadoAnimadoAbajo(g);

        }
      }

  drawRuleta(ruletaAngle);
  requestAnimationFrame(animate);
}

boton.addEventListener('click', () => {
  if (spinning || cayendo) return;

  resultado.innerHTML = '';
  resultado.style.display = 'none';
  bolaMostrada = false;
  spinning     = true;
  startTime    = null;

  const vueltas = Math.random() * 4 + 6; // 6–10 vueltas
  ruletaTotalRotation = vueltas * 2 * Math.PI;
  bolaTotalRotation   = ruletaTotalRotation + Math.random() * 2 * Math.PI;
  bolaRadio           = radius - 70;
  bolaAngle           = 0;
  desactivarBotones()
  bloquearClicks()
  desactivarMonedas()

});


animate();

function desactivarMonedas() {
  // Función para eliminar el clon actual
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  if (dragClone) {
    document.removeEventListener('mousemove', moveHandler); // Desactiva el movimiento
    dragClone.remove(); // Elimina el clon
    dragClone = null; // Limpiamos la variable
    moveHandler = null; // Limpiamos el manejador de movimiento
  }
  if (originChip) {
    originChip.classList.remove('selected'); // Desmarca la ficha original
    originChip = null;
  }
}

function activarBotones() {
  const botones = document.getElementsByClassName('boton-ruleta');
  
  // Activar todos los botones
  for (let i = 0; i < botones.length; i++) {
    botones[i].disabled = false;
  }
  
  // Deshabilitar el botón de repetir apuesta si la ruleta está girando o cayendo
  if (spinning || cayendo) {
    botones.disabled = true;
  } else {
    botones.disabled = false;  // Habilitarlo si no está girando ni cayendo
  }
}
function desactivarBotones() {
  const botones = document.getElementsByClassName('boton-ruleta');
  
  // Activar todos los botones
  for (let i = 0; i < botones.length; i++) {
    botones[i].disabled = true;
  }
}

function guardarYEliminarApuestas() {
  const resultados = [];

  const fichas = document.querySelectorAll('.tables .chip-clone');

  fichas.forEach(ficha => {
    const valor = Number(ficha.getAttribute('data-valor'));
    const padre = ficha.parentElement;

    // Primero intentamos data-range, si no existe usamos data-number
    let seccionTexto = padre?.getAttribute('data-range') || padre?.getAttribute('data-number');

    if (!seccionTexto || isNaN(valor)) return;

    let color = null;
    const numero = Number(seccionTexto);

    if (!isNaN(numero) && numero >= 1 && numero <= 36) {
      if (padre.classList.contains('red')) color = 'red';
      else if (padre.classList.contains('black')) color = 'black';
    }


    if (seccionTexto && valor) {
      let color = null;

      const numero = Number(seccionTexto);
      if (!isNaN(numero) && numero >= 1 && numero <= 36) {
        if (padre.classList.contains('red')) color = 'red';
        else if (padre.classList.contains('black')) color = 'black';
      }

      resultados.push({
        seccion: seccionTexto,
        valor: valor,
        color: color
      });
    }

    ficha.remove();
  });

  console.log(resultados);
  return resultados;
}


function bloquearClicks() {
  document.addEventListener('click', prevenirClick, true);
}

function prevenirClick(event) {
  event.stopPropagation();
  event.preventDefault();
}

function desbloquearClicks() {
  document.removeEventListener('click', prevenirClick, true);
}

function mostrarResultadoAnimado(g) {
  const mensajeBase = `🎯 ¡La bola cayó en <strong>${g.numero}</strong> (${g.color})!`;
  const contenedor = document.getElementById('resultado');

  // Estilos base para centrar
  contenedor.style.position = "absolute";
  contenedor.style.top = "-8vh";
  contenedor.style.left = "50%";
  contenedor.style.transform = "translate(-50%, -50%)";
  contenedor.style.zIndex = "9999";
  contenedor.style.textAlign = "center";
  contenedor.style.height = '4vh';
  contenedor.style.width = "100%";
  contenedor.style.borderRadius = '12px';
  contenedor.style.fontSize = '22px';
  contenedor.style.fontWeight = 'bold';
  contenedor.style.transition = 'all 0.4s ease';

  // Estilo especial para color rojo
  if (g.color === 'red') {
    contenedor.style.background = 'linear-gradient(135deg, #ff4e50, #f00000)';
    contenedor.style.color = '#fff';
    contenedor.style.textShadow = '1px 1px 4px #900';
    contenedor.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.6)';
    contenedor.style.fontFamily = 'Georgia, serif';
  } else {
    // Otros colores: normal
    contenedor.style.background = g.color;
    contenedor.style.color = g.color === 'black' ? 'white' : 'black';
    contenedor.style.textShadow = 'none';
    contenedor.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    contenedor.style.fontFamily = 'sans-serif';
  }

  // Animación tipo máquina de escribir
  contenedor.innerHTML = '';
  let i = 0;
  function escribir() {
    if (i <= mensajeBase.length) {
      contenedor.innerHTML = mensajeBase.slice(0, i);
      i++;
      setTimeout(escribir, 25);
    }
  }

  escribir();
}
function evaluarGanancias(apuestas, numeroGanador, colorGanador) {
  console.log("🔍 Evaluando apuestas...");
  console.log("👉 Número ganador:", numeroGanador, " Color ganador:", colorGanador);
  console.log("Tipo de número ganador:", typeof numeroGanador);

  let totalGanado = 0;
  let totalPerdido = 0;
  const apuestasGanadas = [];
  const apuestasPerdidas = [];

  apuestas.forEach((apuesta, index) => {
    console.log(`🎲 Evaluando apuesta #${index + 1}:`, apuesta);

    // 🧹 Limpieza de datos
    const seccion = String(apuesta.seccion).trim();  // Convertir a string, quitar espacios y normalizar mayúsculas
    const valor = Number(apuesta.valor);  // Convertir a número

    let gano = false;
    console.log("📌 Sección:", seccion, "| Valor:", valor);

    switch (true) {
      case !isNaN(seccion):
        console.log("🔢 Tipo: Número directo"); 
        if (seccion == numeroGanador.toString()) {
          totalGanado += valor * 36;
          console.log(`✅ Apuesta NUMERO ${seccion}: ganaste ${valor * 36}`);
          gano = true;
        }
        break;

      // Apuesta en "0" o "00"
      case (seccion === "0"):
        console.log("🟦 Tipo: 0");
        if (numeroGanador === 0) {  // Aseguramos que solo gane si el número es "0"
          totalGanado += valor * 36;
          console.log(`✅ Apuesta ${seccion}: ganaste ${valor * 36}`);
          gano = true;
        }
        break;
      
      // Apuesta en "0" o "00"
      case (seccion === "00"):
        console.log("🟦 Tipo: 00");
        if (numeroGanador === 0) {  // Aseguramos que solo gane si el número es "0"
          totalGanado += valor * 36;
          console.log(`✅ Apuesta ${seccion}: ganaste ${valor * 36}`);
          gano = true;
        }
        break;

      // Otras apuestas
      case (seccion === "EVEN" && numeroGanador !== 0 && numeroGanador % 2 === 0):
        console.log("🟦 Tipo: EVEN");
        totalGanado += valor * 2;
        console.log(`✅ Apuesta EVEN: ganaste ${valor * 2}`);
        gano = true;
        break;

      case (seccion === "ODD" && numeroGanador % 2 === 1):
        console.log("🟥 Tipo: ODD");
        totalGanado += valor * 2;
        console.log(`✅ Apuesta ODD: ganaste ${valor * 2}`);
        gano = true;
        break;

      case (seccion === "1-18" && seccion === "1-18" && numeroGanador >= 1 && numeroGanador <= 18 ):
        console.log("📉 Tipo: 1-18");
        totalGanado += valor * 2;
        console.log(`✅ Apuesta 1-18: ganaste ${valor * 2}`);
        gano = true;
        break;

      case (seccion === "19-36" && [19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36].includes(numeroGanador)):
        console.log("📈 Tipo: 19-36");
        totalGanado += valor * 2;
        console.log(`✅ Apuesta 19-36: ganaste ${valor * 2}`);
        gano = true;
        break;

      case (seccion === "1-12" && [1,2,3,4,5,6,6,7,8,9,10,11,12].includes(numeroGanador)):
        console.log("🟨 Tipo: 1-12");
        totalGanado += valor * 3;
        console.log(`✅ Apuesta 1-12: ganaste ${valor * 3}`);
        gano = true;
        break;

      case (seccion === "13-24" && [13,14,15,16,17,18,19,20,21,22,23,24].includes(numeroGanador)):
        console.log("🟧 Tipo: 13-24");
        totalGanado += valor * 3;
        console.log(`✅ Apuesta 13-24: ganaste ${valor * 3}`);
        gano = true;
        break;

      case (seccion === "25-36" && [25,26,27,28,29,30,31,32,33,34,35,36].includes(numeroGanador)):
        console.log("🟥 Tipo: 25-36");
        totalGanado += valor * 3;
        console.log(`✅ Apuesta 25-36: ganaste ${valor * 3}`);
        gano = true;
        break;

      case ((seccion === "red" || seccion === "black") && seccion.toLowerCase() === colorGanador.toLowerCase()):
        console.log("🎨 Tipo: Color");
        totalGanado += valor * 2;
        console.log(`✅ Apuesta COLOR ${seccion}: ganaste ${valor * 2}`);
        gano = true;
        break;

      case (seccion === "1st" && [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].includes(numeroGanador)):
        console.log("🟦 Tipo: Columna 1st");
        totalGanado += valor * 3;
        console.log(`✅ Apuesta 1st: ganaste ${valor * 3}`);
        gano = true;
        break;

      case (seccion === "2nd" && [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].includes(numeroGanador)):
        console.log("🟩 Tipo: Columna 2nd");
        totalGanado += valor * 3;
        console.log(`✅ Apuesta 2nd: ganaste ${valor * 3}`);
        gano = true;
        break;

      case (seccion === "3rd" && [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].includes(numeroGanador)):
        console.log("🟥 Tipo: Columna 3rd");
        totalGanado += valor * 3;
        console.log(`✅ Apuesta 3rd: ganaste ${valor * 3}`);
        gano = true;
        break;
    }

    if (gano) {
      apuestasGanadas.push(apuesta);
    } else {
      totalPerdido += valor;
      apuestasPerdidas.push(apuesta);
    }
  });

  if (apuestasGanadas.length > 0) {
    console.log("🎉 Apuestas ganadas:");
    console.table(apuestasGanadas);
  }

  if (apuestasPerdidas.length > 0) {
    console.log("❌ Apuestas perdidas:");
    console.table(apuestasPerdidas);
  }

  const total = totalGanado - totalPerdido;
  console.log("💰 Total neto:", total);
  console.log(`🏁 Total ganado: ${totalGanado}`);
  console.log(`💸 Total perdido: ${totalPerdido}`);

  const saldoNumerico = obtenerSaldoNumerico();
  const saldoRestado = saldoNumerico + totalGanado;
  console.log(`💰 Nuevo saldo (estimado): ${saldoRestado}`);

  document.getElementsByClassName('saldo')[0].textContent = saldoRestado + " FUN";
  document.getElementsByClassName('apuesta')[0].textContent = "0 FUN";
  mostrarResultadosGananciaPerdida(totalGanado, totalPerdido);
  document.getElementsByClassName('boton-ruleta')[0].disabled = false;

  return totalGanado;
}




function obtenerSaldoNumerico() {
  const saldoElemento = document.getElementsByClassName('saldo')[0];
  if (!saldoElemento) return 0;
  const texto = saldoElemento.textContent || saldoElemento.innerText;
  const numero = texto.replace(/[^\d.]/g, '');
  return parseFloat(numero);
}

function mostrarResultadosGananciaPerdida(ganado, perdido) {
  // Si no hay nada que mostrar, salimos
  if (ganado === 0 && perdido === 0) return;

  const mensaje = document.createElement('div');

  // Construimos el HTML según corresponda
  let contenido = '';
  if (ganado > 0) {
    contenido += `<div style="color: green; font-weight: bold;">+${ganado} puntos ganados 💰</div>`;
  }
  if (perdido > 0) {
    contenido += `<div style="color: red; font-weight: bold;">-${perdido} puntos perdidos ❌</div>`;
  }

  mensaje.innerHTML = contenido;

  // Estilos comunes
  mensaje.style.position = 'absolute';
  mensaje.style.top = '5vh';
  mensaje.style.left = '50%';
  mensaje.style.transform = 'translateX(-50%)';
  mensaje.style.background = '#fff';
  mensaje.style.border = '2px solid #ccc';
  mensaje.style.padding = '12px 24px';
  mensaje.style.borderRadius = '16px';
  mensaje.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
  mensaje.style.fontSize = '20px';
  mensaje.style.textAlign = 'center';
  mensaje.style.zIndex = '9999';
  mensaje.style.opacity = '0';
  mensaje.style.transition = 'opacity 0.5s ease';

  document.body.appendChild(mensaje);

  // Fade in
  requestAnimationFrame(() => {
    mensaje.style.opacity = '1';
  });

  // Desaparecer después de 4 segundos
  setTimeout(() => {
    mensaje.style.opacity = '0';
    setTimeout(() => mensaje.remove(), 500);
  }, 4000);
}

function mostrarResultadoAnimadoAbajo(g) {
  const mensajeBase = `🎯 ¡La bola cayó en <strong>${g.numero}</strong> (${g.color})!`;
  const contenedor = document.getElementById('resultado-abajo');

  // Estilos base para centrar
  contenedor.style.position = "absolute";
  contenedor.style.top = "-6vh";
  contenedor.style.left = "50%";
  contenedor.style.transform = "translate(-50%, -50%)";
  contenedor.style.zIndex = "9999";
  contenedor.style.textAlign = "center";
  contenedor.style.height = '4vh';
  contenedor.style.width = "100%";
  contenedor.style.fontSize = '22px';
  contenedor.style.fontWeight = 'bold';
  contenedor.style.transition = 'all 0.4s ease';

  // Estilo especial para color rojo
  if (g.color === 'red') {
    contenedor.style.background = 'linear-gradient(135deg, #ff4e50, #f00000)';
    contenedor.style.color = '#fff';
    contenedor.style.textShadow = '1px 1px 4px #900';
    contenedor.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.6)';
    contenedor.style.fontFamily = 'Georgia, serif';
  } else {
    // Otros colores: normal
    contenedor.style.background = g.color;
    contenedor.style.color = g.color === 'black' ? 'white' : 'black';
    contenedor.style.textShadow = 'none';
    contenedor.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
    contenedor.style.fontFamily = 'sans-serif';
  }

  // Animación tipo máquina de escribir
  contenedor.innerHTML = '';
  let i = 0;
  function escribir() {
    if (i <= mensajeBase.length) {
      contenedor.innerHTML = mensajeBase.slice(0, i);
      i++;
      setTimeout(escribir, 25);
    }
  }
  escribir();
}

function borrarResultadoAbajo() {
  const contenedor = document.getElementById('resultado-abajo');
  if (contenedor) {
    contenedor.innerHTML = '';
    contenedor.style.background = 'transparent';
    contenedor.style.boxShadow = 'none';
    contenedor.style.textShadow = 'none';
    contenedor.style.color = 'transparent';
  }
}
