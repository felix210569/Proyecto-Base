<?php
/**
 * Buscador de Bienes Raíces (Backend)
 * Procesa peticiones POST filtrando por Ciudad, Tipo y Rango de Precio.
 */

// 1. Interceptar variables POST
$ciudad = isset($_POST['ciudad']) ? trim($_POST['ciudad']) : '';
$tipo = isset($_POST['tipo']) ? trim($_POST['tipo']) : '';
// 2. Descomponer el parámetro precio ("min;max") utilizando explode()
$precio = isset($_POST['precio']) && trim($_POST['precio']) !== '' ? trim($_POST['precio']) : '0;100000';
$rangoPrecio = explode(';', $precio);
$precioMin = (isset($rangoPrecio[0]) && is_numeric($rangoPrecio[0])) ? (int)$rangoPrecio[0] : 0;
$precioMax = (isset($rangoPrecio[1]) && is_numeric($rangoPrecio[1])) ? (int)$rangoPrecio[1] : 100000;

// 3. Cargar y decodificar data-1.json
$jsonPath = __DIR__ . '/data-1.json';
if (!file_exists($jsonPath)) {
    echo '<div class="card-panel red white-text">No se pudo encontrar el archivo data-1.json.</div>';
    exit;
}

$jsonData = file_get_contents($jsonPath);
$inmuebles = json_decode($jsonData, true);

if (!is_array($inmuebles)) {
    echo '<div class="card-panel red white-text">Error al procesar los datos de los inmuebles.</div>';
    exit;
}

$htmlResultados = '';

// 4. Iterar sobre los registros y evaluar condiciones concurrentes
foreach ($inmuebles as $item) {
    // Limpieza de datos en la clave Precio: eliminar '$' y ',', convertir a entero
    $precioLimpio = (int) str_replace(['$', ','], '', $item['Precio']);

    // Condición 1: Rango de precio
    $cumplePrecio = ($precioLimpio >= $precioMin && $precioLimpio <= $precioMax);

    // Condición 2: Filtro por Ciudad (si no está vacío)
    $cumpleCiudad = ($ciudad === '') || ($item['Ciudad'] === $ciudad);

    // Condición 3: Filtro por Tipo (si no está vacío)
    $cumpleTipo = ($tipo === '') || ($item['Tipo'] === $tipo);

    // Si cumple las tres condiciones concurrentes, compilar tarjeta HTML
    if ($cumplePrecio && $cumpleCiudad && $cumpleTipo) {
        $htmlResultados .= '
        <div class="card itemMostrado">
          <img src="img/home.jpg" alt="Foto Inmueble">
          <div class="card-stacked">
            <div class="card-content">
              <p><b>Direccion: </b>' . htmlspecialchars($item['Direccion']) . '</p>
              <p><b>Ciudad: </b>' . htmlspecialchars($item['Ciudad']) . '</p>
              <p><b>Telefono: </b>' . htmlspecialchars($item['Telefono']) . '</p>
              <p><b>Codigo Postal: </b>' . htmlspecialchars($item['Codigo_Postal']) . '</p>
              <p><b>Tipo: </b>' . htmlspecialchars($item['Tipo']) . '</p>
              <p><b>Precio: </b><span class="precioTexto">' . htmlspecialchars($item['Precio']) . '</span></p>
            </div>
            <div class="card-action">
              <a href="#">VER MAS</a>
            </div>
          </div>
        </div>';
    }
}

// 5. Imprimir el HTML resultante
echo $htmlResultados;
?>
