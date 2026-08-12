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
var autoSave = debounce(function(){
	saveToLocalStorage();
},1000);

function init() {
	canvas = $('#imageView').get(0);
	context = canvas.getContext("2d");
	context.lineWidth = 2;
	var brush = document.getElementById('brushSize');
	var color = document.getElementById('customColor');

	canvas.width = 900;
	canvas.height = 600;

	var savedData = localStorage.getItem("canvas_autosave");
	
	if(savedData){
		var img = new Image();
		img.src = savedData;
		
		img.onload = function(){
			context.drawImage(img,0,0);
			saveState();
			autoSave();
		};
	}

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
		autoSave();

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

	document.getElementById("clearAutoSave").addEventListener("click", function(){
		localStorage.removeItem("canvas_autosave");
		alert("Đã xóa dữ liệu Auto Save");
	});
	document.getElementById("saveDraft").addEventListener("click", saveDraft);
	renderDrafts();

	brush.addEventListener("input", function(e){
		context.lineWidth = e.target.value;

});
	document.getElementById("btnSaveCloud").addEventListener("click", async function () {
        const title = prompt(
            "Nhập tên bài vẽ của bạn:",
            "Bài vẽ mới"
        );

        if (!title) {
            return;
        }

        const btn = document.getElementById("btnSaveCloud");

        btn.disabled = true;
        btn.innerText = "Đang lưu...";


        try {

            const dataUrl = canvas.toDataURL("image/png");

            const result = await ApiService.saveToCloud(
                title,
                dataUrl
            );

            alert(
                `Đã lưu thành công bài vẽ "${result.title}" lên Cloud!`
            );

        } catch (error) {

            console.error(error);

            alert(
                "Lỗi: " + error.message
            );

        } finally {

            btn.disabled = false;
            btn.innerText = "Lưu lên Cloud";
        }

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
	$('#catImg').get(0).addEventListener('click', function(e) {onStamp(e.target.id);}, false);
	$('#dragonFlyImg').get(0).addEventListener('click', function(e) {onStamp(e.target.id);}, false);
	$('#ladyBugImg').get(0).addEventListener('click', function(e) {onStamp(e.target.id);}, false);
	$('#heartImg').get(0).addEventListener('click', function(e) {onStamp(e.target.id);}, false);
	$('#dogImg').get(0).addEventListener('click', function(e) {onStamp(e.target.id);}, false);

	document.getElementById("exportProject").addEventListener("click", exportProject);
    document.getElementById("importProject").addEventListener("change", importProject);
	document.getElementById("btnOpenCloud").addEventListener("click", openCloudModal);
	document.getElementById("btnCloseCloud").addEventListener("click",closeCloudModal);
}

function onMouseMove(ev) {

    var x, y;
	if (ev.layerX >= 0) {
       const rect = canvas.getBoundingClientRect();

		x = ev.clientX - rect.left;
		y = ev.clientY - rect.top;
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

    else if(currentTool=="rect") {

    if(fillShape) {

        context.fillRect(
            startX,
            startY,
            x - startX,
            y - startY
        );

    } else {

        context.strokeRect(
            startX,
            startY,
            x - startX,
            y - startY
        );

    }
}

    else if(currentTool=="circle") {

    var dx = x - startX;
    var dy = y - startY;

    var radius = Math.sqrt(dx * dx + dy * dy);

    context.beginPath();

    context.arc(
        startX,
        startY,
        radius,
        0,
        2 * Math.PI
    );

    if(fillShape) {
        context.fill();
    } else {
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
	const rect = canvas.getBoundingClientRect();

	x = ev.clientX - rect.left;
	y = ev.clientY - rect.top;
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
	
	autoSave();
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

    context.closePath();
    context.beginPath();

    context.strokeStyle = color;
    context.fillStyle = color;

    var borderColor = 'white';

    if (color == 'white' || color == 'yellow') {
        borderColor = 'black';
    }S

    $('#' + lastColor).css("border", "0px dashed white");
    $('#' + color).css("border", "1px dashed " + borderColor);

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
    context.strokeStyle = "#FFFFFF";
}

function onClear()
{
	context.clearRect(0, 0, canvas.width, canvas.height);

	saveState();
	autoSave();
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
function saveToLocalStorage() {
	try {
		var data = canvas.toDataURL("image/png");
		localStorage.setItem("canvas_autosave", data);
	} catch(e) {
		if (e.name === "QuotaExceededError") {
			alert("LocalStorage đã đầy. Hãy xóa bớt bản nháp.");
		} else {
			console.error(e);
		}
	}
}
function debounce(func, delay){
	let timer;
	return function(){
		clearTimeout(timer);
		timer = setTimeout(func, delay);
	};

}
function getDrafts(){

    return JSON.parse(
        localStorage.getItem("paint_drafts")
    ) || [];

}
function saveDraft(){

    var name=document.getElementById("draftName").value.trim();
	if(name===""){
		alert("Vui lòng nhập tên bản nháp");
		return;
	}
	var drafts=getDrafts();
	var draft={
		id:Date.now(),
		name:name,
		data:canvas.toDataURL("image/png"),
		updatedAt:new Date().toLocaleString()
	};
	drafts.push(draft);
	localStorage.setItem(
		"paint_drafts",
		JSON.stringify(drafts)
	);
	renderDrafts();
	document.getElementById("draftName").value="";

}
function renderDrafts(){

    var drafts=getDrafts();

    var html="";
	drafts.forEach(function(d){
	    html+=`<div>
		<b>${d.name}</b>
		${d.updatedAt}
		<button onclick="openDraft(${d.id})">Mở</button>
		<button onclick="deleteDraft(${d.id})">Xóa</button>
		</div>
        `;
	});
	document.getElementById("draftList").innerHTML=html;
}
function openDraft(id){

    var drafts=getDrafts();

    var draft=drafts.find(x=>x.id==id);
	if(!draft)return;

    var img=new Image();
	img.src=draft.data;
	img.onload=function(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.drawImage(img,0,0);
		saveState();
		autoSave();

    };
}
function deleteDraft(id){

    if(!confirm("Bạn có chắc muốn xóa?"))
		return;
		var drafts=getDrafts();
	drafts=drafts.filter(x=>x.id!=id);
	localStorage.setItem(
		"paint_drafts",
		JSON.stringify(drafts)
	);
	renderDrafts();
	document.getElementById("draftName").value="";
}
function exportProject(){

    var projectData={
		version:"1.0",
		width:canvas.width,
		height:canvas.height,
		currentImage:
        canvas.toDataURL("image/png")
    };

    var json=
    JSON.stringify(projectData);
	var blob=
    new Blob(
        [json],
        {
            type:"application/json"
        }
    );

    var url=URL.createObjectURL(blob);
	var a=document.createElement("a");a.href=url;
    a.download="project.json";
	a.click();
	URL.revokeObjectURL(url);

}
function importProject(event){

    var file = event.target.files[0];

    if(!file)
        return;

    var reader = new FileReader();

    reader.onload=function(){

        var project = JSON.parse(reader.result);

        restoreProject(project);

    };

    reader.readAsText(file);

}
function restoreProject(project){

    var img=new Image();

    img.src=
    project.currentImage;

    img.onload=function(){

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.drawImage(
            img,
            0,
            0
        );

        saveState();

        autoSave();

    };

}

function restoreProject(project){

    var img = new Image();

    img.src = project.currentImage;

    img.onload = function(){

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.drawImage(
            img,
            0,
            0
        );

        saveState();
        autoSave();

    };
}

function openCloudModal() {

    var modal = document.getElementById("cloudModal");

    modal.style.display = "block";

    renderCloudModal();
}

async function loadAndDraw(id) {

    try {

        console.log("Đang mở bài vẽ ID:", id);

        if (!id || id === "undefined") {
            alert("ID bài vẽ không hợp lệ!");
            console.error("ID bị undefined:", id);
            return;
        }

        var drawing = await ApiService.getById(id);

        console.log("Dữ liệu bài vẽ:", drawing);

        if (!drawing) {
            alert("Không tìm thấy bài vẽ!");
            return;
        }

        var imageData =
            drawing.ImageData ||
            drawing.imageData;

        if (!imageData) {
            alert("Bài vẽ không có dữ liệu hình ảnh!");
            console.error("Không tìm thấy ImageData:", drawing);
            return;
        }

        var img = new Image();

        img.onload = function () {

            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            context.drawImage(
                img,
                0,
                0
            );

            historyStack = [];
            redoStack = [];

            historyStack.push(
                context.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                )
            );

            autoSave();

            closeCloudModal();

            alert("Đã mở bài vẽ thành công!");

        };

        img.onerror = function () {

            console.error(
                "Không thể load Image:",
                imageData
            );

            alert("Không thể hiển thị hình ảnh!");

        };

        img.src = imageData;

    }
    catch (error) {

        console.error(
            "Lỗi mở bài vẽ:",
            error
        );

        alert(
            "Không thể mở bài vẽ: " +
            error.message
        );

    }
}


function closeCloudModal() {

    var modal = document.getElementById("cloudModal");

    modal.style.display = "none";
}


async function renderCloudModal() {

    var list = document.getElementById("cloudDrawingList");

    list.innerHTML = "<p>Đang tải...</p>";

    try {

        var drawings = await ApiService.getList();

        console.log("Danh sách Cloud:", drawings);

        if (!drawings || drawings.length === 0) {

            list.innerHTML =
                "<p>Chưa có bài vẽ nào trên Cloud.</p>";

            return;
        }

        var html = "";

        drawings.forEach(function (drawing) {
            
            console.log("Một bài vẽ:", drawing);
            
            var id = drawing.Id || drawing.id;
            var title = drawing.Title || drawing.title;
            
            html += `
            <div class="cloud-drawing-item" onclick="loadAndDraw(${id})">
            <strong>
                ${title}
            </strong>

            <br>

            <small>
                ID: ${id}
            </small>
        </div>
    `;
});
        list.innerHTML = html;

    } catch (error) {

        console.error(
            "Lỗi lấy danh sách Cloud:",
            error
        );

        list.innerHTML =
            "<p>Không thể tải danh sách bài vẽ.</p>";
    }
}