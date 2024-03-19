var i = 0,
minimizedWidth = new Array,
minimizedHeight = new Array,
windowTopPos = new Array,
windowLeftPos = new Array,
panel,
id;

NUMBER_OF_BG = 42;


function adjustFullScreenSize() {
	$(".fullSizeWindow .wincontent").css("width", (window.innerWidth - 32));
	$(".fullSizeWindow .wincontent").css("height", (window.innerHeight - 98));
}
function makeWindowActive(thisid) {
	$(".window").each(function() {      
		$(this).css('z-index', $(this).css('z-index') - 1);
		
	});
	$("#window" + thisid).css('z-index',1000);
	$(".window").removeClass("activeWindow");
	$("#window" + thisid).addClass("activeWindow");
	
	$(".taskbarPanel").removeClass('activeTab');
	
	$("#minimPanel" + thisid).addClass("activeTab");
}



function minimizeWindow(id){
    windowTopPos[id] = $("#window" + id).css("top");
    windowLeftPos[id] = $("#window" + id).css("left");

    $("#window" + id).animate({
        top: 800,
        left: 0,
        opacity: 0, // animate opacity to 0
    }, 200, function() {
        $("#window" + id).addClass('minimizedWindow');
        $("#minimPanel" + id).addClass('minimizedTab');
        $("#minimPanel" + id).removeClass('activeTab');
    }); 
}

function openMinimized(id) {
    $('#window' + id).removeClass("minimizedWindow");
    $('#minimPanel' + id).removeClass("minimizedTab");
    makeWindowActive(id);
    
    $('#window' + id).css({
        opacity: 1 // reset opacity to 1
    }).animate({
        top: windowTopPos[id],
        left: windowLeftPos[id]
    }, 200, function() {
    }); 
}


function openWindow(id) {
    if ($('#window' + id).hasClass("closed")) {
        makeWindowActive(id);
        $("#window" + id).removeClass("closed");
        $("#minimPanel" + id).removeClass("closed");
        centerWindow(id);
    } else if ($('#window' + id).hasClass("minimizedWindow")) {
        openMinimized(id);
    } else {    
        makeWindowActive(id);
    }
}
function closeWindow(id) {
	$("#window" + id).addClass("closed");
	$("#minimPanel" + id).addClass("closed");
}

function centerWindow(id) {
	var windowWidth = $("#window" + id).outerWidth();
	var windowHeight = $("#window" + id).outerHeight();
	var windowTop = (window.innerHeight - windowHeight) / 2;
	var windowLeft = (window.innerWidth - windowWidth) / 2;
	
	$("#window" + id).css({
		top: windowTop + 'px',
		left: windowLeft + 'px'
	});
}


function changeBg() {
    var randomNumber = Math.floor(Math.random() * NUMBER_OF_BG) + 1; 
    var selectedImage = randomNumber + '.jpg'; 

	console.log(randomNumber);

    document.body.style.backgroundImage = 'url(bg/' + selectedImage + ')'; 
	document.body.style.backgroundSize = 'cover';  
}


$(document).ready(function(){

	changeBg();

	var time = document.getElementById("time");
    var day = document.getElementById("day");
    var midday = document.getElementById("midday");

    var clock = setInterval(
        function calcTime() {
            var date_now = new Date();
            var hr = date_now.getHours();
            var min = date_now.getMinutes();
            var sec = date_now.getSeconds();
            var middayValue = "AM";
            var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        
            day.textContent = days[date_now.getDay()];

            middayValue = (hr >= 12) ? "PM" : "AM";

            if(hr == 0){
                hr = 12;
            }
            else if(hr > 12){
                hr-=12;
            }

            hr = (hr < 10) ? "0" + hr : hr;
            min = (min < 10) ? "0" + min : min;
            sec = (sec < 10) ? "0" + sec : sec;

            time.textContent = hr + ":" + min + ":" + sec;
            midday.textContent = middayValue;
        },
        1000
	
	);

	$(".window").each(function() {    
		
		$(this).css('z-index',1000)
		$(this).attr('data-id', i);
		minimizedWidth[i] = $(this).width();
		minimizedHeight[i] = $(this).height();

		windowTopPos[i] = $(this).css("top");
		windowLeftPos[i] = $(this).css("left");
		$("#taskbar").append('<div class="taskbarPanel" id="minimPanel' + i + '" data-id="' + i + '">' + $(this).attr("data-title") + '</div>');
		if ($(this).hasClass("closed")) {	$("#minimPanel" + i).addClass('closed');	}		
		$(this).attr('id', 'window' + (i++));
		$(this).wrapInner('<div class="wincontent"></div>');
		$(this).prepend('<div class="windowHeader"><strong>' + $(this).attr("data-title") + '</strong><span title="Minimize" class="winminimize"><span></span></span><span title="Maximize" class="winmaximize"><span></span><span></span></span><span title="Close" class="winclose"></span></div>');

	});
	
	$("#minimPanel" + (i-1)).addClass('activeTab');
	$("#window" + (i-1)).addClass('activeWindow');
	
	$( ".wincontent" ).resizable();		
	
	$( ".window" ).draggable({ cancel: ".wincontent" });
	

    $(".window").mousedown(function(){	
		makeWindowActive($(this).attr("data-id"));
    });
	
    $(".winclose").click(function(){	
		closeWindow($(this).parent().parent().attr("data-id"));
    });	

    $(".winminimize").click(function(){		
		minimizeWindow($(this).parent().parent().attr("data-id"));
    });	
	
	$(".taskbarPanel").click(function(){	
		id = $(this).attr("data-id");
		if ($(this).hasClass("activeTab")) {	
			minimizeWindow($(this).attr("data-id"));
		} else {
			if ($(this).hasClass("minimizedTab")) {
				openMinimized(id);
			} else if (!$("#window" + id).hasClass("minimizedWindow") && !$("#window" + id).hasClass("closed")) { // if window is not minimized and not closed
				minimizeWindow(id);
			} else {								
				makeWindowActive(id);
			}
		}
	});
	
	
    $(".openWindow").click(function(){		
		openWindow($(this).attr("data-id"));
    });
	
	$(".winmaximize").click(function(){
		var id = $(this).parent().parent().attr("data-id");
		if ($(this).parent().parent().hasClass('fullSizeWindow')) {	// minimize
			$(this).parent().parent().removeClass('fullSizeWindow');
			$(this).parent().parent().children(".wincontent").height(minimizedHeight[id]);	
			$(this).parent().parent().children(".wincontent").width(minimizedWidth[id]);
			$(this).parent().parent().css({ 
				top: windowTopPos[id],
				left: windowLeftPos[id]
			});
		} else {	// maximize
			windowTopPos[id] = $(this).parent().parent().css("top");
			windowLeftPos[id] = $(this).parent().parent().css("left");
			$(this).parent().parent().addClass('fullSizeWindow');
			minimizedHeight[id] = $(this).parent().parent().children(".wincontent").height();
			minimizedWidth[id] = $(this).parent().parent().children(".wincontent").width();
			adjustFullScreenSize();
		}
	});
	
	$("#changeBg").click(function() {
		changeBg();
	});
	

	adjustFullScreenSize();	
	centerWindow(0);

});