let videoElement = document.querySelector("#camara");
let botonTomarFotos = document.querySelector("#tomarFotos");
let botonBorrarFotos = document.querySelector("#borrarFotos");
let botonBorrarTodo = document.querySelector("#borrar-todo");

let galeriaDeFotos = document.querySelector("#galeria");

//Solicitar acceso a la cámara
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    videoElement.srcObject = stream;
  })
  .catch((error) => {
    alert("ERROR AL ACCEDER A LA CÁMARA" + error);
  });

//declaración del contador de fotos para generar el id y poder borrar o descargar
let contadorIdFotos = getNextPhoto();

//cuando se pulsa click en tomar foto, se genera un canvas de tipo 2d, con las coordenadas x, y de la img que se transmita
botonTomarFotos.addEventListener("click", () => {
  let canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  let contex = canvas.getContext("2d");
  //dibuja con todos los datos anteriores
  contex.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  //galeriaDeFotos.appendChild(canvas); ->solo era una prueba

  // convertir el canvas a base 64
  let dataUrl = canvas.toDataURL("image/jpeg", 0.9); // le indicamos que convierta el canvas a una imagen jpeg con la ruta que vamos a establecer con el id
  let photoID = contadorIdFotos++;
  guardarFoto({ id: photoID, dataUrl }); //clave:valor ->mapa con el id y la ruta, para guardarlo luego en el localStorage del navegador
  setNextPhoto({ contadorIdFotos }); //se pasa el valor del contador de fotos a una función que prepara para la próxima foto el contador
});

function guardarFoto(photo, isPhotoLoader = false) {
  //recibe el mapa
  //crear el contenedor por la foto
  let photoContainer = document.createElement("div");
  photoContainer.className = "photoContainer";
  photoContainer.dataset.id = photo.id;

  //crear la imagen
  let img = new Image(); //esta variable es de tipo objeto de imagen
  img.src = photo.dataUrl;
  img.className = "photo";

  //crear el contenedor para los botones
  let contenedorBotones = document.createElement("div");
  contenedorBotones.className = "botones-photo";

  //creamos el boton de eliminar
  eliminarPhoto = document.createElement("button");
  eliminarPhoto.className = "eliminar-boton";
  eliminarPhoto.textContent = "Eliminar";

  //crear el evento si pulsan click en este boton
  eliminarPhoto.addEventListener("click", () => {
    eliminar(photo.id);
  });

  //crear el boton de descargar
  let descargarPhoto = document.createElement("button");
  descargarPhoto.className = "boton-descargar";
  descargarPhoto.textContent = "Descargar";
  descargarPhoto.addEventListener("click", () => {
    descargar(photo.dataUrl,`photo-${photo.id}.jpg`);
  });

  galeriaDeFotos.appendChild(photoContainer);
  photoContainer.appendChild(img);
  photoContainer.appendChild(contenedorBotones);
  contenedorBotones.appendChild(eliminarPhoto);
  contenedorBotones.appendChild(descargarPhoto);

  //guardar la imagen en el almacenamiento local solo si no está cargado desde localStorage
  if (!isPhotoLoader) {
    let fotos = JSON.parse(localStorage.getItem("fotos")) || []; //lo lee
    fotos.push(photo);
    localStorage.setItem("fotos", JSON.stringify(fotos)); //lo escribe
  }
}

function getNextPhoto() {
  return parseInt(localStorage.getItem("contadorIDfotos")) || 0;
}

function setNextPhoto(id) {
  localStorage.setItem("contadorIDfotos", id.toString());
}

function eliminar(id) {
  //primero lo elimina de la vista
  let divEliminar = document.querySelector(`.photoContainer[data-id="${id}"]`);
  if (divEliminar) {
    galeriaDeFotos.removeChild(divEliminar);
  }

  //eliminar del localStorage, se leen todas las fotos que estan guardadas y se filtran el que sea igual al id que se busca

  let fotos = JSON.parse(localStorage.getItem("fotos")) || []; //-> || [] si en fotos no existe nada o es nulo devuelve un array vacío;
  fotos = fotos.filter((photo) => photo.id != id);
  localStorage.setItem("fotos", JSON.stringify(fotos));
}

function descargar(dataUrl, filename){
    let elemento=document.createElement("a"); //enlace tipo file
    elemento.href=dataUrl;
    elemento.download=filename;
    document.body.appendChild(elemento);
    elemento.click();

    document.body.removeChild(elemento);
}


//borrar todo

botonBorrarTodo.addEventListener("click", ()=>{
    localStorage.removeItem("fotos"); //eliminamos todo del localStorage
    while(galeriaDeFotos.firstChild){
        galeriaDeFotos.removeChild(galeriaDeFotos.firstChild);
    }
    //inicializamos el contador
    contadorIdFotos=0;
    //inicializamos el localStorage
    setNextPhoto(contadorIdFotos);
})


// Cuando guarda la página, debe guardar todas las fotos...
// Lee el localStorage y muestra las fotos que esten almacenadas
let fotosGuardadas = JSON.parse(localStorage.getItem("fotos")) || [];
fotosGuardadas.forEach((element) => {
  guardarFoto(element, true);
});
