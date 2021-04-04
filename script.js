'use strict';

const form = document.querySelector('.form');
const formInputs = document.querySelectorAll('.form__input');
const form_btn_submit = document.querySelector('.form__btn-submit');
const form_btn_cancel = document.querySelector('.form__btn-cancel');
const formelev = document.querySelector('.elev');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//* variable hold the map
let mymap;
let pinPoint;
let markers = {};
let markerTotal = 0;
let currentLat, currentLng;
const currentPosMsj = '1You are here';
/*-----------------------------------------------------------------------------------*/
/* marker Popup options
/*-----------------------------------------------------------------------------------*/

//pop options
const myIcon = L.icon({
  iconUrl: 'icon.png',
  iconSize: [60, 53],
  iconAnchor: [60, 53],
  popupAnchor: [-30, -50],
  shadowUrl: 'icon-shadow.png',
  shadowSize: [60, 53],
  shadowAnchor: [60, 54],
});
// Pop options generic
const optionsPop = {
  maxWidth: 250,
  minWidth: 200,
  autoClose: false,
  keyboard: false,
};

/*-----------------------------------------------------------------------------------*/
/*  handle Markets
/*-----------------------------------------------------------------------------------*/
//por cada marker en markers pongalo revisar que haga push al marker despues de eso show marker

const showMarker = function (
  id = '',
  msg = 0,
  type = 0,
  duration = 0,
  distance = 0,
  elevation = 0,
  cadence = 0,
  lat = 0,
  lng = 0
) {
  console.log(id, 'showMarker ', lat, lng, msg);
  // //pone el pin
  pinPoint = L.marker([lat, lng], { icon: myIcon, id }).addTo(mymap);
  // //pone el popup
  pinPoint
    .addTo(mymap)
    .bindPopup(
      `
      ${msg ? msg : ''}
      ${type ? '<br/> Activity: ' + type : ''}
      ${duration ? '<br/> Duration: ' + duration : ''}
      ${distance ? '<br/> distance: ' + distance : ''}
      ${duration ? '<br/> cadence: ' + cadence : ''}
      ${elevation ? '<br/> elevation: ' + elevation : ''}
      `,
      {
        optionsPop,
        className: `workout--${type} id-${id}`,
      }
    )
    .openPopup();

  //Add to side bar
  if (msg === currentPosMsj) return;

  if (type === 'running') {
    containerWorkouts.insertAdjacentHTML(
      'beforeend',
      `      <li id='div-${id}' class="workout workout--running" data-id="1234567890">
      <h2 class="workout__title">Running on April 14</h2>
      <div class="workout__details">
          <span class="workout__icon">🏃‍♂️</span>
          <span class="workout__value">${distance}</span>
          <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${duration}</span>
          <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${duration / distance}</span>
          <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${distance}</span>
          <span class="workout__unit">spm</span>
      </div>
  </li>
`
    );
  } else {
    containerWorkouts.insertAdjacentHTML(
      'beforeend',
      `
    <li id='div-${id}' class="workout workout--cycling" data-id="1234567891">
    <h2 class="workout__title">Cycling on April 5</h2>
    <div class="workout__details">
        <span class="workout__icon">🚴‍♀️</span>
        <span class="workout__value">${distance}</span>
        <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${duration}</span>
        <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${distance}</span>
        <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${elevation}</span>
        <span class="workout__unit">m</span>
    </div>
</li>`
    );
  }
  pinPoint.addEventListener('click', function (e) {
    let pinId = e.target.options.id;
    console.log('el id es: ' + pinId);
  });
  pinPoint.addEventListener('contextmenu', e => {
    //borrado de markers
    let pinId = e.target.options.id;
    console.log('id ', pinId);
    form_remove_popup_layer(pinPoint, pinId);
  });
};

const saveMarker = function () {
  console.log('SAVING markerTotal', JSON.stringify(markers));
  localStorage.setItem('markers', JSON.stringify(markers));
};
const deleteMarkets = function () {
  localStorage.setItem(`markers`, ``);
  markerTotal = 0;
};
const getMarkers = function () {
  //get all local storage pins
  const localMarkersData = localStorage.getItem('markers');
  // let localMarkers = {};

  if (localMarkersData) markers = JSON.parse(localMarkersData);

  markerTotal = Object.keys(markers).length;
  console.log(markers, markerTotal);

  const msjdate = new Date().toLocaleDateString();
  Object.keys(markers).forEach(pin => {
    let {
      id,
      msjdate: msg,
      type,
      duration,
      distance,
      elevation,
      cadence,
      lat,
      lng,
    } = markers[pin];

    showMarker(
      id,
      (msg = msjdate),
      type,
      duration,
      distance,
      elevation,
      cadence,
      lat,
      lng
    );
  });
};

//remove Marker
const form_remove_popup_layer = function (layer, pinId) {
  //lo saca del mapa
  const answer = window.confirm('Remove this marker?');
  //lo saca del sidebar
  let el = document.querySelector(`#div-${pinId}`);

  if (answer) {
    layer.remove();
    if (el) el.remove();
    markerTotal--;
  } else {
    console.log('no borrar');
    return;
  }

  //new array donde meter los objectos
  const newMarkers = {};
  Object.keys(markers).map(item => {
    //si es difrente al id metalo
    if (item !== `${pinId}`) newMarkers[item] = markers[item];
  });
  //haga una copia
  markers = { ...newMarkers };
  //borro del sidebar

  saveMarker();

  return false;
};
/*-----------------------------------------------------------------------------------*/
/*  Form
/*-----------------------------------------------------------------------------------*/
//show btn of submit
const form_show_btn_submit = function () {
  form_btn_submit.classList.add('form__btn-show');
};
//hide btn submit
const form_hide_btn_submit = function () {
  form_btn_submit.classList.remove('form__btn-show');
};

//Cancel form
const form_hide = function (e) {
  e.preventDefault();

  //hide form
  form.classList.add('hidden');
  //Hide btn submit
  form_hide_btn_submit();
};

const form_showUp = function (e) {
  console.log('starting form');
  console.log('on click set lat and lng');
  currentLat = e.latlng.lat;
  currentLng = e.latlng.lng;
  console.log('starting form', currentLat, currentLng);
  //put cursos in distanse UX
  inputDistance.focus();
  //clean the form
  inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
    '';

  form.classList.remove('hidden');
};

const form_validation = function (e) {
  //Check type of sport
  inputType.value === 'cycling'
    ? formelev.classList.remove('form__row--hidden')
    : formelev.classList.add('form__row--hidden');
  //Show btn if all filed are fill and not 0
  if (
    inputDistance.value !== '' &&
    inputDistance.value !== '0' &&
    inputDuration.value !== '' &&
    inputDuration.value !== '0' &&
    inputCadence.value !== '' &&
    inputCadence.value !== '0'
  ) {
    form_show_btn_submit();
  } else {
    console.log('remove submit');
    form_hide_btn_submit();
  }
  formInputs.forEach((item, i) => {
    //validate data from imput
    item.addEventListener('change', () => {
      item.value < 0 ? (item.value = 0) : item.value;
    });
  });
};

//Submit form
const sumitForm = function (e) {
  e.preventDefault();
  //ShowMarker la info que tiene en el form y salvela

  //push info a markets para cuando cargo al principio
  console.log('push markerTotal', markerTotal);
  markers[markerTotal] = {
    id: markerTotal,
    msg: `${markerTotal}) marker`,
    type: inputType.value,
    duration: inputDuration.value,
    distance: inputDistance.value,
    elevation: inputElevation.value,
    cadence: inputCadence.value,
    lat: currentLat,
    lng: currentLng,
  };
  markerTotal++;
  //Despliego el marker
  console.log('push markers', markers);
  showMarker(
    markerTotal,
    `${markerTotal}) marker`,
    inputType.value,
    inputDuration.value,
    inputDistance.value,
    inputElevation.value,
    inputCadence.value,
    currentLat,
    currentLng
  );
  //save all  markets
  saveMarker();
};

/*-----------------------------------------------------------------------------------*/
/* 3) Render Map in div map
/*-----------------------------------------------------------------------------------*/
const renderMap = function (lat, lng) {
  //crea el drop icon por primera vez
  //make the obj first time with current location markerTotal

  mymap = L.map('map').setView([lat, lng], 13);
  const token =
    'pk.eyJ1IjoibWxhZnVlbnRlIiwiYSI6ImNrbjB6MGZ3czBzbzkybm1mcmgybGhoZ2IifQ.9DHDP5MiayzCPFSsKuhfUA';

  L.tileLayer(
    `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${token}`,
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'your.mapbox.access.token',
    }
  ).addTo(mymap);

  //Star showing the form
  mymap.addEventListener('click', e => form_showUp(e));
};

/*-----------------------------------------------------------------------------------*/
/* 2) Ask for navigator
/*-----------------------------------------------------------------------------------*/
const starMap = function () {
  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  navigator.geolocation.getCurrentPosition(
    function success(pos) {
      const crd = pos.coords;

      //al inicio cargo mi ubicacion siempre
      renderMap(crd.latitude, crd.longitude);
      showMarker(
        '',
        currentPosMsj,
        '',
        '',
        '',
        '',
        '',
        crd.latitude,
        crd.longitude
      );
    },
    error,
    options
  );
};
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
/*-----------------------------------------------------------------------------------*/
/* 1) Start
/*-----------------------------------------------------------------------------------*/
const startApp = function () {
  starMap();
  const checkMymap = function () {
    console.log('checking mymap');
    typeof mymap !== 'undefined'
      ? getMarkers()
      : window.setTimeout(checkMymap, 2000);
  };
  //deleteMarkets();
  checkMymap();
};
startApp();
/*-----------------------------------------------------------------------------------*/
/* addEventListener
/*-----------------------------------------------------------------------------------*/

//lisen if click or type on the form
form.addEventListener('click', e => form_validation(e));
form.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    form_validation(e);
  } else {
    form_validation(e);
  }
});
//submitform
form_btn_submit.addEventListener('click', e => sumitForm(e));
form_btn_cancel.addEventListener('click', e => form_hide(e));
