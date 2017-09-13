// import jquery, typeit,....

script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';
script.src = 'https://cdn.jsdelivr.net/jquery.typeit/4.4.0/typeit.min.js';
script.type = 'text/javascript';





function map_init() {
                // Basic options for a simple Google Map
                // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
                var mapOptions = {
                    // How zoomed in you want the map to start at (always required)
                    zoom: 11,

                    // The latitude and longitude to center the map (always required)
                    center: new google.maps.LatLng(51.509865, -0.118092), // UK 

                    // How you would like to style the map. 
                    // This is where you would paste any style found on Snazzy Maps.
                    styles: [{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"weight":1}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"weight":0.8}]},{"featureType":"landscape","stylers":[{"color":"#ffffff"}]},{"featureType":"water","stylers":[{"visibility":"off"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"elementType":"labels","stylers":[{"visibility":"off"}]},{"elementType":"labels.text","stylers":[{"visibility":"on"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#000000"}]},{"elementType":"labels.icon","stylers":[{"visibility":"on"}]}]
                };

function dynamic_word() { 
                             typeIt({
                             strings: ["&nbsp; Data Science background", "&nbsp; and data scientist / python developer", "&nbsp;looking for DATA JOBS"],
                             speed: 100,
                             breakLines: false,
                             loop:true,
                             breakDelay:2500,
                             startDelay:300,
                             loopDelay:2500
                        });}


