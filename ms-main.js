/**
 * @name Interactive Google Map from a Google Sheet
 * @version version 1.0
 * @author Greg Bays
 * @fileoverview
 * A encompasing mobile friendly website for map data specifically from a google sheet, integrating charts, tables, and statistics
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

google.charts.load('current', {
        'packages': ['corechart', 'table']
    });
// CHARTS
google.charts.setOnLoadCallback(runChartQuery);

// MAPS VARS
var map, bounds, service, infowindow, autocomplete, markerAnchor, markerclusterer;

// AUTOCOMPLETE
var search_filled = false;
var search_result;

//FILLCOLOR
var g_fillColor = '#e51c23';
var g_colorNum = -1;

// MARKERS
var markers = [];
var activeMarkers = [];

// FIX CLUSTER
var g_first = false;
var g_clusterTimer;

//ZOOM
var g_zoomTimer;

// HTML5 GEOLOCATION
var g_geoPosition;

// REVERSE GEOCODE
var g_geoTimer;
// IS MOBILE?
var g_mobilecheck = function() {
    var check = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};


//--INIT MAP--//
//--called by google.maps.event.addDomListener()--//
// ref : https://developers.google.com/maps/documentation/javascript/places

function initMap() {
    // MAP OPTIONS (STYLING REF: https://mapstyle.withgoogle.com/)
    var options = {
        center: new google.maps.LatLng(36.036604, -114.321781),
        zoom: 3,
        fullscreenControl: false,
        mapTypeControl: false,
        panControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
            style: google.maps.ZoomControlStyle.DEFAULT
        },
        maxZoom: 21,
        minZoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy'
        /*styles: [{
			"featureType":"water",
			"stylers":[{
					"color":"#46bcec"
				},{
					"visibility":"on"
				}]
		},{
			"featureType":"landscape",
			"stylers":[{
					"color":"#f2f2f2"
				}]
		},{
			"featureType":"road",
			"stylers":[{
					"saturation":-100
				},{
					"lightness":45
				}]
		},{
			"featureType":"road.highway",
			"stylers":[{
					"visibility":"simplified"
				}]
		},{
			"featureType":"road.arterial",
			"elementType":"labels.icon",
			"stylers":[{
					"visibility":"simplified"
				}]
		},{
			"featureType":"administrative",
			"elementType":"labels.text.fill",
			"stylers":[{
					"color":"#444444"
				}]
		},{
			"featureType":"transit",
			"stylers":[{
					"visibility":"off"
				}]
		},{
			"featureType":"poi",
			"stylers":[{
					"visibility":"off"
				}]
		}]*/


    };
    // MAP
    map = new google.maps.Map(document.getElementById('map-canvas'), options);

    // BOUNDS
    bounds = new google.maps.LatLngBounds();

    // SERVICE
    service = new google.maps.places.PlacesService(map);

    // INFOWINDOW
    infowindow = new google.maps.InfoWindow();

    // INFOWINDOW CLOSECLICK LISTENER
    google.maps.event.addListener(infowindow, 'closeclick', closeCard);

    // INFOWINDOW DOMREADY LISTENER
    google.maps.event.addListener(infowindow, 'domready', infowindowDomReady);

    // MARKER CLUSTERER
    markerclusterer = new MarkerClusterer(map, [], {
            gridSize: 40,
            maxZoom: 12,
            averageCenter: true,
            minimumClusterSize: 2,
            hoverTitle: '%d Mass Shootings (Click to expand group)'
        });

    // BOUNDS CHANGED LISTENER ON MAP
    google.maps.event.addListener(map, 'bounds_changed', boundsChanged);

    // AUTOCOMPLETE ELEMENT	FROM HTML	
    // push the searchbox html into the map
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('search'));

    // AUTOCOMPLETE INPUT ELEMENT
    autocomplete = new google.maps.places.Autocomplete(document.getElementById('search-searchboxinput'), {
            types: ['geocode']
        });
    autocomplete.bindTo('bounds', map);

    // AUTOCOMPLETE LISTENER ON PLACE CHANGED
    google.maps.event.addListener(autocomplete, 'place_changed', placeChanged);

    // QUERY
    runQuery();

    // Finally, Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            g_geoPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
        }, function() {
            // browser supports, but user has declined to share
            // or the site is not secure (http not https)
            handleLocationError(true, infowindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infowindow, map.getCenter());
    }

} // end init code


//--BOUNDS CHANGED--//
//--called by initMap() -> map -> "bounds_changed" 

function boundsChanged() {
    // REVERSE GEOCODE
    reverseGeocode();
    // FIX CLUSTER
    fixCluster();
}

//--PLACE CHANGED--//
//--called by initMap() -> autocomplete -> "place_changed"

function placeChanged() {
    console.log('place_changed fired');
    var place = autocomplete.getPlace();
    // if no geometry ignore the rest
    if (!place.geometry) {
        return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
    } else {
        map.setCenter(place.geometry.location);
        zoom(12);
    }
}


//************************************************************************************//
//START COLORS MARKERS MARKERCLUSTERER INFOWINDOW
//************************************************************************************//
//--INFOWINDOW DOMREADY--//
//--called by initMap() -> infowindow -> "domready" 
// action needed for the infowindow to be responsive

function infowindowDomReady() {
    // take off the disabled class if not first or last
    for (i = 0; i < markers.length; i++) {

        $('.info-outof').text(markers.length);
        // which index are we looking at?
        var n = parseInt($('.info-text').attr('data-current-index'));
        //...if first or last, make the proper button look disabled,
        if (n === 0) {
            $('.info-prev').addClass('disabled');
        }
        if (n == markers.length - 1) {
            $('.info-next').addClass('disabled');
        }

        //...update the table 'selected' highlight,
        $('#table tr:eq(' + (n + 1) + ')').addClass('google-visualization-table-tr-sel');
        table.setSelection(n);
    }
    //...set up the click listener for older/newer, prev/next
    $('.info-prev,.info-next').click(function(e) {
        e.preventDefault();
        // make the data-index value into a number
        var n = parseInt($(this).attr('data-index'));
        // create a proper prev/next stopping points
        n = (n == markers.length) ? markers.length - 1 : n;
        n = (n == -1) ? 0 : n;

        //...fire the click listener on the prev or next selection,
        google.maps.event.trigger(markers[n], 'click');
        //...reset the table selected highlight,
        $('#table tr').removeClass('google-visualization-table-tr-sel');
    });
}
//--INFOWINDOW OPEN ON ZOOM FINISHED--//
//--called by smoothZoom()--//

function infoWindowOnZoomFinished() {
    var m = activeMarkers[0];
    window.setTimeout(function() {
        infowindow.open(map, m);
    }, 250); // 250ms
}

//--Precache card info--//
//--called by marker -> click

function preCache(n) {
    if (!n || n === null) return;

    if (n === 0 || n == markers.length - 1) {
        return;
    }
    var next = shootings[n + 1];
    var prev = shootings[n - 1];
    var a = [{
            s: next.getCasename(),
            b: next.query_
        }, {
            s: prev.getCasename(),
            b: prev.query_
        }
    ];
    for (i = 0; i < a.length; i++) {
        if (!a[i].b) {
            var q = g_queryStringAddValues + 'A = "' + a[i].s + '" LIMIT 1';
            //console.log('[DEV] loading row: \"%s\"',a[i].s);
            runQuery(q, g_colorNum, 'cacheValues');
        }
    }
}

//--FIX CLUSTER--//
//--called by boundsChanged(), reset by runQuery()--// 
// bug on mobile with marker clusterer when page is filled with new markers, 
// a really quick zoom fixes it

function fixCluster() {
    if (g_clusterTimer) {
        window.clearTimeout(g_clusterTimer);
    }
    g_clusterTimer = window.setTimeout(function() {
        if (g_first) {
            map.setZoom(map.getZoom() + 1);
            map.setZoom(map.getZoom() - 1);
            g_first = false;
        }
    }, 500);
}

//--STYLES FOR MARKERCLUSTERER ICON--//
//--called by setColor()--//

function setMarkerClusterStyle() {
    var pilltextstyle = 'color: rgb(255, 255, 255);position: absolute;font-size: 9pt;background-color: #666;border-radius: 1em;-webkit-box-sizing: border-box;box-sizing: border-box;color: #fff;height: 1.5em;line-height: 1;max-width: 5em;min-width: 1.5em;overflow: hidden;padding: .25em;right: -.34em;text-overflow: ellipsis;top: -.38em;-webkit-transform: scale(.8);transform: scale(.8);-webkit-transform-origin: top right;transform-origin: top right;text-shadow: 0.5px 0.5px #000;';
    var svg = targetShapeSvgUri();
    //console.log('[DEV]',svg)		
    var styles = [{
            // little bigger than marker...
            url: svg,
            height: 28,
            width: 28,
            anchor: new google.maps.Point(14, 14),
            css: pilltextstyle
        }, {
            //... we can keep growing marker icons as the the cluster grows in size
            url: svg,
            height: 30,
            width: 30,
            anchor: new google.maps.Point(15, 15),
            css: pilltextstyle
        }
    ];
    markerclusterer.setStyles(styles);
}

//--SET COLOR--//
//--called by runQuery()--//

function setColor(n) {
    var n = (n === undefined) ? -1 : n;
    //set global var g_fillColor once per query
    g_fillColor = convertNumToColor(n);
    g_colorNum = n;

    setMarkerClusterStyle();
}
//--GET COLOR INDEX--//
//--called by tags--//

function getColorIndex(s) {
    //console.log('[DEV] %s',s);
    switch (s.toLowerCase()) {
        case 'female':
            return 0;
        case 'asian':
            return 0;
        case 'mass':
            return 0;
        case 'no':
            return 0;
        case 'military':
            return 0;
        case 'male':
            return 1;
        case 'black':
            return 1;
        case 'spree':
            return 1;
        case 'tbd':
            return 1;
        case 'public place':
            return 1;
        case 'male and female':
            return 2;
        case 'latino':
            return 2;
        case 'unknown':
            return 2;
        case 'religious':
            return 2;
        case 'male and male':
            return 3;
        case 'native american':
            return 3;
        case 'yes':
            return 3;
        case 'school':
            return 3;
        case 'other':
            return 4;
        case 'workplace':
            return 4;
        case 'white':
            return 5;
        case 'state':
            return 11;
        case 'year':
            return 14;
        case 'rifle (assault)':
            return 18;
        case 'semiautomatic rifle':
            return 19;
        case 'shotgun':
            return 20;
        case 'rifle':
            return 21;
        case 'semiautomatic handgun':
            return 22;
        case 'handgun':
            return 23;
        case 'revolver':
            return 24;
        default:
            return 25;
    }

}
//--GET COLOR HEX BY INDEX--//
//--called by convertNumToColor()--//

function getColorHexByIndex(n) {
    var fillColor = '#e51c23'; //default
    var colors = [
        '#3366CC',
        '#DC3912',
        '#FF9900',
        '#109618',
        '#990099',
        '#0099C6',
        '#DD4477',
        '#66AA00',
        '#B82E2E',
        '#316395',
        '#994499',
        '#22AA99',
        '#AAAA11',
        '#6633CC',
        '#E67300',
        '#8B0707',
        '#329262',
        '#3B3EAC',
        '#111111',
        '#222222',
        '#333333',
        '#444444',
        '#555555',
        '#666666',
        '#777777',
        '#888888'
    ];
    if (n > colors.length || n < 0) {
        console.warn('[DEV] Using default color');
        return fillColor;
    } else {
        return colors[n];
    }
}

//--COLORS FOR ALL MARKERS--//
//--called by makeClusters()--//

function convertNumToColor(n) {
    fillColor = getColorHexByIndex(n);
    $('.card-filter-icon').css('color', fillColor);
    //console.log('[DEV] current fillcolor is %s', fillColor);
    return fillColor;
}

//--DELETE ALL MAP MARKERS--//
//--called by runQuery()--//

function deleteAllMarkers() {
    //console.log('[DEV] deletemarkers fired : length : %s',markers.length);
    if (markers.length == 0) return;

    // close the card
    closeCard();

    // remove active markers
    deleteActiveMarker();

    //reset markerclusterers 
    markerclusterer.clearMarkers();
    markerclusterer.removeMarkers(markers);

    //remove markers from google map
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    // reset google marker array
    markers = [];

    //get rid of infowindows content
    infowindow.close();
    infowindowContents = [];

    //reset bounds to init values
    bounds = new google.maps.LatLngBounds();
}

//--ADD ACTIVE MARKER--//
//--called by populateMap() -> marker,"click"--//
var g_activeMarkerListener;

function addActiveMarker(pos) {
    var svg = targetShapeSvgUri();
    var currentColor = g_fillColor;
    var marker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
                url: svg.replace(currentColor, '#e6585d'),
                size: new google.maps.Size(25, 25),
                anchor: new google.maps.Point(12, 13),
                scaledSize: new google.maps.Size(25, 25)
            },
            zIndex: 2
        });

    // make a list of the active marker so we can delete the active marker overlay as necessary
    activeMarkers.push(marker);

    g_activeMarkerListener = google.maps.event.addListener(map, 'zoom_changed', function(event) {
        map.panTo(pos);
    });
}

//--DELETE ACTIVE MARKER--//
//--called by deleteAllMarkers(), resetCard()--//

function deleteActiveMarker() {
    for (var i = 0; i < activeMarkers.length; i++) {
        activeMarkers[i].setMap(null);
    }
    activeMarkers = [];
    google.maps.event.removeListener(g_activeMarkerListener);
}

//--MAKE TARGET SHAPE SVG--//

function targetShapeSvgUri() {
    var bullseyePath = 'M256 72c101.689 0 184 82.295 184 184 0 101.689-82.295 184-184 184-101.689 0-184-82.295-184-184 0-101.689 82.295-184 184-184m0-64C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 184c35.29 0 64 28.71 64 64s-28.71 64-64 64-64-28.71-64-64 28.71-64 64-64m0-64c-70.692 0-128 57.308-128 128s57.308 128 128 128 128-57.308 128-128-57.308-128-128-128z';

    var circlePath = 'M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z';

    var svgString = '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="' + circlePath + '" fill="white"/><path d="' + bullseyePath + '" fill="currentColor"/></svg>';

    //js/mini-svg-data-uri.js
    var svg = svgToTinyDataUri(svgString);
    return svg.replace('currentColor', g_fillColor);

}
//************************************************************************************//
//END COLOR MARKERS MARKERCLUSTERER INFOWINDOW
//************************************************************************************//





//************************************************************************************//
//START ZOOM
//************************************************************************************//
//--ZOOM (IN OR OUT) --//
//--called by, whereAmI(), deleteAllMarkers(), marker -> "click", closeCard()--//

function zoom(n) {
    var a;
    var n = (!n) ? 4 : n;
    if (n < map.getZoom()) {
        a = 'out';
    } else if (n > map.getZoom()) {
        a = 'in';
    }
    smoothZoom(map, n, map.getZoom(), a);
}
//--SMOOTH ZOOM--//
//--called by zoom()--//
//--n = max, c = count, s = str, ln = last

function smoothZoom(map, n, c, s) {
    if (g_zoomTimer) {
        window.clearTimeout(g_zoomTimer);
    }
    var ln = c;
    //console.log('[DEV] zoom() %s', cnt);
    if (ln == n) {
        if (ln == 18) {
            infoWindowOnZoomFinished();
        }
        return;
    } else if (s == 'out') {
        map.setZoom(n);
        return;
    } else {
        g_zoomTimer = window.setTimeout(function() {
            smoothZoom(map, n, c + 1, s);
            map.setZoom(ln);
        }, 87); // 87ms
    }
    //console.log('[DEV] dir %s, cnt %s max %s',s, c, n);
}
//************************************************************************************//
//END ZOOM
//************************************************************************************//





//************************************************************************************//
//START GEOCODE GEOLOCATION
//************************************************************************************//	
//--GEOLOCATION FAILURE--//
//--called by initMap()--//

function handleLocationError(browserHasGeolocation, infowindow, pos) {
    // TO DO: add cookie "Dont tell me again" to prevent this message from showing up every load of page
    //infowindow.setPosition(pos);
    //infowindow.setContent(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
    console.log(browserHasGeolocation ? 'Warning: The Geolocation service failed.' : 'Warning: Your browser doesn\'t support geolocation.');
    //infoWindow.open(map);
}

//--REVERSE GEOCODE--//
//--called by boundsChanged()--//

function reverseGeocode() {
    if (g_geoTimer) {
        window.clearTimeout(g_geoTimer);
    }
    // Throttle the geo query so we don't hit the limit
    g_geoTimer = window.setTimeout(function() {
        // dont reverse geocode position unless card handle is visible
        if ($('.card-handle').hasClass('show') && !$('.card-handle').first().hasClass('hide')) {
            reverseGeocodePosition();
        }
    }, 1000);
}

//--REVERSE GEOCODE POSITION--//
//--called by reverseGeocode()--//

function reverseGeocodePosition() {
    var pos = map.getCenter();
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
            'latLng': pos
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    $('.of').html('Around ' + results[1].formatted_address);
                    return;
                }
            } else {
                console.warn("WARNING: " + status)
            }
            $('.of').html('Around somewhere');
        });
}
//************************************************************************************//
//END GEOCODE GEOLOCATION
//************************************************************************************//






//************************************************************************************//
//START PAGE HTML INTERACTIONS
//************************************************************************************//
//--CLOSE CARD--//
//--called by .close -> "click", infowindow -> "closeclick", deleteAllMarkers(), table -> "select"--//

function closeCard() {
    // clear our active markers 
    infowindow.close();
    //console.log('[DEV] closeCard() setting zoom');
    if (map.getZoom() > 13) {
        zoom(13);
    }
    handleDown();
}

//--WHICH TRANSITION EVENT--//
//--called by scrollSize()--//
// creates a fake element to see which transition event the browser is using
// ref : https://jonsuh.com/blog/detect-the-end-of-css-animations-and-transitions-with-javascript/

function whichTransitionEvent() {
    var t,
        el = document.createElement("fakeelement");
    var transitions = {
        "transition": "transitionend",
        "OTransition": "oTransitionEnd",
        "MozTransition": "transitionend",
        "WebkitTransition": "webkitTransitionEnd"
    }
    for (t in transitions) {
        if (el.style[t] !== undefined) {
            return transitions[t];
        }
    }
}

//--SCROLLSIZE ADJUSTMENT--//
//--called by handleUp(), handleDown(), $(window) "resize"--//
//fix the scrollsize for a dynamic scrolling 
//triggering the height change to .card-body at the end of the css animation transition

function scrollSize() {
    var transitionEvent = whichTransitionEvent();
    $('.card-detail-wrapper').one(transitionEvent, function(event) {
        var w_h = $(window).height();
        var doc_h = $(document).height();
        var m_h = $('.map').height();
        var sum = doc_h - w_h;
        var h_h = $('.card-underscroll-header').height();
        var b_h = $('.card-buttons-table-fixed').height();

        var n = (((w_h - m_h) - h_h) - b_h) + sum;
        $('.card-body').css('height', n).removeClass('invisible');
    });
}
//--SHOWHIDETOGGLE--//
//--called by handleUp(), handleDown()--//

function showHideToggle(a, b) {
    $('.card-popup, .card-close-x, .card-buttons-table-fixed, .card-location-date-group, .card-shooter2-details, .card-mental-history-details, .card-horizontal-line, .card-main-title').addClass(a).removeClass(b);
    $cardhandle = $('.card-handle');
    $cardhandle.addClass(b).removeClass(a);
    if (a == 'hide') {
        $cardhandle.animate({
                top: '-55px'
            }, 200, function() {});
    } else {
        $cardhandle.animate({
                top: '249px'
            }, 200, function() {});
    }
    var c = (a == 'show') ? 'up' : 'down';
    var d = (b == 'hide') ? 'down' : 'up';
    $('.card-detail-wrapper').addClass(c).removeClass(d);
}

//--HANDLE UP--//
//--called by marker -> "click"--//

function handleUp() {
    resetCard();
    $('.search-searchbox').animate({
            top: "-249px"
        }, 200, function() {});
    showHideToggle('show', 'hide');
    scrollSize();
    // insert the data credit into the map
    $('.gm-style').append('<div draggable="false" class="card-cc gm-style-cc"><div class="card-cc-spacer"><div style="width: 1px;"></div><div class="card-cc-background"></div></div><div class="card-cc-data"><a target="_blank" class="card-cc-link data-cc" rel="noopener">Data Credit:</a></div></div>');
}

//--HANDLE DOWN--//
//--called by closeCard()--//

function handleDown() {
    $('.search-searchbox').animate({
            top: "0px"
        }, 200, function() {});
    $('.card-body').scrollTop(0); //resets the scrolling to top
    showHideToggle('hide', 'show');
    scrollSize();
    // remove the data credit from the map
    resetCard();
}

//--RESET CARD--//
//--called by closeCard(), marker -> "click"--//
// takes actions to clear the page and return it to a waiting state

function resetCard() {
    deleteActiveMarker();
    $('.card-spinner').addClass('show').removeClass('hide');
    $('.card-body').addClass('invisible');
    $('.gm-style').find('.card-cc').remove();
    $('#search-searchboxinput').val('');
    $('.card-body [class^="data-"], .data-fatalities, .data-injured, .data-location, .data-date').text(' ');
    $('.card-mental-health-sources, .card-news-sources, .card-carousel, .card-victim-list, .card-tags').html(' ');
}

//--END OF RUNQUERY--//
//--called by fillCard()--//

function endOfFill() {
    $('.card-body').removeClass('invisible');
    $('.card-spinner').removeClass('show').addClass('hide');
}

//--HIDE FILTER SELECTIONS--//
//--called by runQuery()--//

function hideFilterSelections() {
    // hides years and states that have no shootings 
    $('ul.filter li > a').not('.check').parent().css('display', 'none');
}

//--SHOW FILTER SELECTIONS--//
//--called by drawChart()--//

function showFilterSelections(data_col, s, n, t) {
    //console.log('[DEV] letter %s,data text %s, total %s', data_col, s, n, t);
    var $t = $("ul.filter li a:contains('" + s + "')");

    // show the target parent element (li) which is display:none by default in hideFilterSelections()
    $t.parent().attr('style', '');

    // if .check does not exist, insert count span, add the .check class
    if (!$t.hasClass('check')) {
        //hijack the mm-counter class for our item count
        var $em = $('<em>').addClass('mm-counter').text(n);
        $t.addClass('check').attr({
                'data-text': s,
                'data-col': data_col
            }).click(function(e) {
                e.preventDefault();
                var text = $(this).attr('data-text');
                var col = $(this).attr('data-col');
                var does = $(this).parent().parent().hasClass('year');
                var color = (does) ? 14 : 11;
                var txt = (does) ? 'Year : ' + text : 'State : ' + text;
                runQuery(g_queryStringMinimumValues + ' WHERE ' + col + ' = "' + text + '"', color);
                showFilterCardHandle(txt);
            });
        $t.parent().prepend($em);
    }
}

//--RESET CARD HANDLE--//
//--called by runQuery()--//

function showNearMeCardHandle() {
    $('#filter-on').text('');
    $('.card-handle-outer').first().removeClass('hide');
    $('.card-handle-outer').last().addClass('hide');
}

//--SHOW FILTER CARD HANDLE
//called by drawChart(), .filter -> "click"--//

function showFilterCardHandle(s) {
    $('#filter-on').text(s);
    $('.card-handle-outer').first().addClass('hide');
    $('.card-handle-outer').last().removeClass('hide');
}

//************************************************************************************//
//END PAGE HTML INTERACTIONS
//************************************************************************************//






//************************************************************************************//
//START 
//************************************************************************************//

//--called by initMap(), .reset-map -> "click", .filter -> "click" --//
// runQuery() can be called externally from filter links, e.g runQuery("where [column title] = [value to filter on] AND ...")etc...
// if the [column title] has a space in it e.g "Total Victims", use the back quote ( ` ) 
// e.g `Total Victims`, also use back quote for reserved words like `date`

// ref: https://developers.google.com/chart/interactive/docs/querylanguage

//--RUNCHARTQUERY--//
//--called by charts.setOnLoadCallback()--//
//TO DO: Think of better way to send only 1 req for charts

function runChartQuery() {
    var go = [{
            q: 'SELECT I',
            el: 'chart-venue'
        }, {
            q: 'SELECT L',
            el: 'chart-legal'
        }, {
            q: 'SELECT V',
            el: 'chart-type'
        }, {
            q: 'SELECT X',
            el: 'chart-ended'
        }, {
            q: 'SELECT J',
            el: 'chart-mental-health'
        }, {
            q: 'SELECT P',
            el: 'chart-race'
        }, {
            q: 'SELECT Q',
            el: 'chart-gender'
        },
        /* keeping this here as example of table and histogram
		{q: 'SELECT A,B', el:'table'},	
		{q: 'SELECT Y,Z', el:'histogram'},
		*/
        {
            q: 'SELECT D',
            el: 'year'
        }, {
            q: 'SELECT W',
            el: 'state'
        }
    ];

    for (i = 0; i < go.length; i++) {
        runBulkQuery(go[i].q, -1, go[i].el);
    }
}
//--RUNBULKQUERY--//
//--called by runChartQuery()--//
var g_tableid = '1BCirA2bPNdLBt7WT2wfNF_tw19PK3fQo-j51MKeQ9sc';
//var g_queryUrl = 'https://docs.google.com/spreadsheet/ccc?key='+g_tableid+'&usp=drive_web&gid=0';
var g_queryUrl = 'http://spreadsheets.google.com/tq?key=' + g_tableid + '&pub=1';
var g_queryStringMinimumValues = 'SELECT A,B,C,T,U';
var g_queryStringAddValues = 'SELECT A,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF WHERE ';

function runBulkQuery(q, n, el) {

    //var URL = 'https://docs.google.com/spreadsheet/ccc?key='+tableid+'&usp=drive_web&gid=0';
    var URL = 'http://spreadsheets.google.com/tq?key=' + g_tableid + '&pub=1';
    var opts = {
        sendMethod: 'auto'
    }
    var query = new google.visualization.Query(URL, opts);

    // ref: https://developers.google.com/chart/interactive/docs/querylanguage
    query.setQuery(q);

    //SEND TO CALLBACK FUNCTION
    if (el == 'chart-venue') {
        query.send(chartVenue);
    } else if (el == 'chart-legal') {
        query.send(chartLegal);
    } else if (el == 'chart-type') {
        query.send(chartType);
    } else if (el == 'chart-ended') {
        query.send(chartEnded);
    } else if (el == 'chart-mental-health') {
        query.send(chartMentalHealth);
    } else if (el == 'chart-race') {
        query.send(chartRace);
    } else if (el == 'chart-gender') {
        query.send(chartGender);
    } else if (el == 'table') {
        //not using this - my table tied to shootings in draw map
        query.send(chartTable);
    } else if (el == 'histogram') {
        //not using this, but it works
        query.send(chartHistogram);
    } else if (el == 'year') {
        query.send(filterYear);
    } else if (el == 'state') {
        query.send(filterState);
    } else {
        console.warn('No callback for %s has been built', el);
    }
}

//--RUN QUERY--//
//--called by initMap(), .filter -> "click", marker -> "click", table -> "select", chart -> "select"--// 

function runQuery(q, n, el) {
    var q = (!q) ? g_queryStringMinimumValues : q;
    var n = (n === null) ? -1 : n;
    var el = (!el) ? 'addMinimumValues' : el;
    //console.log('[DEV]',q);

    if (el == 'addMinimumValues') {
        // issue on small screens with reloads of markerclusterer, this keeps the issue down on page reloads
        g_first = true;
        // swaps filter bar for near me compass bar
        showNearMeCardHandle();
        // if there are any existing markers, delete them upon new query
        deleteAllMarkers();
        // clear out the shootings array
        shootings = [];
        // hide all filters in menu
        hideFilterSelections();
        // set the colors for all top layer markers
        setColor(n);
    }

    var opts = {
        sendMethod: 'auto'
    }
    var query = new google.visualization.Query(g_queryUrl, opts);

    // ref: https://developers.google.com/chart/interactive/docs/querylanguage
    query.setQuery(q);

    //SEND TO CALLBACK FUNCTION
    if (el == 'addMinimumValues') {
        //console.log('[DEV] addMinValues');
        query.send(addMinimumValues);
    } else if (el == 'addValues') {
        //console.log('[DEV] addValues');
        query.send(addValues);
    } else if (el == 'cacheValues') {
        //console.log('[DEV] cacheValues');
        query.send(cacheValues);
    }
}

//--CALLBACKS--//
//--called by runQuery(), runBulkQuery()--//

function addMinimumValues(response) {
    drawMap(response, 'card', 'addMinimumValues');
}

function addValues(response) {
    drawMap(response, 'card', 'addValues');
}

function cacheValues(response) {
    drawMap(response, 'card', 'cacheValues');
}

function chartVenue(response) {
    drawMap(response, 'chart-venue', 'PieChart', 'Incident Venue Type');
}

function chartLegal(response) {
    drawMap(response, 'chart-legal', 'PieChart', 'Incident Weapon Legal');
}

function chartType(response) {
    drawMap(response, 'chart-type', 'PieChart', 'Incident Shooting Type');
}

function chartEnded(response) {
    drawMap(response, 'chart-ended', 'PieChart', 'Incident Conclusion For Suspect');
}

function chartMentalHealth(response) {
    drawMap(response, 'chart-mental-health', 'PieChart', 'Suspect Mental Health Issues');
}

function chartRace(response) {
    drawMap(response, 'chart-race', 'PieChart', 'Suspect Race');
}

function chartGender(response) {
    drawMap(response, 'chart-gender', 'PieChart', 'Suspect Gender');
}
//not active - my table is tied to the map request

function chartTable(response) {
    drawMap(response, 'table', 'Table');
}
//not active - but this is availble if wanted

function chartHistogram(response) {
    drawMap(response, 'histogram', 'Histogram', 'Suspect Age At Time Of Incident');
}

function filterYear(response) {
    drawMap(response, 'year', 'Filter');
}

function filterState(response) {
    drawMap(response, 'state', 'Filter');
}

//--DRAW MAP TABLE CHARTS--//
//--called by callbacks()--//
var charts = [];
var table;
var histogram;
var shootings = [];
// this is my traffic cop

function drawMap(response, el, kind, title) {
    var el = (!el) ? '' : el; // dom element id
    var kind = (!kind) ? '' : kind; // PieChart, Histogram, Filter, Table, (addMinimumValues, addValues)for Shooting
    var title = (!title) ? '' : title; //Specifically for chart titles

    if (response.isError()) {
        console.warn('[DEV] Error in query: %s %s', response.getMessage(), response.getDetailedMessage());
        console.warn('[DEV] If experiencing ERR_ABORTED message, visit %s in the browser and solve CAPTCHA.', g_queryUrl)
        return;
    }
    // RESPONSE DATA TABLE		
    var rdata = response.getDataTable();

    // figure out the columns and rows
    var columns = rdata[Object.keys(rdata)[2]]; // aka ng
    var rows = rdata[Object.keys(rdata)[3]]; // aka og
    //console.log('[DEV]',columns)
    //console.log('[DEV]',rows);

    // NEW VIS DATA TABLE
    var vdata = {}; //nice reset - reminds me what this will be.
    vdata = new google.visualization.DataTable();

    // gather column types so rows are proper push value
    var vtypes = [];
    var vletter = [];
    for (i = 0; i < columns.length; i++) {
        var col = columns[i];
        //col.type; // string, number, date, datetime, boolean, 
        //col.label; // 'Pizza', 'Slices'
        //col.id; // A, B

        //--MULTIPLE PIECHARTS (1 Column)--//
        if (kind == 'PieChart' || kind == 'Filter') {
            var opt = {
                title: title,
                is3D: true,
                titleTextStyle: {
                    fontName: 'Roboto',
                    fontSize: '13pt'
                },
                legend: {
                    position: 'left'
                },
                tooltip: {
                    isHTML: true,
                    ignoreBounds: true,
                    text: 'both'
                }
            }
            var chart = new Chart(opt);
            chart.addValues([col.label, col.id, el, i, kind]);
            charts.push(chart);
        }

        //--1 TABLE (1+ Columns)--//
        // I want table tied to the drawn markers on the map
        if (kind == 'addMinimumValues') {
            if (!table) {
                //make a new table
                var opt = {
                    showRowNumber: true
                };
                table = new Table(opt);
            }
            // by adding el and kind directly under addMinimumValues, the table is tied to the filter query
            table.addValues([col.label, col.id, 'table', i, 'Table']);
        }

        //--1 HISTOGRAM (2 Columns [string,number])--//
        if (kind == 'Histogram') {
            if (!histogram) {
                //make a new histogram
                var opt = {
                    title: title,
                    legend: {
                        'position': 'none'
                    },
                    titleTextStyle: {
                        fontName: 'Roboto',
                        fontSize: '13pt'
                    },
                    tooltip: {
                        isHTML: true
                    }
                }
                histogram = new Table(opt);
            }
            histogram.addValues([col.label, col.id, el, i, kind]);
        }
        // for columns that have null values... if we dont, the table gets screwed up with diff cell lengths per row. 
        vtypes.push(col.type); // [string, number, datetime,...]

        // for making the shooting object keys
        vletter.push(col.id); // A,B,C...

        // VIS AddColumn() format e.g. ('string','Pizza','A'), ('number','Slices','B'),...;
        vdata.addColumn(col.type, col.label, col.id);
    }

    // handle VIS rows .c (column) and .v (value) 
    var vcolumns = [];
    for (i = 0; i < rows.length; i++) {
        if (kind == 'addMinimumValues') {
            //--SHOOTING--//
            var shooting = new Shooting();
            shootings.push(shooting);
        }
        if (rows[i] && rows[i] != null && rows[i].c) {
            var vcolumn = rows[i].c;
            var rowvalues = []; //values array
            var values = [];
            for (j = 0; j < vcolumn.length; j++) {
                var val = (vcolumn[j] && vcolumn[j] != null && vcolumn[j].v) ? vcolumn[j].v :
                (vtypes[j] == 'string') ? '' :
                (vtypes[j] == 'number') ? 0 :
                (vtypes[j] == 'boolean') ? false :
                (vtypes[j] == 'date' || vtypes[j] == 'datetime') ? new Date() : null;
                rowvalues.push(val);
                // making an object with column letter being the key. 'Shooting' Object can throw errors alerting the user 
                // to make the appropriate changes to this app or the sheet. Also easier to check if query is properly formed
                // when looking at o.loadMinimumValues() and o.addValues() methods
                var key = vletter[j];
                var obj = {
                    [key]: val
                }; //{A:'Welding shop shooting'},{B:'Miami, Florida'},...
                values.push(obj);
            }
            //send values to vcolumns
            vcolumns.push(rowvalues);

            //--MINIMUM VALUES NEEDED TO MAKE MARKERS,INFOWINDOWS--//
            if (kind == 'addMinimumValues') {
                shootings[i].loadMinimumValues(values, i);
            }
            //--THE REST OF THE VALUES AT CLICK LEVEL--//
            if (kind == 'addValues' || kind == 'cacheValues') {
                for (var j = 0; j < shootings.length; j++) {
                    if (shootings[j].getCasename() == values[0].A) {
                        //console.log('[DEV] Adding values to index: %s', j);
                        shootings[j].addValues(values);
                        if (kind == 'addValues') {
                            //only call fillCard() if adding values you want immediately viewable
                            fillCard(shootings[j]);
                        }
                        //console.log('[DEV]',shootings[j]);
                    }
                }
            }
        }
        //--SEND SHOOTING OBJ TO MAP, TO BE MADE INTO MARKERS--//
        if (kind == 'addMinimumValues') {
            populateMap(shootings[i]);
            //console.log('[DEV]',shootings[i]);
        }
    }
    // VIS addRows() format e.g. [['pepperoni',3,true,...],['olive',6,true,...],...]
    vdata.addRows(vcolumns);
    // now that the vdata is ready, load the datatable into charts
    // Note: each item in charts is tied to queries that redraws the map
    if (kind == 'addMinimumValues') {
        // we are getting 5 columns in our 'addMinimumValues' query; case[A],location[B],date[C],latitude[T],longitude[U]
        // you can exclude columns from the table data before its drawn
        if (g_mobilecheck()) {
            // in mobiles case, starting col: 1 (case), how many removed: 4 (location,date,latitude,longitude)
            vdata.removeColumns(1, 4)
        } else {
            // in desktops case, starting col: 2 (location), how many removed: 3 (date,latitude,longitude)
            vdata.removeColumns(2, 3);
        }
        table.loadData(vdata);
        //console.log('[DEV]',table);
    }
    if (kind == 'Histogram') {
        histogram.loadData(vdata);
        //console.log('[DEV]',histogram);
    }
    if (kind == 'PieChart' || kind == 'Filter') {
        for (i = 0; i < charts.length; i++) {
            if (el == charts[i].getContainerId()) {
                charts[i].loadData(vdata);
                //console.log('[DEV]',charts[i]);
            }
        }
    }
    // force the mobile layout css for charts, table and histogram by adding the mobile class
    if (g_mobilecheck()) {
        $('#charts,#table,#histogram').addClass('mobile');
    }
}

//************************************************************************************//
//END
//************************************************************************************//






// some of the rules to reading my methods
// s = string, a = array, t = targetEl, n = number, d = date, u = url, o = object, boolean = b
// inside methods a = 1st value(unless an array is being processed), b = 2nd value(unless boolean is being processed), 
// i = int, c = count
//************************************************************************************//
//START OBJECTS
//************************************************************************************//
//--SHOOTING OBJECT--//
//--called by drawMap()--//

function Shooting() {
    this.ready_ = false;
    this.query_ = false;
}
Shooting.prototype.loadMinimumValues = function(o, n) {
    if (this.ready_) return; //means its already been run

    this.index = n;

    //console.log(o[0].A);
    //console.log(o[1].B);
    //console.log(o[2].C);
    //console.log(o[3].T);
    //console.log(o[4].U);

    //querystring expected columns (5) A,B,C,T,U
    //o(object)[n(query order)].s(column ID)
    this.casename = o[0].A; // expected response = str (unique-id)
    this.setCity_(o[1].B); // expected response = str
    this.date = o[2].C; // expected response = long date
    this.latitude = o[3].T; // expected response = int
    this.longitude = o[4].U; // expected response = int

    this.setPosition(this.latitude, this.longitude);
    this.setFormatDate_(this.date);
    this.setInfoWindowContent_();
    this.setGmapsUrl_(this.GMAPSURL_);

    this.ready_ = true;
}
Shooting.prototype.addValues = function(o) {
    if (!this.ready_) return;

    // querystring expected columns and order (26) A,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,V,W,X,Y,Z,AA,AB,AC,AD
    // o(object)[n(query order)].s(column ID)
    //this.case <- dont use	here    = o[0].A; // str A (unique-id) already stored
    this.year = o[1].D; // str D
    this.summary = o[2].E; // str E
    this.fatalities = o[3].F; // int F
    this.injured = o[4].G; // int G
    this.total_victims = o[5].H; // int H
    this.venue = o[6].I; // str I
    this.mental_health_issues = o[7].J; // str J
    this.mental_health_details = o[8].K; // str K
    this.weapons_legal = o[9].L; // str L
    this.weapon_obtained = o[10].M; // str M
    this.weapons_types_arr = this.commaSepToArr_(o[11].N); // str N
    this.weapons_details_arr = this.commaSepToArr_(o[12].O); // str O
    this.news_sources_arr = this.semicolonSepToArr_(o[15].R); // str R
    this.mental_health_sources_arr = this.semicolonSepToArr_(o[16].S); // str S
    this.shooting_type = o[17].V; // str V
    this.state = o[18].W; // str W
    this.setConclusion_(o[19].X); // str X
    this.s1_name = o[20].Y; // str Y
    this.s1_age = o[21].Z; // str Z
    this.s2_name = o[22].AA; // str AA
    this.s2_age = o[23].AB; // str AB
    this.victim_list_arr = this.semicolonSepToArr_(o[24].AC); // str AC
    this.setCredit_(o[25].AD); // str AD
    this.image_arr = this.semicolonSepToArr_(o[26].AE); // str AE
    this.image_credit_arr = this.semicolonSepToArr_(o[27].AF); // str AF
    this.setRaces_(o[13].P, this.s2_name); // str P
    this.setGenders_(o[14].Q, this.s2_name); // str Q
    this.query_ = true;
    this.precacheImage_(this.image_arr);
}

//**Private Strings**//
Shooting.prototype.GVANAME_ = "Gun Violence Archive";
Shooting.prototype.GVAHREF_ = "http://www.gunviolencearchive.org/";
Shooting.prototype.GVATITLE_ = "Gun Violence Archive (GVA) is a not for profit corporation formed in 2013 to provide free online public access to accurate information about gun-related violence in the United States.";
Shooting.prototype.MOJONAME_ = "Mother Jones";
Shooting.prototype.MOJOHREF_ = "https://www.motherjones.com/politics/2012/12/mass-shootings-mother-jones-full-data/";
Shooting.prototype.MOJOTITLE_ = "Mother Jones (MOJO) is a reader-supported nonprofit news organization and the winner of the American Society of Magazine Editors\’ 2017 Magazine of the Year Award.";
Shooting.prototype.GMAPSURL_ = "https://www.google.com/maps/@";

//** Public **//
Shooting.prototype.fillCard = function() {
    fillCard(this)
}
Shooting.prototype.getPosition = function() {
    return this.position
}
Shooting.prototype.setPosition = function(lat, lng) {
    this.position = new google.maps.LatLng(lat, lng)
}
Shooting.prototype.getCasename = function() {
    return this.casename
}
Shooting.prototype.getInfoWindowContent = function() {
    return this.infowindowContent
}
Shooting.prototype.printAge = function(t, n) {
    if (n != undefined && n != '') {
        $(t).text('(' + n + '),')
    } else {
        $(t).text('')
    }
}
Shooting.prototype.printRefLinks = function(t, a) {
    if (a != undefined && a) {
        for (i = 0; i < a.length; i++) {
            var u = a[i];
            if (u.indexOf('http://') !== -1 || u.indexOf('https://') !== -1) {
                this.link_(t, u)
            }
        }
    }
}
Shooting.prototype.printImages = function(t, a1, a2) {
    if (a2 != undefined && a2) {
        for (i = 0; i < a2.length; i++) {
            var u = a2[i];
            var s = '';
            if (a1 != undefined && a1) s = '(' + a1[i] + ')';
            if (u.indexOf('http://') !== -1 || u.indexOf('https://') !== -1) {
                this.image_(t, s, u)
            }
        }
    }
}
Shooting.prototype.printListItems = function(t, a) {
    if (a != undefined && a.length) {
        for (i = 0; i < a.length; i++) {
            var b = a[i];
            if (b != '') {
                this.li_(t, b)
            }
        }
    }
}
Shooting.prototype.printTags = function(t, a, l, d, id) {
    if (a != undefined && a.length) {
        for (i = 0; i < a.length; i++) {
            var b = a[i];
            if (b != '') {
                this.printTag(t, b, l, d, id + i)
            }
        }
    }
}
Shooting.prototype.printTag = function(t, s, l, d, id) {
    if (!s) return '';
    s = this.cleanTagOfCount_(s).trim();
    var a = $('<span>').addClass('card-tag').addClass(d).attr({
            'id': id,
            'data-text': s,
            'data-col': l,
            'role': 'button',
            'tabindex': '1'
        }).css('background-color', this.getTagColor_(s, id)).text(this.properCase_(s));
    a.click(function() {
        var str = $(this).text();
        var text = $(this).attr('data-text');
        var col = $(this).attr('data-col');
        var id = $(this).attr('id');
        id = (id.indexOf('Weapon') != -1) ? id.substr(0, 6) : id;
        var color = str;
        if (id == 'Year' || id == 'State') {
            color = id
        }
        if (id == 'Type') {
            str = text
        };
        runQuery(g_queryStringMinimumValues + ' WHERE ' + col + ' CONTAINS "' + text + '"', getColorIndex(color));
        showFilterCardHandle(id + ' : ' + str)
    });
    a.appendTo(t);
    $('<span class="card-break"> </span>').appendTo(t)
}
Shooting.prototype.arrToStr = function(a) {
    if (a.length == -1) return;
    var b = '';
    for (i = 0; i < a.length; i++) {
        b += a[i].trim();
        if (i != a.length - 1) {
            b += ", "
        }
    }
    return b
}

//**Private**//
Shooting.prototype.precacheImage_ = function(a) {
    if (!a) return;
    $(function() {
        "use strict";
        $.each(a, function(i) {
            $("<img/>").attr("src", a[i])
        })
    })
}
//**Private**//
Shooting.prototype.getTagColor_ = function(s, id) {
    if (id == 'Year') {
        s = id
    }
    if (id == 'State') {
        s = id
    }
    return getColorHexByIndex(getColorIndex(s))
}
//**Private**//
Shooting.prototype.link_ = function(t, u) {
    var a = $('<a>').attr({
            'href': u,
            'target': '_blank'
        }).addClass('data-reflink').html('<i class="far fa-lg fa-newspaper"></i>');
    $(t).append(a)
}
//**Private**//
Shooting.prototype.image_ = function(t, s, u) {
    var a = $('<div>').addClass('card-image-frame');
    var b = $('<img>').attr({
            'src': u,
            'title': s
        }).addClass('data-image');
    b.appendTo(a);
    var c = $('<div>').addClass('data-image-credit').text(s);
    a.appendTo(t);
    c.appendTo(t)
}
//**Private**//
Shooting.prototype.li_ = function(t, s) {
    var a = $('<li>').addClass('data-item').text(s);
    a.appendTo(t)
}
//**Private**//
Shooting.prototype.setFormatDate_ = function(d) {
    if (!d) return;
    var d = new Date(d);
    this.formatdate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear()
}
//**Private**//
Shooting.prototype.setInfoWindowContent_ = function() {
    this.infowindowContent = '<div class="info-box"><span><div data-current-index="' + this.index + '" class="center info-text"><span>[' + (this.index + 1) + '/<span class="info-outof"></span>] <strong>' + this.casename + '</strong></span></div><div class="info-date"><span>' + this.formatdate + '</span></div></span><span role="button" tabindex="0" data-index="' + (this.index - 1) + '"class="info-prev">older <i class="fas fa-step-backward"></i></span><span role="button" tabindex="1" data-index="' + (this.index + 1) + '" class="info-next"><i class="fas fa-step-forward"></i> newer</span></div>'
}
//**Private**//
Shooting.prototype.setCredit_ = function(s) {
    if (!s) return;
    var a = (s == 'GVA') ? this.GVATITLE_ : this.MOJOTITLE_;
    this.credit_title = a;
    var b = (s == 'GVA') ? this.GVAHREF_ : this.MOJOHREF_;
    this.credit_href = b;
    var c = (s == 'GVA') ? this.GVANAME_ : this.MOJONAME_;
    this.credit_name = c;
}
//**Private**//
Shooting.prototype.setCity_ = function(s) {
    if (!s) return;
    var a = s.split(',');
    this.city = a[0].trim()
}
//**Private**//
Shooting.prototype.setGmapsUrl_ = function(s) {
    this.gmaps_url = s + this.latitude + "," + this.longitude + ",18z"
}
//**Private**//
Shooting.prototype.setGenders_ = function(s1, s2) {
    if (!s1) return;
    var a = this.commaSepToArr_(s1);
    if (a.length == 1 && s2 == '') {
        this.s1_gender = this.properCase_(a[0])
    } else if (a.length > 1 && s2 != '') {
        this.s1_gender = this.properCase_(a[0]);
        this.s2_gender = this.properCase_(a[1])
    } else if (a.length == 1 && s2 != '') {
        this.s1_gender = this.properCase_(a[0]);
        this.s2_gender = this.properCase_(a[0])
    }
}
//**Private**//
Shooting.prototype.setRaces_ = function(s1, s2) {
    if (!s1) return;
    var a = this.commaSepToArr_(s1);
    if (a.length == 1 && s2 == '') {
        this.s1_race = this.properCase_(a[0])
    } else if (a.length > 1 && s2 != '') {
        this.s1_race = this.properCase_(a[0]);
        this.s2_race = this.properCase_(a[1])
    } else if (a.length == 1 && s2 != '') {
        this.s1_race = this.properCase_(a[0]);
        this.s2_race = this.properCase_(a[0])
    }
}
//**Private**//
Shooting.prototype.setConclusion_ = function(s) {
    if (!s) return;
    var a = this.properCase_(s);
    this.conclusion = a
}
//**Private**//
Shooting.prototype.cleanTagOfCount_ = function(s) {
    if (s.indexOf('[')) {
        return s.split('[')[0]
    } else {
        return s
    }
}
//**Private**//
Shooting.prototype.semicolonSepToArr_ = function(s) {
    if (!s) return;
    var b = s.split('; ').join(';').split(' ;').join(';');
    return b.split(';')
}
//**Private**//
Shooting.prototype.commaSepToArr_ = function(s) {
    if (!s) return;
    var b = s.split(' and ').join(',').split(' &amp; ').join(',').split(' & ').join(',').split(';').join(',').split(', ').join(',').split(' ,').join(',');
    return b.split(',')
}
//**Private**//
Shooting.prototype.properCase_ = function(s) {
    if (!s) return;
    var a = '';
    a = s.charAt(0).toUpperCase() + s.slice(1);
    return a
}


//--TABLE OBJECT--//
//--called by drawMap()--//

function Table(opt) {
    this.titles = [];
    this.letters = [];
    this.colIndexs = [];
    this.histogramColumns = []; //histogram
    this.vis = {}; //Table, Histogram
    this.view = {}; //table histogram
    this.data = {}; //both
    this.chartOptions = opt || {}
}
Table.prototype.addValues = function(a, opt) {
    this.setTitles_(a[0]);
    this.setLetters_(a[1]);
    this.setContainerId_(a[2]);
    this.setColumnIndexs_(a[3]);
    this.setChartType_(a[4]);
    this.setOptions_(opt);
}
Table.prototype.loadData = function(o) {
    this.setData_(o);
    if (this.chartType == 'Table') {
        this.setView_();
        this.setTable_();
    }
    if (this.chartType == 'Histogram') {
        this.setHistogramColumns_(this.data);
        this.arrayToDataTable_();
        this.setHistogram_();
    }
    this.setListener_(this.vis);
    this.draw_();
}
//external call from click listener on infowindow
Table.prototype.setSelection = function(n) {
    this.vis.setSelection(n)
}
//**Private**//
Table.prototype.setData_ = function(o) {
    this.data = o
}
//**Private**//
Table.prototype.setView_ = function() {
    this.view = new google.visualization.DataView(this.data)
}
//**Private**//
Table.prototype.setTable_ = function() {
    this.vis = new google.visualization.Table(document.getElementById(this.containerId))
}
//**Private**//
Table.prototype.setListener_ = function(o) {
    google.visualization.events.addListener(o, 'select', function() {
        var n = null;
        $('#table tr').removeClass('google-visualization-table-tr-sel');
        try {
            n = o.getSelection()[0].row
        } catch (e) {
            closeCard()
        }
        google.maps.event.trigger(markers[n], 'click')
    })
}
//**Private**//
Table.prototype.setOptions_ = function(o) {
    if (this.chartOptions) return;
    this.chartOptions = o
}
//**Private**//
Table.prototype.setChartType_ = function(s) {
    if (this.chartType) return;
    this.chartType = s
}
//**Private**//
Table.prototype.setTitles_ = function(s) {
    s = this.replaceSpaces_(s);
    this.titles.push(s)
}
//**Private**//
Table.prototype.setContainerId_ = function(s) {
    if (this.containerId) return;
    this.containerId = s
}
//**Private**//
Table.prototype.setColumnIndexs_ = function(n) {
    this.colIndexs.push(n)
}
//**Private**//
Table.prototype.setLetters_ = function(s) {
    this.letters.push(s)
}
//**Private**//
Table.prototype.setHistogramColumns_ = function(o) {
    if (this.colIndexs.length != 2 || this.titles.length != 2) return;
    this.histogramColumns.push([this.titles[0], this.titles[1]]);
    for (var i = 0; i < o.getNumberOfRows(); i++) {
        var a = o.getValue(i, this.colIndexs[0]);
        var b = o.getValue(i, this.colIndexs[1]);
        this.histogramColumns.push([a, b])
    }
}
//**Private**//
Table.prototype.arrayToDataTable_ = function() {
    this.view = google.visualization.arrayToDataTable(this.histogramColumns)
}
//**Private**//
Table.prototype.setHistogram_ = function() {
    this.vis = new google.visualization.Histogram(document.getElementById(this.containerId))
}
//**Private**//
Table.prototype.replaceSpaces_ = function(s) {
    return s.split('_').join(' ')
}
//**Private**//
Table.prototype.draw_ = function() {
    this.vis.draw(this.view, this.chartOptions)
}


//--CHART OBJECT--//
//--called by drawChart()--//

function Chart(opt) {
    this.pivotColumn = [];
    this.data = {};
    this.wrapper = {};
    this.pivotData = {};
    this.chartOptions = opt || {};
}
Chart.prototype.addValues = function(a, opt) {
    this.setTitle_(a[0]);
    this.setLetter_(a[1]);
    this.setContainerId_(a[2]);
    this.setColumnIndex_(a[3]);
    this.setChartType_(a[4]);
    this.setOptions_(opt);
}
Chart.prototype.loadData = function(o) {
    this.setData_(o);
    this.setPivotColumn_();
    if (this.chartType == 'PieChart') {
        this.setPivotData_();
        this.pivotData.addColumn('string', this.title, this.letter);
        this.pivotData.addColumn('number', 'Count', 'XX');
        this.pivotData.addRows(this.pivotColumn);
        this.setWrapper_();
        this.wrapper.setOptions(this.chartOptions);
        this.setListener_(this.wrapper);
        this.draw_();
    }
    if (this.chartType == 'Filter') {
        for (var i = 0; i < this.pivotColumn.length; i++) {
            var a = this.pivotColumn[i];
            //console.log('[DEV] adding count of %s to filter %s', values[1], values[0]);
            showFilterSelections(this.letter, a[0], a[1], this.containerId);
        }
    }
}
Chart.prototype.getContainerId = function() {
    return this.containerId
}
//**Private**//
Chart.prototype.setOptions_ = function(o) {
    if (this.chartOptions) return;
    this.chartOptions = o
}
//**Private**//
Chart.prototype.setChartType_ = function(s) {
    if (this.chartType) return;
    this.chartType = s
}
//**Private**//
Chart.prototype.setTitle_ = function(s) {
    if (this.title) return;
    this.title = this.replaceSpaces_(s)
}
//**Private**//
Chart.prototype.setContainerId_ = function(s) {
    if (this.containerId) return;
    this.containerId = s
}
//**Private**//
Chart.prototype.setColumnIndex_ = function(n) {
    if (this.colIndex) return;
    this.colIndex = n
}
//**Private**//
Chart.prototype.setLetter_ = function(s) {
    if (this.letter) return;
    this.letter = s
}
//**Private**//
Chart.prototype.setData_ = function(o) {
    this.data = o
}
//**Private**//
Chart.prototype.getData_ = function() {
    return this.data
}
//**Private**//
Chart.prototype.setPivotColumn_ = function() {
    this.pivotColumn = this.getSums_(this.getData_(), this.colIndex, this.getDistinctValues_())
}
//**Private**//
Chart.prototype.getSums_ = function(o, n, a) {
    var b = [];
    for (var i = 0; i < a.length; i++) {
        var c = 0;
        for (var j = 0; j < o.getNumberOfRows(); j++) {
            if (o.getValue(j, n) == a[i]) {
                c++
            }
        }
        b.push([a[i].toString(), c])
    }
    return b
}
//**Private**//
Chart.prototype.getDistinctValues_ = function() {
    var a = this.getData_().getDistinctValues(this.colIndex);
    return a
}
//**Private**//
Chart.prototype.replaceSpaces_ = function(s) {
    return s.split('_').join(' ')
}
//**Private**//
Chart.prototype.setWrapper_ = function(o) {
    this.wrapper = new google.visualization.ChartWrapper({
            'chartType': this.chartType,
            'dataTable': this.pivotData,
            'containerId': this.containerId
        })
}
//**Private**//
Chart.prototype.setPivotData_ = function() {
    this.pivotData = new google.visualization.DataTable()
}
//**Private**//
Chart.prototype.setListener_ = function(o) {
    google.visualization.events.addListener(o, 'select', function() {
        var a = o.getDataTable();
        var b = o.getChart();
        var n = (b.getSelection()[0] != undefined) ? b.getSelection()[0].row : null;
        var title = a.getColumnLabel(0);
        var letter = a.getColumnId(0);
        if (n === null) return;
        var value = a.getValue(n, 0);
        var s = title + ' : ' + value;
        var q = g_queryStringMinimumValues + ' WHERE ' + letter + ' = "' + value + '"'; /*console.log('[DEV] Filter On: %s: %s, %s',title, value,q);*/
        runQuery(q, n);
        showFilterCardHandle(s)
    })
}
//**Private**//
Chart.prototype.draw_ = function() {
    this.wrapper.draw()
}
//************************************************************************************//
//END OBJECTS
//************************************************************************************//





//************************************************************************************//
//START MAP STUFF
//************************************************************************************/
//--POPULATE MAP--//	

function populateMap(o) {
    var svg = targetShapeSvgUri();
    var icon = {
        url: svg,
        size: new google.maps.Size(25, 25),
        anchor: new google.maps.Point(12, 13),
        scaledSize: new google.maps.Size(25, 25)
    };
    var pos = o.getPosition();
    var m = new google.maps.Marker({
            'position': pos,
            'map': map,
            'icon': icon,
            'zIndex': 1
        });
    bounds.extend(pos);
    map.fitBounds(bounds);
    markers.push(m);
    markerclusterer.addMarker(m);
    var cn = o.casename;
    setMouseoverListener(o, m, cn);
    setMouseoutListener(o, m);
    setClickListener(o, m, cn, pos);
}
//--SET MOUSE OVER LISTENER--//

function setMouseoverListener(o, m, cn) {
    mouseover = google.maps.event.addListener(m, 'mouseover', function(e) {
        document.getElementById('search-searchboxinput').value = cn;
        if (map.getZoom() < 12) {
            m.setTitle(cn + ' (Zoom to city level)')
        } else if (map.getZoom() >= 12) {
            m.setTitle(cn + ' (Click for details)')
        }
    });
}
//--SET MOUSE OUT LISTENER--//

function setMouseoutListener(o, m) {
    mouseout = google.maps.event.addListener(m, 'mouseout', function(e) {
        document.getElementById('search-searchboxinput').value = ""
    });
}
//--SET CLICK LISTENER--//

function setClickListener(o, m, cn, pos) {
    click = google.maps.event.addListener(m, 'click', function(e) {
        document.getElementById('search-searchboxinput').value = cn;
        m.setTitle(cn);
        var iwc = o.getInfoWindowContent();
        infowindow.setContent(iwc);
        if (map.getZoom() < 12) {
            map.panTo(pos);
            zoom(13);
        } else if (map.getZoom() >= 12) {
            handleUp();
            map.panTo(pos);
            addActiveMarker(pos);
            zoom(18);
            //infowindow opens at zoom = 18
            if (!o.query_) {
                //firsttime through
                var q = g_queryStringAddValues + 'A = "' + cn + '" LIMIT 1';
                runQuery(q, g_colorNum, 'addValues');
            } else {
                o.fillCard();
            }
            preCache(o.index);
        }
    });
    //console.log('[DEV]',o);
}
//--FILL CARD --//

function fillCard(o) {
    //title
    $('.data-cc').attr({
            'title': o.credit_title,
            'href': o.credit_href
        }).text('Data Credit: ' + o.credit_name);
    $('.data-fatalities').text(o.fatalities + ' Killed');
    if (parseInt(o.injured) > 0) {
        $('.data-injured').text(', ' + o.injured + ' Injured');
    }
    $('.data-location').text(o.city + ', ' + o.state);
    $('.data-date').text(o.formatdate);

    // tags
    //target el('leading dot or hash'),string,letter,class('no '.')
    o.printTag('.card-tags', o.year, 'D', 'data-year', 'Year');
    o.printTag('.card-tags', o.state, 'W', 'data-state', 'State');
    o.printTag('.card-tags', o.venue, 'I', 'data-venue', 'Venue');
    o.printTag('.card-tags', o.shooting_type, 'V', 'data-shooting-type', 'Type');
    //alter the text after it has been added
    $('.data-shooting-type').text(o.shooting_type);
    o.printTag('.card-tags', o.s1_race, 'P', 'data-race', 'Race');
    o.printTag('.card-tags', o.s1_gender, 'Q', 'data-gender', 'Gender');
    //target el('leading dot or hash'),array,letter,class(no '.')
    o.printTags('.card-tags', o.weapons_types_arr, 'N', 'data-weapon', 'Weapon');
    // image
    if (o.image_arr) {
        $('.card-carousel').removeClass('hide');
        o.printImages('.card-carousel', o.image_credit_arr, o.image_arr);
    } else {
        $('.card-carousel').addClass('hide');
    }
    // casename
    $('.data-casename').html(o.casename);
    //summary
    $('.data-incident-summary').text(o.summary);
    //news links
    o.printRefLinks('.card-news-sources', o.news_sources_arr);
    //victims list
    o.printListItems('.card-victim-list', o.victim_list_arr);

    //shooter 1
    $('.data-shooter1-name').text(o.s1_name);
    o.printAge('.data-shooter1-age', o.s1_age);
    $('.data-shooter1-gender').text(o.s1_gender);
    $('.data-shooter1-race').text(o.s1_race);
    $('.data-incident-ended').text(o.conclusion);
    //shooter 2
    if (o.s2_name != '') {
        $('.data-shooter-plural').text('s');
        $('.card-shooter2-details').addClass('show').removeClass('hide');
        $('.data-shooter2-name').text(o.s2_name);
        o.printAge('.data-shooter2-age', o.s2_age);
        $('.data-shooter2-gender').text(o.s2_gender);
        $('.data-shooter2-race').text(o.s2_race);
    } else {
        $('.card-shooter2-details').removeClass('show').addClass('hide');
    }
    // mental health
    $('.data-mental-health-issues').text(o.mental_health_issues);
    $('.data-mental-health-details').text(o.mental_health_details);
    // mental health links
    o.printRefLinks('.card-mental-health-sources', o.mental_health_sources_arr);
    if (o.mental_health_details) {
        $('.card-mental-history-details').addClass('show').removeClass('hide');
    }
    //weapons
    $('.data-weapons-legal').text(o.weapons_legal);
    $('.data-weapons-obtained').text(o.weapon_obtained);
    if (o.weapons_types_arr) {
        $('.data-weapons-type-list').text(o.arrToStr(o.weapons_types_arr));
    }
    if (o.weapons_details_arr) {
        $('.data-weapons-makes-models-manufacturers').text(o.arrToStr(o.weapons_details_arr));
    }

    $('.gmaps').attr('href', o.gmaps_url);
    endOfFill();
}

//************************************************************************************//
//END MAP STUFF
//************************************************************************************//

// MAP READY - INIT
google.maps.event.addDomListener(window, 'load', initMap);

//************************************************************************************//
//DOCUMENT READY
//************************************************************************************//
$(document).ready(function() {
    $('#menu').mmenu({
            //options
            counters: {
                add: false,
                addTo: 'panels .filter',
                count: false
            },
            offCanvas: {
                moveBackground: false
            },
            setSelected: {
                hover: true
            },
            extensions: {
                all: [
                    'theme-white',
                    'border-offset',
                    'position-front',
                    'shadow-page'
                ]
            },
            navbar: {
                title: '<span id="logo" class="fa-layers fa-fw">' + '<i class="fas fa-circle" style="color:white"></i>' + '<i class="fas fa-bullseye" style="color:#e51c23"></i>' + '</span>' + '<span>US Mass Shootings</span>' + '<div><span>1982-2018</span></div>'
            },
            navbars: [{
                    position: 'top'
                }, {
                    position: 'bottom',
                    content: [
                        '<a class="reset-map"><i class="fas fa-lg fa-fw fa-undo"></i> Reset Map</a>',
                        '<a id="my-location" class="hide"><i class="fas fa-lg fa-fw fa-street-view"></i> Near Me</a>'
                    ]
                }
            ],
            onClick: {
                close: true
            }
        }, {
            // configuration
            offCanvas: {
                pageSelector: '#mmwrapper'
            },
            classNames: {
                // here for example
            }
        }).removeClass('invisible');

    // load the api as object so we can use some of the commands
    //http://mmenu.frebsite.nl/documentation/core/api.html
    var API = $('#menu').data('mmenu');

    // default open the menu
    API.open();

    // this works to open a particular panel, like a filter or terms
    //API.openPanel( $('#filter-state') );

    // click listener to open menu
    $('.hamburger').click(function(e) {
        e.preventDefault();
        API.open();
    });

    // back (currently unused)
    $('.menu-back').click(function(e) {
        e.preventDefault();
        API.closeAllPanels();
    });

    // reset map click
    $('.reset-map').click(function(e) {
        e.preventDefault();
        runQuery();
        API.close();
        API.closeAllPanels();
    });

    // x on search bar, card
    $('.close').on('click', closeCard);

    // used in mmenu to prevent the page from interpreting a link as submenu choice
    $('.a').attr({
            role: 'button',
            tabindex: 0
        }).click(function() {
            var url = $(this).attr('data-href');
            var target = $(this).attr('data-target');
            window.open(url, target);
        });
    // gets rid of the space at the bottom of screen when the address bar is hidden
    $(window, document, 'body').off('resize').on('resize', function() {
        scrollSize();
    });
}); //end doc ready
