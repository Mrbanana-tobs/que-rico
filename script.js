
// OBTENER PRODUCTOS GUARDADOS
const productos = JSON.parse(localStorage.getItem("productos")) || [];

const contenedor = document.getElementById("productos");

// MOSTRAR PRODUCTOS
function mostrarCatalogo() {
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.textContent = "Próximamente tendremos nuevos productos.";
        return;
    }

    productos.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "product-card";

        const foto = document.createElement("img");
        foto.src = producto.imagen || "";
        foto.alt = producto.nombre;

        const titulo = document.createElement("h3");
        titulo.textContent = producto.nombre;

        const categoria = document.createElement("p");
        categoria.textContent = producto.categoria;

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.descripcion;

        const precio = document.createElement("strong");
        precio.textContent = "$" + producto.precio.toLocaleString("es-AR");

        const boton = document.createElement("a");
        boton.textContent = "Consultar por WhatsApp";
        boton.className = "whatsapp-button";

        boton.href = "https://wa.me/TUNUMERO?text=" +
            encodeURIComponent("Hola! Quiero consultar por " + producto.nombre);

        boton.target = "_blank";

        tarjeta.append(
            foto,
            titulo,
            categoria,
            descripcion,
            precio,
            boton
        );

        contenedor.appendChild(tarjeta);
    });
}

mostrarCatalogo();
