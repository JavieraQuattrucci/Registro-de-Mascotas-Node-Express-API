
console.log("El script del Registro cargó correctamente");
const API_URL = '/mascotas';

        // Manejadores de Alertas
        function mostrarError(mensaje) {
            const errorDiv = document.getElementById('alert-error');
            errorDiv.innerText = mensaje;
            errorDiv.style.display = 'block';
            document.getElementById('alert-success').style.display = 'none';
        }

        function mostrarExito(mensaje) {
            const successDiv = document.getElementById('alert-success');
            successDiv.innerText = mensaje;
            successDiv.style.display = 'block';
            document.getElementById('alert-error').style.display = 'none';
        }

        function limpiarAlertas() {
            document.getElementById('alert-error').style.display = 'none';
            document.getElementById('alert-success').style.display = 'none';
        }

        // Renderizar la tabla de resultados
        function renderTabla(data) {
            const tbody = document.getElementById('tabla-mascotas');
            tbody.innerHTML = '';
            
            // Si viene un objeto único (caso GET por nombre), lo volvemos un arreglo
            const lista = Array.isArray(data) ? data : [data];

            if (lista.length === 0 || !lista[0]) {
                tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No hay registros encontrados.</td></tr>';
                return;
            }

            lista.forEach(mascota => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${mascota.nombre}</td><td>${mascota.rut}</td>`;
                tbody.appendChild(tr);
            });
        }

        // Capa de Captura y Manejo de Errores para las peticiones de Axios
        async function ejecutarPeticion(metodo, url, data = null) {
            limpiarAlertas();
            try {
                const config = { method: metodo, url: url };
                if (data) config.data = data;

                const response = await axios(config);
                return response.data;
            } catch (error) {
                // Captura errores de respuesta HTTP del servidor
                if (error.response && error.response.data && error.response.data.error) {
                    mostrarError(`Error: ${error.response.data.error}`);
                } else {
                    // Captura errores de conexión o caídas de servidor
                    mostrarError('Error de comunicación con el servidor. Inténtelo más tarde.');
                }
                throw error; 
            }
        }

        // 1. GET (Todas)
        async function cargarTodasLasMascotas() {
            try {
                const datos = await ejecutarPeticion('get', API_URL);
                renderTabla(datos);
            } catch (e) {}
        }

        // 2. GET (Por Nombre)
        async function buscarPorNombre() {
            const nombre = document.getElementById('search-input').value.trim();
            if(!nombre) return mostrarError('Por favor ingrese un nombre para buscar.');
            
            try {
                const dato = await ejecutarPeticion('get', `${API_URL}?nombre=${nombre}`);
                renderTabla(dato);
                mostrarExito(`Mascota "${nombre}" encontrada.`);
            } catch (e) {}
        }

        // 3. GET (Por RUT)
        async function buscarPorRut() {
            const rut = document.getElementById('search-input').value.trim();
            if(!rut) return mostrarError('Por favor ingrese un RUT para buscar.');
            
            try {
                const datos = await ejecutarPeticion('get', `${API_URL}?rut=${rut}`);
                renderTabla(datos);
                mostrarExito(`Se encontraron ${datos.length} mascotas asociadas al RUT.`);
            } catch (e) {}
        }

        // 4. POST (Insertar)
        document.getElementById('form-registro').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('reg-nombre').value.trim();
            const rut = document.getElementById('reg-rut').value.trim();

            try {
                const res = await ejecutarPeticion('post', API_URL, { nombre, rut });
                mostrarExito(res.mensaje);
                document.getElementById('form-registro').reset();
                cargarTodasLasMascotas(); // Recargar la lista
            } catch (e) {}
        });

        // 5. DELETE (Por Nombre)
        async function eliminarPorNombre() {
            const nombre = document.getElementById('search-input').value.trim();
            if(!nombre) return mostrarError('Por favor ingrese un nombre para eliminar.');

            if(confirm(`¿Está seguro de que desea eliminar a la mascota ${nombre}?`)) {
                try {
                    const res = await ejecutarPeticion('delete', `${API_URL}?nombre=${nombre}`);
                    mostrarExito(res.mensaje);
                    cargarTodasLasMascotas();
                } catch (e) {}
            }
        }

        // 6. DELETE (Por RUT)
        async function eliminarPorRut() {
            const rut = document.getElementById('search-input').value.trim();
            if(!rut) return mostrarError('Por favor ingrese un RUT para eliminar.');

            if(confirm(`¿Está seguro de que desea eliminar TODAS las mascotas del RUT ${rut}?`)) {
                try {
                    const res = await ejecutarPeticion('delete', `${API_URL}?rut=${rut}`);
                    mostrarExito(res.mensaje);
                    cargarTodasLasMascotas();
                } catch (e) {}
            }
        }
        window.onload = cargarTodasLasMascotas;

        (function() {
  // Inspiration:
  // http://coolcarousels.frebsite.nl/c/59/
  // & 
  // https://css-tricks.com/slider-with-sliding-backgrounds/
  var $left_arrow, $right_arrow, animate_next, animate_previous;

  $right_arrow = $('#right-arrow');

  $left_arrow = $('#left-arrow');

  $right_arrow.click(function(e) {
    e.preventDefault();
    $('.slide-holder').velocity('finish'); // finish any current animations
    animate_next('#slide-right');
    animate_next('#slide-center', 175);
    return animate_next('#slide-left', 350);
  });

  $left_arrow.click(function(e) {
    e.preventDefault();
    $('.slide-holder').velocity('finish'); // finish any current animations
    animate_previous('#slide-left');
    animate_previous('#slide-center', 175);
    return animate_previous('#slide-right', 350);
  });

  animate_next = function(selector, delay = 0, cb = null) {
    return setTimeout(function() {
      var $bg_curr, $bg_next, $bg_prev, $el;
      $el = $(`${selector} .slide-holder`);
      $bg_prev = $el.find('.bg-previous');
      $bg_curr = $el.find('.bg-current');
      $bg_next = $el.find('.bg-next');
      $.Velocity.hook($el, "translateX", `-${100 / 3}%`);
      return $.Velocity.animate($el, { // animate the transform
        translateX: `-${200 / 3}%`,
        duration: 350
      }).then(function(elms) { // reorder the slide-bg's and recenter the slide-holder
        var next_bg_image;
        next_bg_image = $.Velocity.hook($bg_prev, "background-image");
        $.Velocity.hook($bg_prev, "background-image", $.Velocity.hook($bg_curr, "background-image"));
        $.Velocity.hook($bg_curr, "background-image", $.Velocity.hook($bg_next, "background-image"));
        $.Velocity.hook($el, "translateX", `-${100 / 3}%`);
        $.Velocity.hook($bg_next, "background-image", next_bg_image);
        if (typeof cb === 'function') {
          return cb(elms);
        }
      });
    }, delay);
  };

  animate_previous = function(selector, delay, cb) {
    return setTimeout(function() {
      var $bg_curr, $bg_next, $bg_prev, $el;
      $el = $(`${selector} .slide-holder`);
      $bg_prev = $el.find('.bg-previous');
      $bg_curr = $el.find('.bg-current');
      $bg_next = $el.find('.bg-next');
      $.Velocity.hook($el, "translateX", `-${100 / 3}%`);
      return $.Velocity.animate($el, { // animate the transform
        translateX: "0",
        duration: 350
      }).then(function(elms) { // reorder the slide-bg's and recenter the slide-holder
        var prev_bg_image;
        prev_bg_image = $.Velocity.hook($bg_next, "background-image");
        $.Velocity.hook($bg_next, "background-image", $.Velocity.hook($bg_curr, "background-image"));
        $.Velocity.hook($bg_curr, "background-image", $.Velocity.hook($bg_prev, "background-image"));
        $.Velocity.hook($el, "translateX", `-${100 / 3}%`);
        $.Velocity.hook($bg_prev, "background-image", prev_bg_image);
        if (typeof cb === 'function') {
          return cb(elms);
        }
      });
    }, delay);
  };

}).call(this);