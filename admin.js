
const loginContainer = document.getElementById("login-container");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const productForm = document.getElementById("product-form");
const productFormSection = productForm.closest(".admin-form");
const productsSection = document.getElementById("admin-product-list").closest(".admin-products");

const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const categoria = document.getElementById("categoria");
const descripcion = document.getElementById("descripcion");
const imagen = document.getElementById("imagen");
const productList = document.getElementById("admin-product-list");
const formTitle = document.getElementById("form-title");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");

let productoEditando = null;
let imagenActual = null;

function mostrarPanel(visible) {
    loginContainer.hidden = visible;
    productFormSection.hidden = !visible;
    productsSection.hidden = !visible;
}

async function iniciarPanel() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        mostrarPanel(true);
        cargarProductos();
        agregarBotonCerrarSesion();
    } else {
        mostrarPanel(false);
    }
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    loginMessage.textContent = "Ingresando...";

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        loginMessage.textContent = "Correo o contraseña incorrectos.";
        console.error(error);
        return;
    }

    loginMessage.textContent = "";
    mostrarPanel(true);
    cargarProductos();
    agregarBotonCerrarSesion();
});

function agregarBotonCerrarSesion() {
    if (document.getElementById("logout-button")) return;

    const boton = document.createElement("button");
    boton.id = "logout-button";
    boton.textContent = "Cerrar sesión";
    boton.type = "button";
    boton.style.margin = "20px";

    productFormSection.before(boton);

    boton.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        location.reload();
    });
}

async function cargarProductos() {
    productList.textContent = "Cargando productos...";

    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        productList.textContent = "No se pudieron cargar los productos.";
        console.error(error);
        return;
    }

    productList.innerHTML = "";

    data.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "admin-card";

        const foto = document.createElement("img");
        foto.src = producto.image_url || "";
        foto.alt = producto.name;

        const titulo = document.createElement("h3");
        titulo.textContent = producto.name;

        const valor = document.createElement("p");
        valor.textContent = "$" + producto.price.toLocaleString("es-AR");

        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Editar";
        botonEditar.type = "button";
        botonEditar.dataset.action = "edit";
        botonEditar.dataset.id = producto.id;

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.type = "button";
        botonEliminar.className = "delete-button";
        botonEliminar.dataset.action = "delete";
        botonEliminar.dataset.id = producto.id;

        tarjeta.append(foto, titulo, valor, botonEditar, botonEliminar);
        productList.appendChild(tarjeta);
    });
}

async function subirImagen(archivo) {
    const extension = archivo.name.split(".").pop();
    const nombreArchivo = `${crypto.randomUUID()}.${extension}`;
    const ruta = `${nombreArchivo}`;

    const { error } = await supabaseClient.storage
        .from("productos")
        .upload(ruta, archivo, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) throw error;

    const { data } = supabaseClient.storage
        .from("productos")
        .getPublicUrl(ruta);

    return data.publicUrl;
}

productForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    saveButton.disabled = true;
    saveButton.textContent = "Guardando...";

    try {
        let imageUrl = imagenActual;

        if (imagen.files.length > 0) {
            const archivo = imagen.files[0];

            if (archivo.size > 2 * 1024 * 1024) {
                alert("La imagen no puede superar los 2 MB.");
                return;
            }

            imageUrl = await subirImagen(archivo);
        }

        const producto = {
            name: nombre.value.trim(),
            price: Number(precio.value),
            category: categoria.value,
            description: descripcion.value.trim(),
            image_url: imageUrl,
            active: true
        };

        let resultado;

        if (productoEditando) {
            resultado = await supabaseClient
                .from("products")
                .update(producto)
                .eq("id", productoEditando);
        } else {
            resultado = await supabaseClient
                .from("products")
                .insert([producto]);
        }

        if (resultado.error) throw resultado.error;

        alert("Producto guardado correctamente.");
        limpiarFormulario();
        cargarProductos();

    } catch (error) {
        console.error(error);
        alert("No se pudo guardar el producto: " + error.message);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Guardar producto";
    }
});

productList.addEventListener("click", async (e) => {
    const boton = e.target.closest("button[data-action]");
    if (!boton) return;

    const id = boton.dataset.id;

    if (boton.dataset.action === "edit") {
        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            alert("No se pudo cargar el producto.");
            return;
        }

        productoEditando = data.id;
        imagenActual = data.image_url;

        nombre.value = data.name;
        precio.value = data.price;
        categoria.value = data.category;
        descripcion.value = data.description || "";
        imagen.value = "";

        formTitle.textContent = "Editar producto";
        saveButton.textContent = "Guardar cambios";
        cancelButton.hidden = false;

        productForm.scrollIntoView({ behavior: "smooth" });
    }

    if (boton.dataset.action === "delete") {
        if (!confirm("¿Seguro que querés eliminar este producto?")) return;

        const { error } = await supabaseClient
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            alert("No se pudo eliminar el producto.");
            console.error(error);
            return;
        }

        cargarProductos();
    }
});

function limpiarFormulario() {
    productForm.reset();
    productoEditando = null;
    imagenActual = null;
    formTitle.textContent = "Agregar producto";
    saveButton.textContent = "Guardar producto";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", limpiarFormulario);

iniciarPanel();


const forgotPasswordButton = document.getElementById("forgot-password");

forgotPasswordButton.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();

    if (!email) {
        alert("Primero escribí tu correo electrónico.");
        return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: "https://mrbanana-tobs.github.io/que-rico/reset-password.html"
        }
    );

    if (error) {
        alert("No se pudo enviar el correo: " + error.message);
        return;
    }

    alert("¡Listo! Revisá tu correo para recuperar la contraseña.");
});
