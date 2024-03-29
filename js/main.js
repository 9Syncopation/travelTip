console.log('Main!');

import locService from './services/loc.service.js'
import mapService from './services/map.service.js'
import weatherService from './services/weather.service.js'




locService.getLocs()
    .then(locs => console.log('locs', locs))



window.onload = () => {
    let lat = getParameterByName('lat');
    let lng = getParameterByName('lng');
    if (+lat !== 0 && +lng !== 0) {
        onInitMap({lat: +lat, lng: +lng});
        return;
    }


    locService.getPosition()
        .then(pos => {
            onInitMap({lat: pos.coords.latitude, lng: pos.coords.longitude})
        })
        .catch(err => {
            console.log('err!!!', err);
        })
}

function onInitMap({lat, lng}){
    mapService.initMap(lat, lng)
            .then(() => {
                mapService.addMarker({lat, lng});
                locService.addLoc({lat, lng});
                locService.getLocationName({lat, lng})
                    .then(data => document.querySelector('.location-text').innerText = data.plus_code.compound_code ? data.plus_code.compound_code.substring(8) : 'Invalid location');
            })
            .catch(console.log('INIT MAP ERROR'));
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


document.querySelector('.btn-my-location').addEventListener('click', (ev) => {
    locService.getPosition()
        .then(pos => {
            onSelectPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        })
        .catch(err => {
            console.log('err!!!', err);
        })
})

function onSelectPos(pos) {
    mapService.panTo(pos.lat, pos.lng);
    mapService.addMarker({ lat: pos.lat, lng: pos.lng });
    locService.getLocationName({ lat: pos.lat, lng: pos.lng }).then(data => document.querySelector('.location-text').innerText = data.plus_code.compound_code.substring(8));
    weatherService.getTodayhWeather({ lat: pos.lat, lon: pos.lng }).then(data => console.log)
}

function onSearch() {
    let search = document.querySelector('#search-input').value;
    locService.getCoords(search)
        .then(data => {
            onSelectPos(data.results[0].geometry.location);
        })
}

function copyToClipboard(text) {
    var area = document.createElement("textarea");
    document.body.appendChild(area);
    area.value = text;
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
}

document.querySelector('.btn-search').addEventListener('click', ev => onSearch());
document.querySelector('.btn-copy').addEventListener('click', ev => {
    locService.getLocs().then(locs => {
        copyToClipboard(`https://9syncopation.github.io/travelTip/index.html?lat=${locs[locs.length-1].lat}&lng=${locs[locs.length-1].lng}`)
    })
})
