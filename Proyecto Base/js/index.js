/*
  Creación de una función personalizada para jQuery que detecta cuando se detiene el scroll en la página
*/
$.fn.scrollEnd = function(callback, timeout) {
  $(this).scroll(function(){
    var $this = $(this);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback, timeout));
  });
};

/*
  Función que inicializa el elemento Slider
*/
function inicializarSlider(){
  $("#rangoPrecio").ionRangeSlider({
    type: "double",
    grid: false,
    min: 0,
    max: 100000,
    from: 200,
    to: 80000,
    prefix: "$"
  });
}

/*
  Función que reproduce el video de fondo al hacer scroll, y detiene la reproducción al detener el scroll
*/
function playVideoOnScroll(){
  var ultimoScroll = 0;
  var video = document.getElementById('vidFondo');
  if (!video) return;

  $(window)
    .scroll(function(event){
      var scrollActual = $(window).scrollTop();
      try {
        var playPromise = video.play();
        if (playPromise !== undefined && playPromise.catch) {
          playPromise.catch(function() {});
        }
      } catch(e) {}
      ultimoScroll = scrollActual;
    })
    .scrollEnd(function(){
      try {
        video.pause();
      } catch(e) {}
    }, 10);
}

/*
  1. Poblar Listas Desplegables (Frontend - js/index.js)
  Petición AJAX GET al cargar el DOM para leer data-1.json,
  extraer valores únicos para Ciudad y Tipo, inyectar <option> y
  ejecutar $('select').material_select().
*/
function poblarSelects(){
  $.ajax({
    url: 'data-1.json',
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      var ciudades = [];
      var tipos = [];

      $.each(data, function(index, item) {
        if (item.Ciudad && ciudades.indexOf(item.Ciudad) === -1) {
          ciudades.push(item.Ciudad);
        }
        if (item.Tipo && tipos.indexOf(item.Tipo) === -1) {
          tipos.push(item.Tipo);
        }
      });

      // Ordenar alfabéticamente
      ciudades.sort();
      tipos.sort();

      // Inyectar opciones en #selectCiudad
      $.each(ciudades, function(index, ciudad) {
        $('#selectCiudad').append(
          $('<option></option>').attr('value', ciudad).text(ciudad)
        );
      });

      // Inyectar opciones en #selectTipo
      $.each(tipos, function(index, tipo) {
        $('#selectTipo').append(
          $('<option></option>').attr('value', tipo).text(tipo)
        );
      });

      // Forzar el renderizado del framework Materialize CSS
      $('select').material_select();
    },
    error: function(xhr, status, error) {
      console.error('Error al cargar data-1.json:', error);
      if (window.location.protocol === 'file:') {
        mostrarAvisoProtocoloFile();
      }
    }
  });
}

/*
  Función auxiliar para inyectar tarjetas de resultados en .colContenido
  manteniendo el título y botón de cabecera intactos.
*/
function renderizarResultados(html) {
  // Eliminar resultados y avisos anteriores
  $('.colContenido > .itemMostrado').remove();
  $('.colContenido > .mensajeResultado').remove();

  if ($.trim(html) === '') {
    $('.colContenido').append(
      '<div class="card itemMostrado mensajeResultado" style="padding: 20px; text-align: center; width: 100%;">' +
        '<h5>No se encontraron inmuebles con los criterios seleccionados.</h5>' +
      '</div>'
    );
  } else {
    $('.colContenido').append(html);
  }
}

/*
  Aviso en caso de que el usuario abra index.html con doble click (file://)
  en lugar del servidor web local XAMPP (http://localhost/...)
*/
function mostrarAvisoProtocoloFile() {
  $('.colContenido > .itemMostrado').remove();
  $('.colContenido > .mensajeResultado').remove();
  $('.colContenido').append(
    '<div class="card itemMostrado mensajeResultado" style="padding: 20px; width: 100%; background-color: #fff3e0; border-left: 6px solid #ff9800;">' +
      '<h5 style="color: #e65100; margin-top: 0;">⚠️ Atención: Servidor Web Requerido</h5>' +
      '<p>Estás ejecutando el proyecto directamente desde el explorador de archivos (<code>file:///</code>). Los navegadores modernos bloquean peticiones AJAX (CORS) y no ejecutan archivos PHP en este modo.</p>' +
      '<p>Para que la búsqueda funcione correctamente, abre esta URL en tu navegador con XAMPP activo:</p>' +
      '<p><a href="http://localhost/Proyecto%20Base/index.html" class="btn" style="background-color: #648C7D;" target="_blank">Abrir en http://localhost/Proyecto Base/index.html</a></p>' +
    '</div>'
  );
}

/*
  Función para ejecutar la búsqueda filtrada
*/
function buscarInmueblesFiltrados() {
  var datosForm = $('#formulario').serialize();

  $.ajax({
    url: 'buscador.php',
    type: 'POST',
    data: datosForm,
    success: function(respuesta) {
      renderizarResultados(respuesta);
    },
    error: function(xhr, status, error) {
      console.error('Error en búsqueda filtrada:', error);
      if (window.location.protocol === 'file:') {
        mostrarAvisoProtocoloFile();
      }
    }
  });
}

/*
  Función para ejecutar la búsqueda global
*/
function buscarTodosLosInmuebles() {
  $.ajax({
    url: 'buscador.php',
    type: 'POST',
    data: {
      ciudad: '',
      tipo: '',
      precio: '0;100000'
    },
    success: function(respuesta) {
      renderizarResultados(respuesta);
    },
    error: function(xhr, status, error) {
      console.error('Error en búsqueda global:', error);
      if (window.location.protocol === 'file:') {
        mostrarAvisoProtocoloFile();
      }
    }
  });
}

/*
  3. Interceptores de Eventos (Frontend - js/index.js)
  - Búsqueda Filtrada: submit del #formulario y click en #submitButton.
  - Búsqueda Global: click en #mostrarTodos.
*/
function inicializarEventos(){
  // Búsqueda Filtrada por submit del formulario
  $('#formulario').on('submit', function(e) {
    e.preventDefault();
    buscarInmueblesFiltrados();
  });

  // Búsqueda Filtrada por click en botón Buscar
  $('#submitButton').on('click', function(e) {
    e.preventDefault();
    buscarInmueblesFiltrados();
  });

  // Búsqueda Global por click en Mostrar Todos
  $('#mostrarTodos').on('click', function(e) {
    e.preventDefault();
    buscarTodosLosInmuebles();
  });
}

// Inicialización general al cargar el DOM
$(document).ready(function() {
  inicializarSlider();
  playVideoOnScroll();
  poblarSelects();
  inicializarEventos();
});
