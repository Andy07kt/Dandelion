/* ==========================================
   SISTEMA DE AUTENTICACIÓN Y SESIÓN (DANDELION)
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Control de paneles dinámicos en login.html
    const panelLogin = document.getElementById("panel-login");
    const panelRegistro = document.getElementById("panel-registro");
    const btnIrRegistro = document.getElementById("ir-a-registro");
    const btnIrLogin = document.getElementById("ir-a-login");

    if (btnIrRegistro) {
        btnIrRegistro.addEventListener("click", (e) => {
            e.preventDefault();
            panelLogin.style.display = "none";
            panelRegistro.style.display = "block";
        });
    }

    if (btnIrLogin) {
        btnIrLogin.addEventListener("click", (e) => {
            e.preventDefault();
            panelRegistro.style.display = "none";
            panelLogin.style.display = "block";
        });
    }

    // 1. Lógica para el Formulario de Registro
    const formRegistro = document.getElementById("form-registro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre-reg").value;
            const email = document.getElementById("email-reg").value;
            const password = document.getElementById("pass-reg").value;

            // Verificar si el usuario ya existe
            let usuarios = JSON.parse(localStorage.getItem("dandelion_usuarios")) || [];
            const existe = usuarios.some(u => u.email === email);

            if (existe) {
                alert("❌ Este correo ya está registrado. Por favor, inicia sesión.");
                panelRegistro.style.display = "none";
                panelLogin.style.display = "block";
                return;
            }

            // Guardar nuevo usuario
            usuarios.push({ nombre, email, password });
            localStorage.setItem("dandelion_usuarios", JSON.stringify(usuarios));
            
            alert("¡Registro exitoso! Ahora puedes iniciar sesión con tus datos.");
            
            // Limpiar formulario y volver al panel de login
            formRegistro.reset();
            panelRegistro.style.display = "none";
            panelLogin.style.display = "block";
        });
    }

    // 2. Lógica para el Formulario de Login
    const formLogin = document.getElementById("form-login");
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("usuario").value;
            const passInput = document.getElementById("password").value;

            let usuarios = JSON.parse(localStorage.getItem("dandelion_usuarios")) || [];
            
            // Buscar si el usuario y contraseña coinciden
            const usuarioEncontrado = usuarios.find(u => u.email === emailInput && u.password === passInput);

            if (usuarioEncontrado) {
                // Guardar la sesión activa
                localStorage.setItem("dandelion_sesion_activa", JSON.stringify(usuarioEncontrado));
                alert(`¡Bienvenido de nuevo, ${usuarioEncontrado.nombre}!`);
                window.location.href = "panel_cliente.html";
            } else {
                const correoExiste = usuarios.some(u => u.email === emailInput);
                if (!correoExiste) {
                    alert("⚠️ No encontramos una cuenta con este correo. Te mostramos el panel de registro.");
                    panelLogin.style.display = "none";
                    panelRegistro.style.display = "block";
                } else {
                    alert("❌ Contraseña incorrecta. Inténtalo de nuevo.");
                }
            }
        });
    }

    // 3. Proteger y Cargar el Panel del Cliente (si estamos en panel_cliente.html)
    const panelBienvenida = document.getElementById("nombre-usuario-panel");
    if (panelBienvenida) {
        const sesionActiva = JSON.parse(localStorage.getItem("dandelion_sesion_activa"));
        
        if (!sesionActiva) {
            alert("⚠️ Debes iniciar sesión para ver esta página.");
            window.location.href = "login.html";
        } else {
            panelBienvenida.textContent = sesionActiva.nombre;
            document.getElementById("email-usuario-panel").textContent = sesionActiva.email;
        }

        // Botón de Cerrar Sesión
        const btnCerrarSesion = document.getElementById("cerrar-sesion");
        if (btnCerrarSesion) {
            btnCerrarSesion.addEventListener("click", () => {
                localStorage.removeItem("dandelion_sesion_activa");
                alert("Has cerrado sesión exitosamente.");
                window.location.href = "login.html";
            });
        }
    }
});

/* ==========================================
   RENDERIZADO DINÁMICO DE TRABAJADORES (NOSOTROS)
   ========================================== */

// Arreglo con la información del equipo real de Dandelion
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
        foto: "IMG/foto.jpeg",
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
        foto: "IMG/miguel.jpeg",
        descripcion: "Responsable del proceso de fabricación, acabado artesanal y control de calidad de las flores imantadas.",
        tareas: [
            "<strong>Ensamblaje Magnético:</strong> Supervisión del montaje de imanes y prueba de adherencia en los pétalos.",
            "<strong>Control de Calidad:</strong> Inspección detallada de acabados y durabilidad antes del empaque final."
        ]
    },
    {
        nombre: "Kalvin K.",
        rol: "Diseño y Marca - Redes y Video",
        foto: "IMG/kalvin.jpeg",
        descripcion: "Encargado de la identidad visual de la marca, creación de contenido multimedia y gestión de redes sociales.",
        tareas: [
            "<strong>Diseño de Marca:</strong> Elaboración de piezas gráficas y estilo visual para Dandelion.",
            "<strong>Redes Social & Video:</strong> Producción y edición de contenido audiovisual para campañas digitales."
        ]
    },
    {
        nombre: "Diego U.",
        rol: "Marketing y Ventas",
        foto: "IMG/diego.jpeg",
        descripcion: "Especialista encargado de las estrategias comerciales, captación de clientes y canales de venta.",
        tareas: [
            "<strong>Estrategia Comercial:</strong> Planificación de campañas publicitaria y promoción de productos imantados.",
            "<strong>Atención y Ventas:</strong> Asesoría a clientes y gestión de canal de pedidos directos."
        ]
    }
];

// Renderizado dinámico en columna con tarjetas horizontales
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
                    <ul>
                        ${listaTareas}
                    </ul>
                </div>
            `;

            contenedor.appendChild(card);
        });
    }
});