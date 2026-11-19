
// PRODUCTOS GUARDADOS
let productos = JSON.parse(localStorage.getItem("productos")) || [];

let productoEditando = null;

// ELEMENTOS DEL FORMULARIO
const formulario = document.getElementById("product-form");
const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const categoria = document.getElementById("categoria");
const descripcion = document.getElementById("descripcion");
const imagen = document.getElementById("imagen");

const listaProductos = document.getElementById("admin-product-list");
const tituloFormulario = document.getElementById("form-title");
const botonGuardar = document.getElementById("save-button");
const botonCancelar = document.getElementById("cancel-button");

// GUARDAR PRODUCTOS
function guardarProductos() {
    localStorage.setItem("productos", JSON.stringify(productos));
}

// MOSTRAR PRODUCTOS
function mostrarProductos() {
    listaProductos.innerHTML = "";

    if (productos.length === 0) {
        listaProductos.innerHTML = "<p>Todavía no hay productos cargados.</p>";
        return;
    }

    productos.forEach((producto, indice) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "admin-card";

        tarjeta.innerHTML = `
            <img src="${producto.imagen || ''}" alt="Producto">
            <h3></h3>
            <p></p>
            <p></p>
            <button class="main-button" data-editar="${indice}">Editar</button>
            <button class="delete-button" data-eliminar="${indice}">Eliminar</button>
        `;

        tarjeta.querySelector("h3").textContent = producto.nombre;
        tarjeta.querySelectorAll("p")[0].textContent = producto.categoria;
        tarjeta.querySelectorAll("p")[1].textContent =
            "$" + producto.precio.toLocaleString("es-AR");

        listaProductos.appendChild(tarjeta);
    });
}

// AGREGAR O EDITAR PRODUCTO
formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const archivo = imagen.files[0];

    function completarGuardado(foto) {
        const producto = {
            nombre: nombre.value.trim(),
            precio: Number(precio.value),
            categoria: categoria.value,
            descripcion: descripcion.value.trim(),
            imagen: foto
        };

        if (productoEditando !== null) {
            productos[productoEditando] = producto;
        } else {
            productos.push(producto);
        }

        guardarProductos();
        mostrarProductos();
        formulario.reset();
        cancelarEdicion();
    }

    if (archivo) {
        if (!archivo.type.startsWith("image/")) {
            alert("Seleccioná una imagen válida.");
            return;
        }

        if (archivo.size > 2 * 1024 * 1024) {
            alert("La imagen debe pesar menos de 2 MB.");
            return;
        }

        const lector = new FileReader();

        lector.onload = function() {
            completarGuardado(lector.result);
        };

        lector.onerror = function() {
            alert("No se pudo leer la imagen.");
        };

        lector.readAsDataURL(archivo);

    } else if (productoEditando !== null) {
        completarGuardado(productos[productoEditando].imagen);
    } else {
        completarGuardado("");
    }
});

// EDITAR Y ELIMINAR
listaProductos.addEventListener("click", function(evento) {

    const indiceEditar = evento.target.dataset.editar;
    const indiceEliminar = evento.target.dataset.eliminar;

    if (indiceEditar !== undefined) {
        const producto = productos[Number(indiceEditar)];

        productoEditando = Number(indiceEditar);

        nombre.value = producto.nombre;
        precio.value = producto.precio;
        categoria.value = producto.categoria;
        descripcion.value = producto.descripcion;

        tituloFormulario.textContent = "Editar producto";
        botonGuardar.textContent = "Guardar cambios";
        botonCancelar.hidden = false;

        window.scrollTo(0, 0);
    }

    if (indiceEliminar !== undefined) {
        const confirmar = confirm("¿Querés eliminar este producto?");

        if (confirmar) {
            productos.splice(Number(indiceEliminar), 1);

            guardarProductos();
            mostrarProductos();
        }
    }
});

// CANCELAR EDICIÓN
function cancelarEdicion() {
    productoEditando = null;

    formulario.reset();

    tituloFormulario.textContent = "Agregar nuevo producto";
    botonGuardar.textContent = "Agregar producto";
    botonCancelar.hidden = true;
}

botonCancelar.addEventListener("click", cancelarEdicion);

// INICIAR PANEL
mostrarProductos();
