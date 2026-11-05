/* ==========================================
   SISTEMA DE AUTENTICACIÓN, ROLES Y CLIENTES (DANDELION)
   ========================================== */

const administradores = [
    { usuario: "andy@dandelion.cl", password: "1234", rol: "Administrador Web y Compras" },
    { usuario: "diego@dandelion.cl", password: "1234", rol: "Administrador Marketing y Ventas" },
    { usuario: "miguel@dandelion.cl", password: "1234", rol: "Administrador Producción y Calidad" }
];

document.addEventListener("DOMContentLoaded", () => {
    
    // Actualizar el contador del carrito al cargar cualquier página
    actualizarContadorCarrito();

    // --- 1. CONTROL DE PANELES EN LOGIN.HTML ---
    const panelLogin = document.getElementById("panel-login");
    const panelRegistro = document.getElementById("panel-registro");
    const btnIrRegistro = document.getElementById("ir-a-registro");
    const btnIrLogin = document.getElementById("ir-a-login");

    if (btnIrRegistro) {
        btnIrRegistro.addEventListener("click", (e) => {
            e.preventDefault();
            limpiarErroresFormularios();
            if (panelLogin && panelRegistro) {
                panelLogin.style.display = "none";
                panelRegistro.style.display = "block";
            }
        });
    }

    if (btnIrLogin) {
        btnIrLogin.addEventListener("click", (e) => {
            e.preventDefault();
            limpiarErroresFormularios();
            if (panelLogin && panelRegistro) {
                panelRegistro.style.display = "none";
                panelLogin.style.display = "block";
            }
        });
    }

    // --- 2. REGISTRO DE NUEVOS USUARIOS ---
    const formRegistro = document.getElementById("form-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            limpiarErroresFormularios();

            const nombreElem = document.getElementById("nombre-reg");
            const emailElem = document.getElementById("email-reg");
            const passElem = document.getElementById("pass-reg");

            const nombre = nombreElem ? nombreElem.value.trim() : "";
            const email = emailElem ? emailElem.value.trim() : "";
            const password = passElem ? passElem.value.trim() : "";

            let usuarios = JSON.parse(localStorage.getItem("dandelion_usuarios")) || [];
            const existe = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase() || u.nombre.toLowerCase() === nombre.toLowerCase());

            if (existe) {
                mostrarErrorAbajo("email-reg", "Este usuario o correo ya está registrado.");
                return;
            }

            const fechaRegistro = new Date().toLocaleDateString("es-CL");
            usuarios.push({ nombre, email, password, fechaRegistro });
            localStorage.setItem("dandelion_usuarios", JSON.stringify(usuarios));
            
            mostrarMensajeFlotante("✨ ¡Registro exitoso! Ya puedes iniciar sesión.", "exito");
            formRegistro.reset();
            
            setTimeout(() => {
                if (panelRegistro && panelLogin) {
                    panelRegistro.style.display = "none";
                    panelLogin.style.display = "block";
                }
            }, 1500);
        });
    }

    // --- 3. INICIO DE SESIÓN ---
    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            limpiarErroresFormularios();

            const userElem = document.getElementById("usuario");
            const passElem = document.getElementById("password");

            const inputUser = userElem ? userElem.value.trim().toLowerCase() : "";
            const inputPass = passElem ? passElem.value.trim() : "";

            let hayError = false;
            if (!inputUser) {
                mostrarErrorAbajo("usuario", "Campo obligatorio, ingrese nuevamente.");
                hayError = true;
            }
            if (!inputPass) {
                mostrarErrorAbajo("password", "Campo obligatorio, ingrese nuevamente.");
                hayError = true;
            }
            if (hayError) return;

            const adminEncontrado = administradores.find(
                a => a.usuario.toLowerCase() === inputUser && a.password === inputPass
            );

            if (adminEncontrado) {
                const sesionAdmin = {
                    nombre: adminEncontrado.usuario.split("@")[0],
                    email: adminEncontrado.usuario,
                    esAdmin: true,
                    rol: adminEncontrado.rol
                };
                localStorage.setItem("dandelion_sesion_activa", JSON.stringify(sesionAdmin));
                actualizarContadorCarrito();
                mostrarMensajeFlotante(`🔑 ¡Bienvenido Administrador!`, "exito");
                
                setTimeout(() => {
                    window.location.href = "admin.html";
                }, 1200);
                return;
            }

            let usuariosClientes = JSON.parse(localStorage.getItem("dandelion_usuarios")) || [];
            const clienteEncontrado = usuariosClientes.find(
                u => (u.nombre.toLowerCase() === inputUser || u.email.toLowerCase() === inputUser) && u.password === inputPass
            );

            if (clienteEncontrado) {
                const sesionCliente = {
                    nombre: clienteEncontrado.nombre,
                    email: clienteEncontrado.email,
                    esAdmin: false
                };
                localStorage.setItem("dandelion_sesion_activa", JSON.stringify(sesionCliente));
                actualizarContadorCarrito();
                mostrarMensajeFlotante(`🌸 ¡Bienvenido de nuevo, ${clienteEncontrado.nombre}!`, "exito");
                
                setTimeout(() => {
                    window.location.href = "usuario.html";
                }, 1200);
            } else {
                // Mensaje genérico de seguridad abajo de ambos campos (evita dar pistas a atacantes)
                mostrarErrorAbajo("usuario", "Correo o contraseña incorrectos, ingrese nuevamente.");
                mostrarErrorAbajo("password", "Correo o contraseña incorrectos, ingrese nuevamente.");
            }
        });
    }

    // --- 4. CARGAR PANEL DE CLIENTE ---
    const panelBienvenida = document.getElementById("nombre-usuario-panel");
    if (panelBienvenida) {
        const sesionActiva = JSON.parse(localStorage.getItem("dandelion_sesion_activa"));
        if (!sesionActiva) {
            mostrarMensajeFlotante("⚠️ Debes iniciar sesión para ver tu panel.", "error");
            setTimeout(() => { window.location.href = "login.html"; }, 1500);
        } else {
            panelBienvenida.textContent = sesionActiva.nombre;
            const emailPanel = document.getElementById("email-usuario-panel");
            if (emailPanel) emailPanel.textContent = sesionActiva.email;
            cargarPedidosUsuario();
        }
    }

    // --- 5. CARGAR PANEL DE ADMIN ---
    const tablaUsuariosAdmin = document.getElementById("tabla-usuarios-registrados");
    if (tablaUsuariosAdmin) {
        const sesionActiva = JSON.parse(localStorage.getItem("dandelion_sesion_activa"));
        if (!sesionActiva || !sesionActiva.esAdmin) {
            mostrarMensajeFlotante("⚠️ Acceso denegado. Debes iniciar sesión como Administrador.", "error");
            setTimeout(() => { window.location.href = "login.html"; }, 1500);
            return;
        }

        const adminNombreElem = document.getElementById("nombre-admin-panel");
        if (adminNombreElem) adminNombreElem.textContent = sesionActiva.nombre;

        cargarUsuariosRegistrados();
        cargarPedidosAdmin();
    }

    // --- 6. CERRAR SESIÓN ---
    const btnCerrarSesion = document.getElementById("cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem("dandelion_sesion_activa");
            actualizarContadorCarrito(); 
            mostrarMensajeFlotante("Has cerrado sesión exitosamente.", "exito");
            setTimeout(() => { window.location.href = "login.html"; }, 1000);
        });
    }
});


// --- FUNCIONES AUXILIARES, TOASTS Y ERRORES EN LÍNEA ---

function mostrarMensajeFlotante(mensaje, tipo = 'exito') {
    let toast = document.getElementById('dandelion-toast-msg');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dandelion-toast-msg';
        toast.style.position = 'fixed';
        toast.style.bottom = '25px';
        toast.style.right = '25px';
        toast.style.zIndex = '99999';
        toast.style.padding = '14px 22px';
        toast.style.borderRadius = '8px';
        toast.style.fontWeight = '600';
        toast.style.fontSize = '0.95rem';
        toast.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
        toast.style.transition = 'all 0.3s ease';
        document.body.appendChild(toast);
    }
    
    toast.textContent = mensaje;
    if (tipo === 'error') {
        toast.style.backgroundColor = '#fee2e2';
        toast.style.color = '#991b1b';
        toast.style.border = '1px solid #f87171';
    } else {
        toast.style.backgroundColor = '#d1fae5';
        toast.style.color = '#065f46';
        toast.style.border = '1px solid #34d399';
    }
    
    toast.style.opacity = '1';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

function mostrarErrorAbajo(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    campo.style.borderColor = '#dc2626';

    let errorTexto = campo.parentNode.querySelector('.texto-error-inline');
    if (!errorTexto) {
        errorTexto = document.createElement('div');
        errorTexto.className = 'texto-error-inline';
        errorTexto.style.color = '#dc2626';
        errorTexto.style.fontSize = '0.8rem';
        errorTexto.style.marginTop = '4px';
        errorTexto.style.fontWeight = '500';
        campo.parentNode.appendChild(errorTexto);
    }
    errorTexto.textContent = mensaje;
}

function limpiarErroresFormularios() {
    document.querySelectorAll('.texto-error-inline').forEach(el => el.remove());
    document.querySelectorAll('input').forEach(input => {
        input.style.borderColor = '';
    });
}

function cargarUsuariosRegistrados() {
    const contenedorTabla = document.getElementById("tabla-usuarios-registrados");
    if (!contenedorTabla) return;

    let usuarios = JSON.parse(localStorage.getItem("dandelion_usuarios")) || [];
    if (usuarios.length === 0) {
        contenedorTabla.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--texto-suave);">No hay clientes registrados aún.</td></tr>`;
        return;
    }

    contenedorTabla.innerHTML = "";
    usuarios.forEach((u, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>#USR-10${index + 1}</td>
            <td><strong>${u.nombre}</strong></td>
            <td>${u.email}</td>
            <td>${u.fechaRegistro || "Reciente"}</td>
        `;
        contenedorTabla.appendChild(fila);
    });
}

function cargarPedidosUsuario() {
    const cuerpoTabla = document.getElementById("cuerpo-tabla-pedidos-usuario");
    if (!cuerpoTabla) return;

    let sesionActiva = JSON.parse(localStorage.getItem("dandelion_sesion_activa"));
    if (!sesionActiva) return;

    let listaPedidos = JSON.parse(localStorage.getItem('dandelion_pedidos')) || [];
    let misPedidos = listaPedidos.filter(p => p.clienteEmail.toLowerCase() === sesionActiva.email.toLowerCase());

    if (misPedidos.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--texto-suave);">Aún no tienes reservas registradas. ¡Envía tu solicitud desde el carrito!</td></tr>`;
        return;
    }

    cuerpoTabla.innerHTML = "";
    misPedidos.forEach(pedido => {
        let detalleProductos = pedido.productos.map(p => `${p.nombre || p.name} ($${p.precio})`).join(', ');
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><strong>${pedido.id}</strong></td>
            <td>${detalleProductos}</td>
            <td>$${pedido.totalEstimado}</td>
            <td style="color: #d97706; font-weight: bold;">${pedido.estado}</td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

function cargarPedidosAdmin() {
    const contenedorAdmin = document.getElementById("tabla-pedidos-admin");
    if (!contenedorAdmin) return;

    let listaPedidos = JSON.parse(localStorage.getItem('dandelion_pedidos')) || [];
    if (listaPedidos.length === 0) {
        contenedorAdmin.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--texto-suave);">No hay reservas pendientes de clientes.</td></tr>`;
        return;
    }

    contenedorAdmin.innerHTML = "";
    listaPedidos.forEach(pedido => {
        let detalleProductos = pedido.productos.map(p => `• ${p.nombre || p.name} ($${p.precio})`).join('<br>');
        let esResuelto = pedido.estado.includes("Resuelto");
        let colorEstado = esResuelto ? "#047857" : "#b45309";
        let bgEstado = esResuelto ? "#d1fae5" : "#fef3c7";

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td><strong>${pedido.id}</strong><br><small style="color: #666;">${pedido.codigoCliente || "#USR-VIP"}</small></td>
            <td><strong>${pedido.clienteNombre}</strong><br><small style="color: #666;">${pedido.clienteEmail}</small></td>
            <td>${detalleProductos}</td>
            <td>$${pedido.totalEstimado}</td>
            <td>${pedido.fecha}</td>
            <td><span style="background: ${bgEstado}; color: ${colorEstado}; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.85rem;">${pedido.estado}</span></td>
            <td></td>
        `;

        const celdaAccion = fila.querySelector("td:last-child");
        const btnAccion = document.createElement("button");
        btnAccion.className = "btn-cambiar-stock";
        btnAccion.style.padding = "6px 12px";
        btnAccion.style.fontSize = "0.8rem";
        btnAccion.style.cursor = "pointer";
        btnAccion.textContent = "Cambiar Estado";
        
        btnAccion.addEventListener("click", () => {
            cambiarEstadoPedido(pedido.id);
        });

        celdaAccion.appendChild(btnAccion);
        contenedorAdmin.appendChild(fila);
    });
}

function cambiarEstadoPedido(idPedido) {
    let listaPedidos = JSON.parse(localStorage.getItem('dandelion_pedidos')) || [];
    let pedido = listaPedidos.find(p => p.id === idPedido);
    if (!pedido) return;

    if (pedido.estado.includes("Pendiente")) {
        pedido.estado = "✅ Resuelto / Contactado";
    } else {
        pedido.estado = "Pendiente de contacto (24 hrs)";
    }

    localStorage.setItem('dandelion_pedidos', JSON.stringify(listaPedidos));
    cargarPedidosAdmin();
    mostrarMensajeFlotante(`El estado del pedido ${pedido.id} se actualizó a: "${pedido.estado}".`, "exito");
}

function cambiarEstadoStock(idProducto) {
    const badge = document.getElementById(`badge-${idProducto}`);
    if (!badge) return;

    if (badge.classList.contains("disponible")) {
        badge.classList.remove("disponible");
        badge.classList.add("agotado");
        badge.textContent = "🔴 Agotado";
        mostrarMensajeFlotante("Estado actualizado: AGOTADO", "exito");
    } else {
        badge.classList.remove("agotado");
        badge.classList.add("disponible");
        badge.textContent = "🟢 En Stock";
        mostrarMensajeFlotante("Estado actualizado: EN STOCK", "exito");
    }
}

// --- GESTIÓN DE CARRITO INDEPENDIENTE Y PROCESAMIENTO DE RESERVAS ---

function filtrarCatalogo() {
    const buscador = document.getElementById('input-buscador');
    if (!buscador) return;
    let input = buscador.value.toLowerCase();
    let categorias = document.querySelectorAll('.seccion-categoria');

    categorias.forEach(cat => {
        let keywords = cat.getAttribute('data-categoria') || "";
        let tituloElem = cat.querySelector('.titulo-categoria');
        let titulo = tituloElem ? tituloElem.textContent.toLowerCase() : "";
        
        if (keywords.includes(input) || titulo.includes(input) || input === "") {
            cat.style.display = "block";
        } else {
            cat.style.display = "none";
        }
    });
}

function obtenerClaveCarritoUsuario() {
    let sesionActiva = JSON.parse(localStorage.getItem('dandelion_sesion_activa'));
    if (sesionActiva && sesionActiva.email) {
        return 'dandelion_cart_' + sesionActiva.email.toLowerCase();
    }
    return 'dandelion_cart_invitado';
}

function agregarAlCarrito(nombre, precio) {
    let sesionActiva = localStorage.getItem('dandelion_sesion_activa');
    if (!sesionActiva) {
        mostrarMensajeFlotante("⚠️ Debes iniciar sesión para añadir productos al carrito.", "error");
        setTimeout(() => { window.location.href = "login.html"; }, 1200);
        return;
    }

    let claveCarrito = obtenerClaveCarritoUsuario();
    let carritoUser = JSON.parse(localStorage.getItem(claveCarrito)) || [];

    carritoUser.push({ nombre: nombre, precio: precio });
    localStorage.setItem(claveCarrito, JSON.stringify(carritoUser));
    actualizarContadorCarrito();
    mostrarMensajeFlotante(`¡${nombre} ($${precio}) se añadió a tus compras pendientes! 🛒`, "exito");
}

function verCarrito() {
    let sesionActiva = JSON.parse(localStorage.getItem('dandelion_sesion_activa'));
    if (!sesionActiva) {
        window.location.href = "login.html";
        return;
    }

    if (sesionActiva.esAdmin) {
        window.location.href = "admin.html";
    } else {
        procesarReserva();
    }
}

function procesarReserva() {
    let sesionActiva = JSON.parse(localStorage.getItem('dandelion_sesion_activa'));

    if (!sesionActiva) {
        mostrarMensajeFlotante("⚠️ Debes iniciar sesión para realizar una reserva.", "error");
        setTimeout(() => { window.location.href = "login.html"; }, 1200);
        return;
    }

    let claveCarrito = obtenerClaveCarritoUsuario();
    let carritoActual = JSON.parse(localStorage.getItem(claveCarrito)) || [];

    if (carritoActual.length === 0) {
        mostrarMensajeFlotante("🛒 Tu carrito está vacío. Agrega flores del catálogo antes de enviar tu solicitud.", "error");
        setTimeout(() => { window.location.href = "servicios.html"; }, 1200);
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem("dandelion_usuarios")) || [];
    let indexCliente = usuarios.findIndex(u => u.email.toLowerCase() === sesionActiva.email.toLowerCase());
    let codigoUsuario = indexCliente !== -1 ? `#USR-10${indexCliente + 1}` : "#USR-VIP";

    let totalPagar = carritoActual.reduce((sum, item) => sum + Number(item.precio), 0);

    const nuevaReserva = {
        id: "RES-" + Math.floor(1000 + Math.random() * 9000),
        codigoCliente: codigoUsuario,
        clienteNombre: sesionActiva.nombre,
        clienteEmail: sesionActiva.email,
        productos: carritoActual,
        totalEstimado: totalPagar,
        fecha: new Date().toLocaleDateString("es-CL") + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        estado: "Pendiente de contacto (24 hrs)"
    };

    let listaPedidos = JSON.parse(localStorage.getItem('dandelion_pedidos')) || [];
    listaPedidos.push(nuevaReserva);
    localStorage.setItem('dandelion_pedidos', JSON.stringify(listaPedidos));

    localStorage.removeItem(claveCarrito);
    actualizarContadorCarrito();

    mostrarMensajeFlotante(`🌸 ¡Reserva enviada con éxito, ${sesionActiva.nombre} (${codigoUsuario})! Nos pondremos en contacto en menos de 24 horas.`, "exito");
    setTimeout(() => {
        window.location.href = "usuario.html";
    }, 1500);
}

function actualizarContadorCarrito() {
    let contador = document.getElementById('cart-count');
    if (contador) {
        let sesionActiva = JSON.parse(localStorage.getItem('dandelion_sesion_activa'));
        if (!sesionActiva) {
            contador.textContent = "0";
            return;
        }
        let claveCarrito = obtenerClaveCarritoUsuario();
        let carritoUser = JSON.parse(localStorage.getItem(claveCarrito)) || [];
        contador.textContent = carritoUser.length;
    }
}

// --- ACTUALIZAR MENÚ DE NAVEGACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    const sesionActiva = JSON.parse(localStorage.getItem("dandelion_sesion_activa"));
    const navLinks = document.querySelectorAll("header nav a");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && (href.includes("login") || href.includes("usuario") || href.includes("admin"))) {
            if (sesionActiva) {
                if (sesionActiva.esAdmin) {
                    link.textContent = "Panel Admin";
                    link.setAttribute("href", "admin.html");
                } else {
                    link.textContent = "Mi Panel";
                    link.setAttribute("href", "usuario.html");
                }
            } else {
                link.textContent = "Mi Cuenta";
                link.setAttribute("href", "login.html");
            }
        }
    });
});

// --- TRABAJADORES Y MAPA ---
const trabajadores = [
    {
        nombre: "Jesús De N.",
        rol: "Gerente General - Administración y Finanzas",
        foto: "IMG/jesucristo-de-nazaret-29512988.webp",
        descripcion: "Líder del proyecto encargado de la gestión estratégica, administración de recursos y control financiero de Dandelion.",
        tareas: [
            "<strong>Gestión General:</strong> Supervisión global de las operaciones y planificación estratégica de la empresa.",
            "<strong>Administración & Finanzas:</strong> Control de presupuesto, costos de producción y proyecciones financieras."
        ]
    },
    {
        nombre: "Andy Chou.",
        rol: "Tecnología y Compras - Desarrollador Web",
        foto: "IMG/Andy.jpeg",
        descripcion: "Encargado del desarrollo técnico de la plataforma web, infraestructura tecnológica y gestión de insumos.",
        tareas: [
            "<strong>Maquetación HTML5 & CSS3:</strong> Maquetado y diseño estructurado adaptado al proyecto.",
            "<strong>Programación JavaScript (JS):</strong> Creación del catálogo dinámico, renderizado del equipo, carrito interactivo y manipulación del DOM.",
            "<strong>Módulo Finanzas & LocalStorage:</strong> Programación de estimación de costos y almacenamiento local de cotizaciones.",
            "<strong>Gestión de Compras:</strong> Adquisición de materiales de tecnología, insumos y componentes imantados."
        ]
    },
    {
        nombre: "Miguel S.",
        rol: "Producción y Calidad",
        foto: "IMG/Miguel.jpeg",
        descripcion: "Responsable del proceso de fabricación, acabado artesanal y control de calidad de las flores imantadas.",
        tareas: [
            "<strong>Ensamblaje Magnético:</strong> Supervisión del montaje de imanes y prueba de adherencia en los pétalos.",
            "<strong>Control de Calidad:</strong> Inspección detallada de acabados y durabilidad antes del empaque final."
        ]
    },
    {
        nombre: "Kevin H.",
        rol: "Diseño y Marca - Redes y Video",
        foto: "IMG/Kevin.jpg",
        descripcion: "Encargado de la identidad visual de la marca, creación de contenido multimedia y gestión de redes sociales.",
        tareas: [
            "<strong>Diseño de Marca:</strong> Elaboración de piezas gráficas y estilo visual para Dandelion.",
            "<strong>Redes Social & Video:</strong> Producción y edición de contenido audiovisual para campañas digitales."
        ]
    },
    {
        nombre: "Diego U.",
        rol: "Marketing y Ventas",
        foto: "IMG/Diego.jpeg",
        descripcion: "Especialista encargado de las estrategias comerciales, captación de clientes y canales de venta.",
        tareas: [
            "<strong>Estrategia Comercial:</strong> Planificación de campañas publicitaria y promoción de productos imantados.",
            "<strong>Atención y Ventas:</strong> Asesoría a clientes y gestión de canal de pedidos directos."
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.getElementById("contenedor-trabajadores");
    if (contenedor) {
        contenedor.innerHTML = "";
        trabajadores.forEach(trabajador => {
            const card = document.createElement("div");
            card.classList.add("tarjeta-integrante");
            const listaTareas = trabajador.tareas.map(tarea => `<li>${tarea}</li>`).join("");
            card.innerHTML = `
                <img class="perfil_img" src="${trabajador.foto}" alt="Foto de ${trabajador.nombre}">
                <div class="perfil-info">
                    <h3>${trabajador.nombre}</h3>
                    <p class="rol">${trabajador.rol}</p>
                    <p>${trabajador.descripcion}</p>
                    <ul>${listaTareas}</ul>
                </div>
            `;
            contenedor.appendChild(card);
        });
    }
});

function inicializarMapa() {
    const contenedorMapa = document.getElementById('mapa-cobertura');
    if (!contenedorMapa) return;

    const map = L.map('mapa-cobertura').setView([-33.4912, -70.7135], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd'
    }).addTo(map);

    L.marker([-33.4912, -70.7135]).addTo(map)
        .bindPopup('<b>Dandelion</b><br>Zona de Cobertura y Despachos en Santiago.')
        .openPopup();
}

document.addEventListener('DOMContentLoaded', inicializarMapa);