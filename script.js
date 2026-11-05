/* ==========================================================================
   SCRIPT: PINTA REAL - TIKTOK LIVE SHOPPING & BITÁCORA JS
   Integración estricta de requisitos: Día 1 y Día 2 + Validaciones
   Estudiante: Gabriel Alejandro Garay Esprella (Tec. Gabriel)
   Materia: Diseño Web II • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. REFERENCIAS AL DOM
  // ========================================================================
  
  // Elementos Día 1
  const liveContainer = document.getElementById('liveContainer');
  const chatInput = document.getElementById('chatInput');
  const btnSendChat = document.getElementById('btnSendChat');
  const logOutput = document.getElementById('logOutput');

  // Elementos Día 2
  const variantSelect = document.getElementById('variantSelect');
  const orderForm = document.getElementById('orderForm');
  const userTikTok = document.getElementById('userTikTok');
  const userErrorMsg = document.getElementById('userErrorMsg');
  const logDia2 = document.getElementById('logDia2');

  // Elementos UI Pinta Real
  const previewName = document.getElementById('previewName');
  const cartBadge = document.getElementById('cartBadge');
  const btnClearLog = document.getElementById('btnClearLog');
  const countEvents = document.getElementById('countEvents');
  const countLikes = document.getElementById('countLikes');
  const countOrders = document.getElementById('countOrders');

  // Contadores
  let totalEvents = 0;
  let totalLikes = 0;
  let totalOrders = 0;
  let cartCount = 0;

  // ========================================================================
  // 2. SISTEMA DE VALIDACIÓN DE CUENTA TIKTOK (Debe incluir '@')
  // ========================================================================

  /**
   * Valida estrictamente que el usuario empiece con '@' y tenga formato válido
   * @param {string} usuario 
   * @returns {{ valida: boolean, mensaje: string }}
   */
  function validarCuentaTikTok(usuario) {
    const val = usuario.trim();

    if (val === '') {
      return { valida: false, mensaje: '⚠️ El nombre de usuario de TikTok es obligatorio.' };
    }
    if (!val.startsWith('@')) {
      return { valida: false, mensaje: '⚠️ El usuario debe comenzar obligatoriamente con "@" (Ej: @cliente_pinta).' };
    }
    if (val.length < 4) {
      return { valida: false, mensaje: '⚠️ El usuario debe tener al menos 3 caracteres después del "@".' };
    }
    if (!/^@[A-Za-z0-9_.]+$/.test(val)) {
      return { valida: false, mensaje: '⚠️ Solo se permiten letras, números, puntos y guiones bajos.' };
    }
    if (val.length > 25) {
      return { valida: false, mensaje: '⚠️ El usuario no puede exceder los 24 caracteres.' };
    }

    return { valida: true, mensaje: '' };
  }

  /**
   * Muestra u oculta errores visuales en tiempo real en el input de usuario
   */
  function actualizarEstadoValidacionUsuario(mostrarMensajeSiInvalido = true) {
    if (!userTikTok) return true;

    const resultado = validarCuentaTikTok(userTikTok.value);

    if (resultado.valida) {
      userTikTok.classList.remove('is-invalid');
      userTikTok.classList.add('is-valid');
      if (userErrorMsg) {
        userErrorMsg.style.display = 'none';
        userErrorMsg.textContent = '';
      }
      return true;
    } else {
      userTikTok.classList.remove('is-valid');
      if (mostrarMensajeSiInvalido) {
        userTikTok.classList.add('is-invalid');
        if (userErrorMsg) {
          userErrorMsg.style.display = 'flex';
          userErrorMsg.textContent = resultado.mensaje;
        }
      }
      return false;
    }
  }

  // Validación en tiempo real al escribir
  if (userTikTok) {
    userTikTok.addEventListener('input', () => {
      // Si el usuario ya comenzó a escribir con '@', validar dinámicamente
      if (userTikTok.value.length > 0) {
        actualizarEstadoValidacionUsuario(true);
      } else {
        userTikTok.classList.remove('is-invalid', 'is-valid');
        if (userErrorMsg) userErrorMsg.style.display = 'none';
      }
    });

    userTikTok.addEventListener('blur', () => {
      if (userTikTok.value.trim() !== '') {
        actualizarEstadoValidacionUsuario(true);
      }
    });
  }

  // ========================================================================
  // 3. FUNCIONES DE REGISTRO EN BITÁCORA (DÍA 1 Y DÍA 2)
  // ========================================================================

  function logEvent(tipo, mensaje) {
    const hora = new Date().toLocaleTimeString();
    totalEvents++;
    if (countEvents) countEvents.textContent = totalEvents;

    // Clase CSS según el tipo de acción
    let rowClass = 'terminal-row';
    if (tipo.includes('COMPRA')) {
      rowClass += ' row-compra';
      totalOrders++;
      if (countOrders) countOrders.textContent = totalOrders;
    } else if (tipo.includes('OFERTA') || tipo.includes('VARIANTE')) {
      rowClass += ' row-oferta';
    } else if (tipo.includes('LIKE')) {
      rowClass += ' row-like';
      totalLikes++;
      if (countLikes) countLikes.textContent = totalLikes;
    } else if (tipo.includes('ERROR')) {
      rowClass += ' row-error';
    }

    // Insertar en la bitácora visual (#logOutput - Día 1)
    if (logOutput) {
      const item = document.createElement('div');
      item.className = rowClass;
      item.innerHTML = `<span class="terminal-time">[${hora}]</span> <strong>${tipo}:</strong> ${mensaje}`;
      logOutput.prepend(item);
    }

    // Sincronizar con #logDia2 para compatibilidad total con la guía 2
    if (logDia2) {
      const rowDia2 = document.createElement('div');
      rowDia2.innerHTML = `[${hora}] ${tipo}: ${mensaje}`;
      logDia2.prepend(rowDia2);
    }
  }

  function addLog(tipo, msg) {
    logEvent(tipo, msg);
  }

  window.logEvent = logEvent;
  window.addLog = addLog;

  // ========================================================================
  // 4. DÍA 1: DELEGACIÓN DE EVENTOS EN EL STREAM (#liveContainer)
  // ========================================================================
  if (liveContainer) {
    liveContainer.addEventListener('click', (e) => {
      
      // A) Clic en botón de compra de prenda (data-prod)
      const btnProd = e.target.closest('[data-prod]');
      if (btnProd) {
        const prod = btnProd.getAttribute('data-prod');
        logEvent('OFERTA_CLICK', `Prenda seleccionada: ${prod}`);

        // Sincronizar automáticamente con el selector de variantes
        if (variantSelect) {
          variantSelect.value = prod;
          actualizarPreview(prod);
        }

        // Actualizar contador del carrito
        cartCount++;
        if (cartBadge) cartBadge.textContent = cartCount;

        mostrarNotificacion(`Prenda añadida: "${prod.split('-')[0]}"`);
        return;
      }

      // B) Clic en botón de Me Gusta (data-action="like")
      const btnLike = e.target.closest('[data-action="like"]');
      if (btnLike) {
        logEvent('LIKE_STREAM', '¡El espectador envió un ❤️ al Live!');
        dispararCorazonFlotante(e);
        return;
      }
    });
  }

  // ========================================================================
  // 5. DÍA 1: CAPTURA DE TECLADO EN EL CHAT (keyup)
  // ========================================================================
  if (chatInput) {
    chatInput.addEventListener('keyup', (e) => {
      logEvent('CHAT_INPUT', `Tecleando mensaje: "${e.target.value}"`);

      if (e.key === 'Enter' && e.target.value.trim() !== '') {
        enviarComentarioChat();
      }
    });
  }

  if (btnSendChat) {
    btnSendChat.addEventListener('click', enviarComentarioChat);
  }

  function enviarComentarioChat() {
    if (!chatInput) return;
    const msg = chatInput.value.trim();
    if (!msg) {
      mostrarNotificacion('⚠️ Por favor escribe un mensaje antes de enviar.', true);
      chatInput.focus();
      return;
    }

    logEvent('CHAT_PUBLICADO', `Comentario en directo: "${msg}"`);
    mostrarNotificacion(`Comentario enviado: "${msg}"`);
    chatInput.value = '';
  }

  // ========================================================================
  // 6. DÍA 2: EVENTO CHANGE EN SELECTOR DE VARIANTES
  // ========================================================================
  if (variantSelect) {
    variantSelect.addEventListener('change', (e) => {
      const selectedValue = e.target.value;
      addLog('CAMBIO_VARIANTE', `El cliente seleccionó: ${selectedValue}`);
      actualizarPreview(selectedValue);
    });

    actualizarPreview(variantSelect.value);
  }

  function actualizarPreview(valor) {
    if (previewName && valor) {
      previewName.textContent = valor.split('-')[0].trim();
    }
  }

  // ========================================================================
  // 7. DÍA 2: EVENTO SUBMIT CON VALIDACIÓN ESTRICTA (Requiere '@')
  // ========================================================================
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      // 1. Evitar la recarga de página (mantiene la transmisión fluida)
      e.preventDefault();

      // 2. VALIDACIÓN ESTRICTA DEL USUARIO (Debe tener '@')
      const esUsuarioValido = actualizarEstadoValidacionUsuario(true);

      if (!esUsuarioValido) {
        // Registrar intento fallido en la bitácora
        logEvent('ERROR_VALIDACIÓN', `Intento de compra denegado: el usuario "${userTikTok.value}" no cumple el formato con "@".`);
        mostrarNotificacion('⚠️ Error: Debes ingresar un usuario de TikTok válido con "@".', true);
        userTikTok.focus();
        return; // Detiene el procesamiento si la validación falla
      }

      // 3. Extraer valores del formulario validado
      const variante = variantSelect ? variantSelect.value : 'Prenda Pinta Real';
      const usuario = userTikTok.value.trim();
      const pago = document.getElementById('paymentMethod')?.value || 'QR Simple';

      // 4. Registrar compra exitosa en la bitácora
      addLog('COMPRA_EXITOSA', `Pedido confirmado para ${usuario} (${variante}) 🎉 [Pago: ${pago}]`);

      // 5. Feedback visual de éxito
      mostrarNotificacion(`🎉 ¡Pedido confirmado para ${usuario}!`);

      // 6. Resetear formulario y estados de validación
      orderForm.reset();
      userTikTok.classList.remove('is-valid', 'is-invalid');
      if (userErrorMsg) userErrorMsg.style.display = 'none';

      // Restaurar preview al valor por defecto
      if (variantSelect) {
        actualizarPreview(variantSelect.value);
      }
    });
  }

  // ========================================================================
  // 8. HERRAMIENTAS ADICIONALES (Limpiar Bitácora y Corazones)
  // ========================================================================
  if (btnClearLog) {
    btnClearLog.addEventListener('click', () => {
      if (logOutput) {
        logOutput.innerHTML = `<div class="terminal-row"><span class="terminal-time">[${new Date().toLocaleTimeString()}]:</span> Bitácora limpia. Escuchando eventos...</div>`;
      }
    });
  }

  // Animación de corazón flotante
  function dispararCorazonFlotante(e) {
    const heart = document.createElement('div');
    heart.textContent = '❤️';
    heart.style.position = 'fixed';
    heart.style.fontSize = '2rem';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '9999';
    heart.style.left = (e.clientX ? (e.clientX - 10) : (window.innerWidth - 80)) + 'px';
    heart.style.top = (e.clientY ? (e.clientY - 20) : (window.innerHeight - 150)) + 'px';
    heart.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    heart.style.opacity = '1';
    document.body.appendChild(heart);

    requestAnimationFrame(() => {
      heart.style.transform = `translateY(-120px) scale(1.4) rotate(${Math.random() * 40 - 20}deg)`;
      heart.style.opacity = '0';
    });

    setTimeout(() => heart.remove(), 1200);
  }

  // Notificación flotante suave
  function mostrarNotificacion(texto, esError = false) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = esError ? '#7F1D1D' : '#0A192F';
    toast.style.color = '#FFFFFF';
    toast.style.border = esError ? '1px solid #EF4444' : '1px solid #D4AF37';
    toast.style.borderRadius = '8px';
    toast.style.padding = '10px 18px';
    toast.style.fontSize = '0.85rem';
    toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
    toast.style.zIndex = '10000';
    toast.style.transition = 'opacity 0.3s ease';
    toast.innerHTML = `<span style="color: ${esError ? '#F87171' : '#D4AF37'};">${esError ? '✕' : '✓'}</span> ${texto}`;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

});
