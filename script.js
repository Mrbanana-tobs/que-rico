
const contenedor = document.getElementById("productos");

async function mostrarCatalogo() {
    contenedor.innerHTML = "Cargando productos...";

    const { data: productos, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

    if (error) {
        contenedor.textContent = "No se pudieron cargar los productos.";
        console.error(error);
        return;
    }

    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.textContent = "Próximamente tendremos nuevos productos.";
        return;
    }

    productos.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "product-card";

        const foto = document.createElement("img");
        foto.src = producto.image_url || "";
        foto.alt = producto.name;

        const titulo = document.createElement("h3");
        titulo.textContent = producto.name;

        const categoria = document.createElement("p");
        categoria.textContent = producto.category;

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.description || "";

        const precio = document.createElement("strong");
        precio.textContent = "$" + producto.price.toLocaleString("es-AR");

        const boton = document.createElement("a");
        boton.textContent = "Consultar por WhatsApp";
        boton.className = "whatsapp-button";
        boton.href = "https://wa.me/TUNUMERO?text=" +
            encodeURIComponent("Hola! Quiero consultar por " + producto.name);
        boton.target = "_blank";

        tarjeta.append(foto, titulo, categoria, descripcion, precio, boton);
        contenedor.appendChild(tarjeta);
    });
}

// Cargar catálogo al entrar
mostrarCatalogo();

// Actualizar automáticamente cuando cambien los productos
supabaseClient
    .channel("cambios-productos")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "products"
        },
        () => {
            mostrarCatalogo();
        }
    )
    .subscribe();
