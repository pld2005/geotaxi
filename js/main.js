document.addEventListener("deviceready", onDeviceReady, false);
// Cordova is loaded and it is now safe to make calls Cordova methods
//
    function onDeviceReady() {
        $.support.cors = true;
        $.mobile.allowCrossDomainPages = true;
        //navigator.notification.alert('Dispositivo listo!');

    }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    
var connected = false;
var usuario ={
    id : 0,
    matricula : '',
    pass : ''
}
var viajeActual;
var socket;

socket = io.connect("http://190.221.243.139:3000");
socket.heartbeatTimeout = 30000;

socket.on('message', function(msg) {
    appendNewMessage(msg);
});

socket.on('welcome', function(msg) {
    connected=true;
    /*setFeedback("<span style='color: green'> Username available. You can begin chatting.</span>");
    setCurrentUsers(msg.currentUsers)
    enableMsgInput(true);
    enableUsernameField(false);*/
});

socket.on('error', function(msg) {
    if (msg.userNameInUse) {
        connected = false;
        alert("Username already in use. Try another name");
    }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function setUsername() {
        usuario.id = $("#usuario").val();
        usuario.matricula = $("#matricula").val();
        usuario.pass = $("#password").val();



        //myUserName = usuario.id;
        socket.emit('set username', 
                    usuario, 
                    function(data) { 
                        console.log('emit set username', data); 
                    });
        console.log('Set user name as ' + usuario.id);
    }

    function sendStatus(status) {
    

        socket.emit('sendStatus', 
            {
              "inferSrcUser": true,
              "source": usuario.id,
              "message": status.message,
              "target": "All"
            });

}

    function appendNewMessage(msg) {  //-----------------------------------RECIBE MENSAJES --------------------------------------------------
        var html;
        if (msg.target == "All") {
            //si el mensaje es publico
            console.log ("<span class='allMsg'>" + msg.source + " : " + msg.message + "</span><br/>")


               

        } else {
            // el mensaje es privado
            if (msg.tipomessage == "V") {
                //es un viaje
                viajeActual = msg
                $.mobile.changePage('aceptaviaje.html', {transition: 'pop', role: 'dialog'});
            }else{
                //es un mensaje
            }
            console.log("<span class='privMsg'>" + msg.source + " (P) : " + msg.message + "</span><br/>")
            
        }
        
    }


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('pageinit', '#page_login',  function(){
        $("#btnentrar").click(function(e) {
            //login 
            setUsername();
            e.stopPropagation();
            e.stopped = true;
            e.preventDefault();
            $.mobile.changePage("main1.html",{transition: "slide"})
        });

//$.mobile.ajaxLinksEnabled = false;
    });


//////////////////////////////////////////////////////////////////////////////// menu slide touch //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $(document ).on( "swipeleft swiperight", "#page_main", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swipeleft"  ) {
                $( "#right-panel" ).panel( "open" );
            } else if ( e.type === "swiperight" ) {
                $( "#left-panel" ).panel( "open" );
            }
        }
    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('pageinit', '#page_main',  function(){

        $("#btnocupado").addClass('ocultar');
        $("#panelenproceso").addClass('ocultar');

        $("#btnlibre").on('click',function(){
            sendStatus({"message":"OCUPADO"});

            $("#btnlibre").addClass('ocultar');
            $("#btnocupado").removeClass('ocultar');
        });

        $("#btnocupado").on('click',function(){
            sendStatus({"message":"LIBRE"});

            $("#btnocupado").addClass('ocultar');
            $("#btnlibre").removeClass('ocultar');
        });


        var posini = { 'center': '-32.890615,-68.8484', 'zoom': 10 };

        var image = new google.maps.MarkerImage('img/marker.png',
        new google.maps.Size(38, 50),
        new google.maps.Point(0,0),
        new google.maps.Point(16, 50));

        $('#map_canvas').gmap({
            'center': posini.center, 
            'zoom': posini.zoom, 
            'disableDefaultUI':true, 
            'callback': function(map) {
                var self = this;
                var options = {enableHighAccuracy:true, maximumAge:30000, timeout: 30000 };

                watchID = navigator.geolocation.watchPosition(function(position) {
                    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    if (!self.get('markers').client) {
                        self.addMarker({'id': 'client', 
                                        'position': latlng, 
                                        'bounds': true,
                                        'icon': image });
                    } else {
                        sendStatus({"message": actualizaReloj() + " " + latlng.lat + " " + latlng.lng});
                        self.get('markers').client.setPosition(latlng);
                        map.panTo(latlng);
                    }
                }, function(error){
                    alert("x" + error.code);
                }, options);
            }
        });


    });

function actualizaReloj(){ 
 
/* Capturamos la Hora, los minutos y los segundos */
marcacion = new Date() 
 
/* Capturamos la Hora */
Hora = marcacion.getHours() 
 
/* Capturamos los Minutos */
Minutos = marcacion.getMinutes() 
 
/* Capturamos los Segundos */
Segundos = marcacion.getSeconds() 
 
/* Si la Hora, los Minutos o los Segundos
Son Menores o igual a 9, le añadimos un 0 */
 
if (Hora<=9)
Hora = "0" + Hora
 
if (Minutos<=9)
Minutos = "0" + Minutos
 
if (Segundos<=9)
Segundos = "0" + Segundos

return  Hora + ":" + Minutos + ":" + Segundos
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $(document).on('pageinit', "#page_aceptaviaje",  function(){

        if(viajeActual) {
            $("#viajemessage").html(viajeActual.message);
            $("#tpoarrivo>span").html(viajeActual.viaje.tiempoarrivo);
            
        };

        $("#btnaceptaviaje").on('click',function(){
            sendStatus({"message":"ACEPTA VIAJE"});
            $("#panelenproceso").removeClass('ocultar');
            $("#btnocupado").addClass('ocultarbtn');
            $("#btnlibre").removeClass('ocultar');
        });

        JBCountDown({
            secondsColor : "#ff6565",
            secondsGlow  : "none",
            seconds     : "100"
        });

        function JBCountDown(settings) {
            var glob = settings;
           
            function deg(deg) {
                return (Math.PI/180)*deg - (Math.PI/180)*90
            }
            
           
            
            var clock = {
                set: {
                    seconds: function(){
                        var cSec = $("#canvas_seconds").get(0);
                        var ctx = $("#canvas_seconds").get(0).getContext("2d");
                        ctx.clearRect(0, 0, cSec.width, cSec.height);
                        ctx.beginPath();
                        ctx.strokeStyle = glob.secondsColor;
                        
                        ctx.shadowBlur    = 2;
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.shadowColor = glob.secondsGlow;
                        
                        ctx.arc(16,16,14, deg(0), deg(3.8*glob.seconds));
                        ctx.lineWidth = 3;
                        ctx.stroke();
                
                        var sec = Math.round(glob.seconds / 10);
                        
                        $(".clock_seconds .val").text(sec);

                    }
                },
                start: function(){
                    /* Seconds */
                    glob.seconds = 100;
                    console.log(glob.seconds);
                    var cdown = setInterval(function(){
                        if ( glob.seconds == 0) {
                            clearInterval(cdown);
                            glob.seconds = 100;
                            $("#page_aceptaviaje").dialog("close");
                            return;
                        }
                        glob.seconds--;
                        
                        clock.set.seconds();
                    },100);
                }
            }
            clock.set.seconds();

            clock.start();
        }
    });












/*
        $('#myModal').on('show', function (e) {
            navigator.notification.beep(3); //play sonido

            $("#viaje").html(viaje);
            
            percent = 100;
            $('.progress .bar:first').width(percent+'%');
            $('.progress .bar:first').text(percent/10+' seg.');
            progressInterval = setInterval( function(){
                if(percent > 0) {
                    percent=percent-10;
                    $('.progress').addClass('progress-striped').addClass('active');
                    $('.progress .bar:first').removeClass().addClass('bar')
                    .addClass ( (percent < 40) ? 'bar-danger' : ( (percent < 80) ? 'bar-warning' : 'bar-success' ) ) ;
                    $('.progress .bar:first').width(percent+'%');
                    console.log(percent/10);
                    $('.progress .bar:first').text(percent/10+' seg.');
                } else {
                     $("#myModal").modal('hide');
                }
            }, 1000 );

            $("#btnaceptar").bind('click', function () {
                $("#myModal").modal('hide');
            });
        });

        $('#myModal').on('hide', function(e) {
            clearInterval(progressInterval);
            console.log('cancelado');
        });

        $("#btntestmsj").click(function(){
            socket.emit('sendchat', "hola mundo");
        });
    
    });*/



        


