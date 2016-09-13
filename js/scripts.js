var runningMode;
var endTime = undefined;
var positions;
var digits = {}; // This object will hold the digit elements
var digitToName = "zero one two three four five six seven eight nine".split(" "); // Map digits to their names (this will be an array)
var timer;
var time = {
	totalMiliSec: 0,
    h1: 0,
    h2: 0,
    m1: 0,
    m2: 0,
	s1: 0,
	s2: 0
};

var beep = new Audio("https://github.com/potsang/MyResourceFiles/blob/master/error.ogg?raw=true");

function setRemainingTime(t) {
	var seconds = Math.floor( (t/1000) % 60 );
	var minutes = Math.floor( (t/1000/60) % 60 );
	var hours = Math.floor( (t/(1000*60*60)) % 24 );
	
	var hours1 = 0,hours2 = 0,minutes1 = 0,minutes2 = 0,seconds1 = 0,seconds2 = 0;
	if (hours < 10)
		hours2 = hours;
	else {
		hours1 = Math.floor(hours/10);
		hours2 = hours % 10;
	}

	if (minutes < 10)
		minutes2 = minutes;
	else {
		minutes1 = Math.floor(minutes/10);
		minutes2 = minutes % 10;
	}

	if (seconds < 10)
		seconds2 = seconds;
	else {
		seconds1 = Math.floor(seconds/10);
		seconds2 = seconds % 10;
	}
	
	time.totalMiliSec = t;
	time.h1 = hours1;
	time.h2 = hours2;
	time.m1 = minutes1;
	time.m2 = minutes2;
	time.s1 = seconds1;
	time.s2 = seconds2;
}

$(document).ready(function(){
	runningMode = "Session";
	initTime(parseInt($("#session-input").val()));
});

function initTime(timeInMinutes) {
	var timeInMiliSecs = timeInMinutes*60*1000;
	setRemainingTime(timeInMiliSecs);

	var clock = $('#clock');

	// Positions for the hours, minutes, and seconds
	if (time.h1 == 0 && time.h2 == 0)
		positions = ['m1', 'm2', ':', 's1', 's2'];
	else
		positions = ['h1', 'h2', ':', 'm1', 'm2', ':', 's1', 's2'];

	// Generate the digits with the needed markup,
	// and add them to the clock
	var digitHolder = clock.find('.digits');
	digitHolder.html("");
	
	$.each(positions, function(){

		if(this == ':'){
			digitHolder.append('<div class="dots">');
		}
		else{

			var pos = $('<div>');

			for(var i=1; i<8; i++){
				pos.append('<span class="d' + i + '">');
			}

			// Set the digits as key:value pairs in the digits object
			digits[this] = pos;

			// Add the digit elements to the page
			digitHolder.append(pos);
		}

	});
	
	updateClockDisplay();
}

function updateClockDisplay() {
	if (positions.length == 8) {
		digits.h1.attr('class', digitToName[time.h1]);
		digits.h2.attr('class', digitToName[time.h2]);	
	}
	digits.m1.attr('class', digitToName[time.m1]);
	digits.m2.attr('class', digitToName[time.m2]);
	digits.s1.attr('class', digitToName[time.s1]);
	digits.s2.attr('class', digitToName[time.s2]);
}

function isChangingMode() {
	if (time.h1 == 0 && time.h2 == 0 && time.m1 == 0 && time.m2 == 0 && time.s1 == 0 && time.s2 == 0) {
		if (runningMode == "Session") {
			runningMode = "Break";
			$("#mode").html(runningMode);
			initTime(parseInt($("#break-input").val()));
			updateEndTime();
		} else if (runningMode == "Break") {
			runningMode = "Session";
			$("#mode").html(runningMode);
			initTime(parseInt($("#session-input").val()));
			updateEndTime();			
		}
		
		beep.play();
		
		return true;
	}
	
	return false;
}

function updateTime() {
	if (isChangingMode())
		return;
		
	var t = Date.parse(endTime) - Date.parse(new Date());
	setRemainingTime(t);		

	updateClockDisplay();
}

function updateEndTime() {
	var currentTime = Date.parse(new Date());
	endTime = new Date(currentTime + time.totalMiliSec);
}

function changeBtnToPause() {
	$("#btn-play-pause").attr("value", "pause");
	$("#span-play-pause").removeClass("glyphicon-play");
	$("#span-play-pause").addClass("glyphicon-pause");
	$(".break-control").attr("disabled", true);
	$(".session-control").attr("disabled", true);
}

function changeBtnToPlay() {
	$("#btn-play-pause").attr("value", "play");
	$("#span-play-pause").removeClass("glyphicon-pause");
	$("#span-play-pause").addClass("glyphicon-play");
	$(".break-control").attr("disabled", false);
	if (runningMode == "Session")
		$(".session-control").attr("disabled", false);
	else
		$(".session-control").attr("disabled", true);
}

$(".btn").click(function(){
    var value = $(this).attr("value");
	
	if (value === "play") {
		updateEndTime();
		timer = setInterval(updateTime, 1000);
		changeBtnToPause();
	} else if (value === "pause") {
		clearInterval(timer);
		changeBtnToPlay();
	}
}); 

$('.btn-number').click(function(e){
    e.preventDefault();
    
    fieldName = $(this).attr('data-field');
    type      = $(this).attr('data-type');
    var input = $("input[name='"+fieldName+"']");
    var currentVal = parseInt(input.val());
    if (!isNaN(currentVal)) {
        if(type == 'minus') {
            
            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
            } 
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {

            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
});

$('.input-number').focusin(function(){
   $(this).data('oldValue', $(this).val());
});

$('.input-number').change(function() {
    
    minValue =  parseInt($(this).attr('min'));
    maxValue =  parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());
    
    name = $(this).attr('name');
    if(valueCurrent >= minValue) {
        $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value is ' + $(this).attr('min'));
        $(this).val($(this).data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value is ' + $(this).attr('max'));
        $(this).val($(this).data('oldValue'));
    }
    
    if (runningMode == "Session")
		initTime(parseInt($("#session-input").val()));
	else if (runningMode == "Break")
		initTime(parseInt($("#break-input").val()));
	
});

$(".input-number").keydown(function (e) {
        //allow backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
             //allow Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
             //allow home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 return;
        }
        //make that it is a number
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
});
