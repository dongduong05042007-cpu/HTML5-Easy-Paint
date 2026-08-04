var started = false;
var canvas, context;
var stampId = '';
var lastColor = 'black';
var lastStampId = '';
var currentTool="pen";
var startX=0;
var startY=0;
var snapshot=null;
var fillShape=false;
var historyStack=[];
var redoStack=[];
var textInput;
var glow=false;

function init() {
	canvas = $('#imageView').get(0);
	context = canvas.getContext("2d");
	context.lineWidth = 2;
	var brush = document.getElementById('brushSize');
	var color = document.getElementById('customColor');


	canvas.width  = window.innerWidth - 75;
	canvas.height = window.innerHeight - 75;

	snapshot=context.getImageData(0, 0, canvas.width, canvas.height);

	saveState();

	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mousemove', onMouseMove, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
	canvas.addEventListener('mouseleave', onMouseUp, false);

	canvas.addEventListener('click', onClick, false);

	// textInput.style.left=x+"px";
	// textInput.style.top=y+"px";
	// textInput.style.display="block";
	// textInput.focus();
	textInput=document.getElementById("textInput");
	textInput.addEventListener("keydown", function(e){

    if(e.key=="Enter"){

        context.font="24px Arial";

        context.fillStyle=context.strokeStyle;

        context.fillText(

            textInput.value,

            parseInt(textInput.style.left)-50,

            parseInt(textInput.style.top)-5

        );

        textInput.style.display="none";

        saveState();

    }
});

	brush.addEventListener('input', function(e) {
		//console.log(brushSize + e.target.value);
		context.lineWidth = e.target.value;
	});

		color.addEventListener('change', function(){
    	onColorClick(this.value);
	});
	
	document.getElementById('eraser').addEventListener('click', onEraser);
	document.getElementById('clear').addEventListener('click', onClear);
	window.addEventListener('keydown', function(e) {
    if(e.key=="c")
        onClear();

    if(e.key=="e")
        onEraser();

    if(e.key=="s")
        onSave();
	
	if (e.ctrlKey && e.key.toLowerCase() == "z") {
        e.preventDefault();
        undo();
    }

    if (e.ctrlKey && e.key.toLowerCase() == "y") {
        e.preventDefault();
        redo();
    }
});

	currentTool=document.getElementById('shapeTool').value;
	document.getElementById('shapeTool').addEventListener("change", function(){
		currentTool=this.value;
	});

	document.getElementById("fillShape").addEventListener("change", function () {
    	fillShape = this.checked;
	});

	document.getElementById("glow").addEventListener("change",function(){
		glow=this.checked;
	});

	brush.addEventListener("input", function(e){
		context.lineWidth = e.target.value;

});

	// Add events for toolbar buttons.
	$('#red').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#pink').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#fuchsia').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#orange').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#yellow').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#lime').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#green').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#blue').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#purple').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#black').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#white').get(0).addEventListener('click', function(e) { onColorClick(e.target.id); }, false);
	$('#cat').get(0).addEventListener('click', function(e) { onStamp(e.target.id); }, false);
	$('#dragonfly').get(0).addEventListener('click', function(e) { onStamp(e.target.id); }, false);
	$('#ladybug').get(0).addEventListener('click', function(e) { onStamp(e.target.id); }, false);
	$('#heart').get(0).addEventListener('click', function(e) { onStamp(e.target.id); }, false);
	$('#dog').get(0).addEventListener('click', function(e) { onStamp(e.target.id); }, false);
	$('#fill').get(0).addEventListener('click', function(e) { onFill(); }, false);
	$('#save').get(0).addEventListener('click', function(e) { onSave(); }, false);
}

function onMouseMove(ev) {

    var x, y;
	if (ev.layerX >= 0) {
        x = ev.layerX - 50;
        y = ev.layerY - 5;
    }
    else {
        x = ev.offsetX - 50;
        y = ev.offsetY - 5;
    }
	
	if (!started)
        return;
	context.putImageData(snapshot,0,0);

    if(glow){
		context.shadowColor=context.strokeStyle;
		context.shadowBlur=20;
	}else{
		context.shadowBlur=0;
	}

	if(currentTool=="pen"){

		context.putImageData(snapshot,0,0);
        context.lineTo(x,y);
        context.stroke();

    }

    else if(currentTool=="line"){
		context.beginPath();
		context.moveTo(startX,startY);
		context.lineTo(x,y);
		context.stroke();

    }

    else if(currentTool=="rect"){
		if(fillShape){
			context.fillRect(
                startX,
                startY,
                x-startX,
                y-startY
            );

        }

        else{

            context.strokeRect(
                startX,
                startY,
                x-startX,
                y-startY
            );

        }

    }

    else if(currentTool=="circle"){

    var dx=x-startX;
    var dy=y-startY;

    var radius=Math.sqrt(dx*dx+dy*dy);

    context.beginPath();

    context.arc(
        startX,
        startY,
        radius,
        0,
        2*Math.PI
    );

    if(fillShape){
        context.fill();
    }else{
        context.stroke();
    }

}

	else if(currentTool=="spray"){
		for(var i=0;i<30;i++){
			var angle=Math.random()*2*Math.PI;
			var radius=Math.random()*20;        
			var px=x+Math.cos(angle)*radius;
			var py=y+Math.sin(angle)*radius;
			context.fillRect(px,py,1,1);
    }
}
context.shadowBlur=0;

$("#stats").text(x+", "+y);
			}

function onMouseDown(ev) {

    var x, y;

    if (ev.layerX >= 0) {
        x = ev.layerX - 50;
        y = ev.layerY - 5;
    }
    else {
        x = ev.offsetX - 50;
        y = ev.offsetY - 5;
    }

    started = true;

    startX = x;
    startY = y;

    snapshot = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if(currentTool=="pen"){
        context.beginPath();
        context.moveTo(x,y);
    }

}

function onMouseUp()
{
    started = false;
	saveState(); 
}

function onClick(e) {
	if (stampId.length > 0) {
		context.drawImage($(stampId).get(0), e.pageX - 90, e.pageY - 60, 80, 80);
	}

	if(currentTool=="text"){
		textInput.style.display="block";
		textInput.style.left=e.pageX+"px";
		textInput.style.top=e.pageY+"px";
		textInput.value="";
		textInput.focus();
		return;
	}
}

function onColorClick(color) {
	// Start a new path to begin drawing in a new color.
	context.closePath();
	context.beginPath();
	
	// Select the new color.
	context.strokeStyle = color;
	
	// Highlight selected color.
	var borderColor = 'white';
	if (color == 'white' || color == 'yellow') {
		borderColor = 'black';
	}
	
	$('#' + lastColor).css("border", "0px dashed white");
	$('#' + color).css("border", "1px dashed " + borderColor);
	
	// Store color so we can un-highlight it next time around.
	lastColor = color;

}

function onFill() {
	// Start a new path to begin drawing in a new color.
	context.closePath();
	context.beginPath();

	context.fillStyle = context.strokeStyle;
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function onStamp(id) {
	// Update the stamp image.
	stampId = '#' + id;

    if (lastStampId == stampId) {
        // User clicked the selected stamp again, so deselect it.
        stampId = '';
    }

	$(lastStampId).css("border", "0px dashed white");
	$(stampId).css("border", "1px dashed black");
	
	// Store stamp so we can un-highlight it next time around.
	lastStampId = stampId;	
}

function onSave()
{
    var img = canvas.toDataURL("image/png");

    var link = document.createElement("a");

    link.download =
    "my-drawing.png";

    link.href = img;

    link.click();
}

function onEraser()
{
    context.strokeStyle =
    "#FFFFFF";
}

function onClear()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
}
function saveState(){
	historyStack.push(
		context.getImageData(
			0,
            0,
            canvas.width,
            canvas.height
		)

    );

    redoStack = [];

}
function undo() {
	if (historyStack.length <= 1)
        return;
	redoStack.push(historyStack.pop());
	context.putImageData(
        historyStack[historyStack.length - 1],
        0,
        0
    );
}
function redo() {
	if (redoStack.length == 0)
        return;
	var img = redoStack.pop();
	historyStack.push(img);
	context.putImageData(
        img,
        0,
        0
    );

}