const table = document.getElementById('table');
const leftTable = document.getElementById('left-table');
const rightTable = document.getElementById('right-table');
const rangeBottomTable = document.getElementById('table-2');
const sectBottomTable = document.getElementById('table-3');
const monedasDiv = document.querySelector('.Monedas'); // Nueva referencia
let celdasModificadas = []; // Array global para almacenar las celdas modificadas
let celdaRepetirApuesta = []; // Array global para almacenar las celdas modificadas

let apuestaTotal = 0;

document.addEventListener('DOMContentLoaded', function () {
  // Seleccionamos el elemento que tenga la clase específica (puedes cambiar '.mi-clase' a la clase que necesites)
  const element = document.querySelector('.apuesta');
  const botones = document.getElementsByClassName('boton-ruleta');

for (let i = 0; i < botones.length; i++) {
  botones[i].disabled = true;
  }

  if (element) {
    // Añadimos el texto "0.00€ apuesta" al contenido del elemento
    element.textContent = "0 FUN";
  } else {
    console.log("No se encontró el elemento con la clase '.mi-clase'");
  }
});

function activarBotones() {
  const botones = document.getElementsByClassName('boton-ruleta');
  for (let i = 0; i < botones.length; i++) {
    botones[i].disabled = false; // Activa todos los botones
  }
}



const redNumbers = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

let fichaSeleccionada = null; // Guardar ficha seleccionada

function crearTabla() {
  const leftLabels = ["0", "00"];
  leftLabels.forEach(label => {
    const cell = document.createElement('div');
    cell.textContent = label;
    cell.classList.add('cell', 'green');
    cell.dataset.number = label;
    leftTable.appendChild(cell);
  });

  for (let num = 1; num <= 36; num++) {
    const cell = document.createElement('div');
    cell.className = 'cell ' + (redNumbers.has(num) ? 'red' : 'black');
    cell.textContent = num;
    cell.dataset.number = num;
    table.appendChild(cell);
  }

  const rightLabels = ["1st", "2nd", "3rd"];
  rightLabels.forEach(label => {
    const cell = document.createElement('div');
    cell.textContent = label;
    cell.classList.add('cell', 'green');
    cell.dataset.range = label;
    rightTable.appendChild(cell);
  });

  const rangeBottomLabels = ["1-12", "13-24", "25-36"];
  rangeBottomLabels.forEach(label => {
    const cell = document.createElement('div');
    cell.textContent = label;
    cell.classList.add('cell', 'green');
    cell.dataset.range = label;
    rangeBottomTable.appendChild(cell);
  });

  const sectBottomLabels = ["1-18", "EVEN", "\u200B", "\u200B", "ODD", "19-36"];
  const picasColorLabels = ["red", "black"];
  sectBottomLabels.forEach(label => {
    const cell = document.createElement('div');
    cell.textContent = label;
    cell.classList.add('cell', 'green');

    if (label === "\u200B") {
      cell.classList.add('Picas');
      const span = document.createElement('span');
      const color = picasColorLabels.shift();
      span.className = `Picas-box-${color}`;
      span.textContent = color;
      span.textContent = '\u200B';
      cell.appendChild(span);
      cell.dataset.range = color;
    } else {
      cell.dataset.range = label;
    }

    sectBottomTable.appendChild(cell);
  });
}

function getNumbersForRange(label) {
  switch (label) {
    case '1-12': return Array.from({ length: 12 }, (_, i) => i + 1);
    case '13-24': return Array.from({ length: 12 }, (_, i) => i + 13);
    case '25-36': return Array.from({ length: 12 }, (_, i) => i + 25);
    case '1-18': return Array.from({ length: 18 }, (_, i) => i + 1);
    case '19-36': return Array.from({ length: 18 }, (_, i) => i + 19);
    case 'EVEN': return Array.from({ length: 18 }, (_, i) => (i + 1) * 2);
    case 'ODD': return Array.from({ length: 18 }, (_, i) => i * 2 + 1);
    case 'red': return [...redNumbers];
    case 'black': return Array.from({ length: 36 }, (_, i) => i + 1).filter(n => !redNumbers.has(n));
    case '1st': return Array.from({ length: 12 }, (_, i) => 3 * i + 3);
    case '2nd': return Array.from({ length: 12 }, (_, i) => 3 * i + 2);
    case '3rd': return Array.from({ length: 12 }, (_, i) => 3 * i + 1);
    default: return [];
  }
}

function setupHoverEffects() {
  const rangeCells = document.querySelectorAll('[data-range]');
  const numberCells = document.querySelectorAll('[data-number]');

  rangeCells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      const nums = getNumbersForRange(cell.dataset.range);
      numberCells.forEach(nCell => {
        if (nums.includes(Number(nCell.dataset.number))) {
          nCell.classList.add('highlight');
        }
      });
    });

    cell.addEventListener('mouseleave', () => {
      numberCells.forEach(nCell => {
        nCell.classList.remove('highlight');
      });
    });
  });

  numberCells.forEach(cell => {
    cell.addEventListener('mouseenter', () => {
      cell.classList.add('highlight');
    });
    cell.addEventListener('mouseleave', () => {
      cell.classList.remove('highlight');
    });
  });
}

// ===================
// Crear las monedas
// ===================
function crearMonedas() {
  const monedasDiv = document.querySelector('.Monedas');
  const valores = [1, 5, 10, 20, 50, 100, 500, 1000, 5000];

  valores.forEach(valor => {
    const ficha = document.createElement('div');
    ficha.classList.add('chip', `chip-${valor}`);
    ficha.textContent = valor;
    ficha.dataset.valor = valor;

    ficha.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      ficha.classList.add('selected');
      borrarResultadoAbajo()
      console.log(`Has seleccionado la ficha de ${valor}`);
    });

    monedasDiv.appendChild(ficha);
  });
}

// ===================
// Crear Botones
// ===================
function crearBotones() {
  const botonesDiv = document.querySelector('.Botones');
  if (!botonesDiv) return;

  const botones = [
    { texto: 'Repetir Apuesta', accion: repetirApuesta },
    { texto: 'Deshacer', accion: deshacerUltimaApuesta },
    { texto: '🎲Girar', accion: girarRuleta },
    { texto: 'Doblar', accion: doblarApuesta },
    { texto: 'Borrar Todo', accion: () => borrarTodasLasApuestas(true) }
  ];

  botones.forEach(({ texto, accion }) => {
    const boton = document.createElement('button');
    boton.textContent = texto;
    boton.classList.add('boton-ruleta');
    if (texto === '🎲Girar') {
      boton.id = 'girarBtn'; // Asigna el id aquí
    }
    boton.addEventListener('click', accion);
    botonesDiv.appendChild(boton);
  });
}

// FUNCIONES
// Repetir última apuesta
function repetirApuesta() {
  activarBotones()

  if (celdaRepetirApuesta.length === 0) {
    mostrarAlerta("No hay apuesta para repetir.");
    return;
  }

  // Convertimos los valores y calculamos el total de lo que se va a apostar
  let totalARepetir = Number(0);
  const apuestasValidas = [];

  for (const { seccion, numero } of celdaRepetirApuesta) {
    const valor = Number(numero);
    console.log(valor);

    if (isNaN(valor)) {
      console.warn(`Valor inválido para apuesta: ${numero}`);
      continue;
    }

    totalARepetir += Number(valor);
    apuestasValidas.push({ seccion, valor });
  }

  // Verificamos el límite de apuesta total
  if (apuestaTotal + totalARepetir > 5000) {
    mostrarAlerta("El límite de apuesta es 5000 FUN. No se ha repetido la apuesta.");
    return;
  }

  // Verificamos el saldo para cada ficha
  for (const { valor } of apuestasValidas) {
    if (!restartapuestadelSaldo(valor)) {
      mostrarAlerta(`Saldo insuficiente para repetir una ficha de ${valor} FUN.`);
      return;
    }
  }

  // Si todo está bien, realizamos las apuestas
  for (const { seccion, valor } of apuestasValidas) {
    const celdaElemento = Array.from(document.querySelectorAll('.cell')).find(
      el => el.textContent.trim() === seccion
    );

    if (!celdaElemento) {
      console.warn(`No se encontró una celda con texto: ${seccion}`);
      continue;
    }

    const fichaClon = document.createElement("div");
    fichaClon.className = `chip chip-${valor} chip-clone`;
    fichaClon.dataset.valor = valor;

    Object.assign(fichaClon.style, {
      position: "absolute",
      pointerEvents: "none",
      zIndex: "10",
      transform: "translate(-50%, -50%) scale(0.5)",
      left: "50%",
      top: "50%"
    });

    celdaElemento.appendChild(fichaClon);
    

    // Guardar en los arrays como el código de referencia
    historialApuestas.push({ seccion, numero: valor, ficha: fichaClon });
    // Guardar la celda modificada
    celdasModificadas.push(celdaElemento); // Añadir la celda al array
    const a = Number(obtenerApuestaNumerico() || 0);
    let b = a + valor; // o + totalARepetir si solo quieres mostrar lo repetido

    document.getElementsByClassName('apuesta')[0].textContent = b + " FUN";    
  }

  mostrarAlerta("Apuesta repetida.");
  // Actualiza el texto de la apuesta total
    const apuesta = document.querySelector('.apuesta');
    if (apuesta) apuesta.textContent = b + ' FUN';
}


// Deshacer última apuesta eliminando la última .cell añadida
function deshacerUltimaApuesta() {
  if (celdasModificadas.length === 0) {
    mostrarAlerta("No hay apuestas que deshacer.");
    return;
  }

  // Obtener la última celda modificada
  const ultimaCelda = celdasModificadas.pop();

  // Obtener la última ficha añadida en esa celda
  const fichas = ultimaCelda.querySelectorAll('.chip-clone');
  if (fichas.length === 0) return;

  const ultimaFicha = fichas[fichas.length - 1];
  const valor = ultimaFicha.dataset.valor;
  const valo = Number(valor);
  // Eliminar la ficha del DOM
  ultimaFicha.remove();

  // Devolver el valor al saldo
  apuestaTotal -= valo;
  devolverSaldo(valo);

  // Actualizar el DOM con la nueva apuesta total
  actualizarApuestaEnDOM();
  console.log(celdasModificadas)
  if (celdasModificadas.length == 0) {
    desactivarBotones()
  }
}

// Girar la ruleta
function girarRuleta() {
  historialApuestas = []; // Reiniciamos historial para la próxima ronda

  // Limpiar el total de la apuesta después de girar
  actualizarApuestaEnDOM();

  // Opcional: Desactivar botones hasta nueva apuesta
  desactivarBotones();
  guardarApuestasDesdeMesa();
  reiniciarCeldas();
}


// Doblar la apuesta
function doblarApuesta() {
  desactivarMonedas()
  const celdasConFichas = document.querySelectorAll('.cell');
  let fichasADoblar = [];

  // Recolectamos las fichas que se quieren duplicar
  celdasConFichas.forEach(cell => {
    const fichas = cell.querySelectorAll('.chip-clone');
    fichas.forEach(ficha => {
      const valor = Number(ficha.dataset.valor);
      if (!isNaN(valor)) {
        fichasADoblar.push({ cell, ficha, valor });
      }
    });
  });

  // Calcular el total de la apuesta nueva
  const totalADuplicar = fichasADoblar.reduce((acc, { valor }) => acc + valor, 0);

  if (apuestaTotal + totalADuplicar > 5000) {
    mostrarAlerta("El límite de apuesta es 5000 FUN. No se han duplicado las fichas.");
    return;
  }

  // Verificar si el saldo alcanza para todas
  for (let { valor } of fichasADoblar) {
    if (!restartapuestadelSaldo(valor)) {
      mostrarAlerta(`Saldo insuficiente para duplicar una ficha de ${valor} FUN.`);
      return;
    }
  }

  // Si todo está bien, hacemos la duplicación
  fichasADoblar.forEach(({ cell, ficha, valor }) => {
    const fichaClonada = ficha.cloneNode(true);
    fichaClonada.style.transform = 'translate(-50%, -50%) scale(0.5)';
    fichaClonada.style.left = '50%';
    fichaClonada.style.top = '50%';
    fichaClonada.dataset.valor = Number(valor);

    cell.appendChild(fichaClonada);
    celdasModificadas.push(cell);

    historialApuestas.push({ valor, celda: cell });

    apuestaTotal += valor;
    actualizarApuestaEnDOM();
  });


}




// Borrar todas las apuestas
function borrarTodasLasApuestas(resetHistorial = true) {

  document.querySelectorAll('.chip-clone').forEach(ficha => ficha.remove());

  if (resetHistorial) historialApuestas = [];

  devolverSaldo(apuestaTotal);
  apuestaTotal = 0;
  actualizarApuestaEnDOM();
  desactivarBotones();

  // Vaciar celdas modificadas
  celdasModificadas = [];
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
}


// Devuelve el saldo al jugador
function devolverSaldo(valor) {
  const saldo = document.querySelector('.saldo');
  if (saldo) {
    let saldoActual = parseFloat(saldo.textContent.replace(' FUN', '').trim());
    saldoActual += valor;
    saldo.textContent = saldoActual + ' FUN';
  }
}

// Actualiza el texto de la apuesta total
function actualizarApuestaEnDOM() {
  const apuesta = document.querySelector('.apuesta');
  if (apuesta) apuesta.textContent = apuestaTotal + ' FUN';
}

// ——— Seguimiento de un clon pequeño sin número ———
let dragClone = null;
let moveHandler = null;
let originChip = null; // Guarda la moneda original

// Helper: centra el clon bajo el cursor
function moveCloneToCursor(e) {
  if (!dragClone) return;
  const { width, height } = dragClone.getBoundingClientRect();
  dragClone.style.left = `${e.pageX - width / 2}px`;
  dragClone.style.top  = `${e.pageY - height / 2}px`;
}

// Función para eliminar el clon actual
function removeClone() {
  if (dragClone) {
    document.removeEventListener('mousemove', moveHandler);
    dragClone.remove();
    dragClone = null;
    moveHandler = null;
  }
  if (originChip) {
    originChip.classList.remove('selected');
    originChip = null;
  }
}



// Al hacer clic en una .chip
document.addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  // Si clicas sobre la misma moneda, eliminas el clon
  if (originChip === chip && dragClone) {
    removeClone();
    return;
  }

  // Si hay un clon de otra moneda, lo quitamos
  removeClone();

  // Guardamos la nueva ficha original y le ponemos 'selected'
  originChip = chip;
  originChip.classList.add('selected');

  // Creamos un nuevo clon SIN número
  dragClone = chip.cloneNode(false);
  dragClone.classList.add('chip-clone');

  // Estilos iniciales para el clon
  Object.assign(dragClone.style, {
    position:       'absolute',
    pointerEvents:  'none',
    zIndex:         '1000',
    transform:      'scale(0.5)',
    transformOrigin:'top left'  // para centrar bien
  });
  document.body.appendChild(dragClone);

  // Posicionamos el clon inmediatamente en el cursor
  moveCloneToCursor(e);

  // Activamos el movimiento
  moveHandler = ev => moveCloneToCursor(ev);
  document.addEventListener('mousemove', moveHandler);
});

// Variable para verificar si se ha alcanzado el límite
let limiteAlcanzado = false;

// Array con los números válidos en los cuales se pueden pegar las fichas
const validNumbers = ['00', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '1st', '2rd', '3rd', '1-12', '13-24', '25-36', '1-18', 'EVEN', 'ODD', '19-36'];

// Modificar el código donde actualizas la apuesta total
document.addEventListener('click', e => {
  const cell = e.target.closest('.cell'); // Obtener la celda donde se hace clic
  if (!cell) return; // Si no es una celda, no hacemos nada

  // Verificar si el contenido de la celda está en el array de números válidos o es una celda especial
  if (validNumbers.includes(cell.textContent.trim()) || cell.classList.contains('green') || cell.classList.contains('Picas') || cell.classList.contains('red') || cell.classList.contains('black')) {

      // Obtener el valor de la ficha antes de crearla
      const valorFicha = Number(originChip.dataset.valor);

      // Verificamos si el valor de la ficha hace que el total de la apuesta supere los 5000
      if (apuestaTotal + valorFicha > 5000) {
        mostrarAlerta("El límite de apuesta es 5000 FUN. No puedes agregar más dinero."); // Mostrar la alerta si se supera el límite
        // Establecer que el límite ha sido alcanzado
        return; // Salir de la función sin crear la ficha
      }
      if (!restartapuestadelSaldo(valorFicha)) {
        return; // Si restart devuelve false, detenemos todo
      }
      // Si no se supera el límite, entonces creamos la moneda
      const newClone = dragClone.cloneNode(true); // Clonamos el clon original

      // Establecer los estilos del clon
      newClone.style.position = 'absolute'; // Posicionamiento absoluto para que se quede centrado
      newClone.style.transform = 'scale(0.5)'; // Reducimos el tamaño de la ficha
      newClone.style.left = '50%'; // Centrar horizontalmente
      newClone.style.top = '50%';  // Centrar verticalmente
      newClone.style.transform = 'translate(-50%, -50%) scale(0.5)'; // Centrado exacto
      newClone.style.pointerEvents = 'none'; // No bloquear futuros clics
      newClone.style.zIndex = '10'; // Aseguramos que se vea por encima

      // Agregar la moneda clonada directamente al DOM sin necesidad de un contenedor
      cell.appendChild(newClone);

      // Guardar la celda modificada
      celdasModificadas.push(cell); // Añadir la celda al array

      // Obtener las coordenadas de la moneda colocada (para saber en qué celda está)
      const rect = newClone.getBoundingClientRect();
      console.log("Coordenadas de la moneda: ", rect);

      // Puedes usar estas coordenadas para adivinar en qué celda se encuentra la moneda
      const cellRect = cell.getBoundingClientRect();
      const xInCell = rect.left - cellRect.left;  // Coordenada X relativa a la celda
      const yInCell = rect.top - cellRect.top;    // Coordenada Y relativa a la celda

      // Actualizamos la apuesta total después de añadir la ficha
      apuestaTotal += valorFicha;

      // Actualizar el texto de la apuesta total en el DOM
      const apuestaElement = document.querySelector('.apuesta');
      if (apuestaElement) {
        apuestaElement.textContent = apuestaTotal + " FUN";

      console.log(`Moneda colocada en la celda: ${cell.textContent}`);
      console.log(`Coordenadas relativas dentro de la celda: X: ${xInCell}, Y: ${yInCell}`);
      activarBotones()
    }
  } else {
    console.log("No puedes colocar la ficha en esta celda.");
  }
});

// Funcion restart monedas a saldo
function restartapuestadelSaldo(valorFicha) {
  let apuesta = document.getElementsByClassName('apuesta')[0];
  let saldo = document.getElementsByClassName('saldo')[0];

  if (apuesta && saldo) {
    let saldoActual = parseFloat(saldo.textContent.replace(' FUN', '').trim());

    if (saldoActual !== 0) {
      saldoActual -= valorFicha;

      if (saldoActual < 0) {
        saldoActual = 0;
        saldo.textContent = saldoActual + ' FUN'; // Actualizar a 0.00 FUN
        mostrarAlerta("Te has quedado sin dinero"); // Lanzar alerta
        return false; // Devolver false para indicar que no se debe seguir
      }

      saldo.textContent = saldoActual + ' FUN';
      return true; // Seguimos si todo está bien
    } mostrarAlerta("Te has quedado sin dinero"); // Lanzar alerta
  } else {
    console.error("No se encontraron elementos con las clases 'apuesta' o 'saldo'.");
    return false;
  }
}

// Función para crear y mostrar la alerta personalizada
function crearAlerta(mensajeTexto) {
  // Si ya existe la alerta, solo actualizamos el mensaje
  let alerta = document.getElementById('alertaLimite');
  if (!alerta) {
    alerta = document.createElement('div');
    alerta.id = 'alertaLimite';
    alerta.classList.add('alerta');
    alerta.style.display = 'none';  // Inicialmente oculta

    // Contenedor de la alerta
    const alertaContenido = document.createElement('div');
    alertaContenido.classList.add('alerta-contenido');

    // Mensaje de la alerta
    const mensaje = document.createElement('p');
    mensaje.classList.add('alerta-mensaje');
    mensaje.id = 'mensajeAlerta'; // <- Importante, para luego actualizarlo
    mensaje.textContent = mensajeTexto;

    // Botón para cerrar la alerta
    const cerrarBoton = document.createElement('button');
    cerrarBoton.id = 'cerrarAlerta';
    cerrarBoton.textContent = 'Cerrar';
    cerrarBoton.addEventListener('click', () => {
      alerta.style.display = 'none';  // Ocultar la alerta cuando se cierre
    });

    // Añadir los elementos al contenedor
    alertaContenido.appendChild(mensaje);
    alertaContenido.appendChild(cerrarBoton);
    alerta.appendChild(alertaContenido);
    document.body.appendChild(alerta);
  } else {
    // Si ya existe, solo actualizamos el texto
    const mensaje = document.getElementById('mensajeAlerta');
    if (mensaje) {
      mensaje.textContent = mensajeTexto;
    }
  }
}

// Función para mostrar la alerta
function mostrarAlerta(mensajeTexto) {
  crearAlerta(mensajeTexto);
  const alerta = document.getElementById('alertaLimite');
  alerta.style.display = 'flex';  // Mostrar la alerta
}

let historialApuestas = [];

// Crear una ficha clonada (usado por varias funciones)
function crearFicha(valor) {
  const ficha = document.createElement('div');
  ficha.classList.add('chip', `chip-${valor}`, 'chip-clone');
  ficha.textContent = valor;
  ficha.style.position = 'absolute';
  ficha.style.transform = 'translate(-50%, -50%) scale(0.5)';
  ficha.style.left = '50%';
  ficha.style.top = '50%';
  ficha.style.pointerEvents = 'none';
  ficha.style.zIndex = '10';
  return ficha;
}

function guardarApuestasDesdeMesa() {
  celdaRepetirApuesta = []; // Limpiar apuestas anteriores

  const fichas = document.querySelectorAll('.tables .chip-clone');

  fichas.forEach(ficha => {
    const valor = ficha.dataset.valor;
    if (isNaN(valor)) return;

    // Encontrar la celda padre que contiene la ficha
    const celda = ficha.closest('.cell');
    if (!celda) return;

    const numeroSeccion = celda.textContent.trim();

    celdaRepetirApuesta.push({ seccion: numeroSeccion, numero: valor });
  });

  console.log("Apuestas guardadas desde mesa:", celdaRepetirApuesta);
}



// ========================
// Inicialización
// ========================
crearTabla();
setupHoverEffects();
crearMonedas();
crearBotones();

function activarBotones() {
  const botones = document.getElementsByClassName('.boton-ruleta');
  
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


function obtenerApuestaNumerico() {
  const saldoElemento = document.getElementsByClassName('apuesta')[0];
  if (!saldoElemento) return 0;
  const texto = saldoElemento.textContent || saldoElemento.innerText;
  const numero = texto.replace(/[^\d.]/g, '');
  return parseFloat(numero);
}

function reiniciarCeldas() {
  // Limpiar el array de celdas modificadas
  celdasModificadas = [];

  // Limpiar las celdas donde se colocaron las fichas
  celdasModificadas.forEach(cell => {
    // Eliminar todas las fichas de la celda
    const monedas = cell.querySelectorAll('.moneda');  // Selecciona todas las monedas dentro de la celda
    monedas.forEach(monedita => monedita.remove());    // Elimina las monedas
  });

  console.log("Celdas y apuestas reiniciadas");
}

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

window.addEventListener('load', () => {
  // Array con los enlaces de las canciones
  const canciones = [
    "song/chillSong_1.mp3",
    "song/chillSong_2.mp3",
    "song/chillSong_3.mp3"
  ];

  // Selecciona una canción aleatoria del array
  const randomIndex = Math.floor(Math.random() * canciones.length);
  const selectedSong = canciones[randomIndex];

  // Obtiene el elemento de audio y lo configura para la canción aleatoria
  const audioElement = document.getElementsByClassName("bgMusic")[0];
  audioElement.src = selectedSong;

  const botonSonido = document.getElementById("toggleMusic");
  let musicaActiva = false;

  // Preguntar si el usuario quiere activar la música
  Swal.fire({
    title: '🎵 ¿Quieres activar la música?',
    text: 'Disfruta de una experiencia más inmersiva con música de fondo.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, activar',
    cancelButtonText: 'No, gracias',
  }).then((result) => {
    if (result.isConfirmed && audioElement) {
      audioElement.play().then(() => {
        musicaActiva = true;
        if (botonSonido) botonSonido.textContent = "🔈";
      }).catch((e) => {
        console.log("Error al reproducir la música:", e);
        Swal.fire("⚠️ No se pudo reproducir la música automáticamente.", "Actívala manualmente si lo deseas.", "warning");
      });
    }
  });

  // Control manual desde el botón
  if (botonSonido) {
    botonSonido.addEventListener("click", () => {
      if (!audioElement) return;

      if (musicaActiva) {
        audioElement.pause();
        botonSonido.textContent = "🔇";
        musicaActiva = false;
      } else {
        audioElement.play().then(() => {
          botonSonido.textContent = "🔈";
          musicaActiva = true;
        }).catch(err => {
          console.error("Error al reproducir música:", err);
          Swal.fire("⚠️ No se pudo reproducir la música.", "Actívala manualmente si lo deseas.", "warning");
        });
      }
    });
  }
});
