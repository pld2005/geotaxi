document.addEventListener("deviceready", onDeviceReady, false);
var idusr='';
// Cordova is loaded and it is now safe to make calls Cordova methods
//
function onDeviceReady() {
	$.support.cors = true;
	$.mobile.allowCrossDomainPages = true;
	//navigator.notification.alert('Dispositivo listo!');
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$(document).ready(function () {

    $("#btnentrar").click( function(e){
        i=$("#inputUsuario").val();
        m=$("#inputMatricula").val();
        p=$("#inputPassword").val();
        document.location.href='main.html?i='+i+'&m='+m+'&p='+p;
    });



});
/*

*/
