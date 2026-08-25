var started = false;
var canvas, context;
var stampId = '';
var lastColor = 'black';
var lastStampId = '';
var currentTool="pen";
var fillMode = "area";

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
var currentBrush = "pen";
var brushOpacity = 1;
var brushSizeValue = 2;

function init() {
	canvas = $('#imageView').get(0);
	context = canvas.getContext("2d");
	context.lineWidth = 2;

var brushType = document.getElementById("brushType");
var brushSize = document.getElementById("brushSize");
var brushOpacity = document.getElementById("brushOpacity");
var brushSizeValueElement = document.getElementById("brushSizeValue");
var brushOpacityValueElement = document.getElementById("brushOpacityValue");

if (brushType) {

    brushType.addEventListener(
        "change",
        function () {

            currentBrush =
                this.value;

            applyBrush();

        }
    );

}

if (brushSize) {

    brushSize.addEventListener(
        "input",
        function () {

            brushSizeValue =
                Number(this.value);

            if (brushSizeValueElement) {

                brushSizeValueElement.innerText =
                    "Size: " +
                    this.value;

            }

            applyBrush();

        }
    );

}

if (brushOpacity) {

    brushOpacity.addEventListener(
        "input",
        function () {

            brushOpacity =
                Number(this.value) / 100;

            if (brushOpacityValueElement) {

                brushOpacityValueElement.innerText =
                    "Opacity: " +
                    this.value +
                    "%";

            }

            applyBrush();

        }
    );

}
applyBrush();

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
    document.getElementById('fill').addEventListener('click', onFill);
	
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

    loadDrawingFromCloud();
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
		
        applyBrush();
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

    var rect = canvas.getBoundingClientRect();

    var x = Math.floor(
        e.clientX - rect.left
    );

    var y = Math.floor(
        e.clientY - rect.top
    );

    if (currentTool === "fill") {

        floodFill(x, y);

        return;
    }

    if (stampId.length > 0) {

        context.drawImage(
            $(stampId).get(0),
            x - 40,
            y - 40,
            80,
            80
        );

        saveState();
        autoSave();

        return;
    }

    if (currentTool == "text") {

        textInput.style.display = "block";

        textInput.style.left =
            e.pageX + "px";

        textInput.style.top =
            e.pageY + "px";

        textInput.value = "";

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
    }

    $('#' + lastColor).css("border", "0px dashed white");
    $('#' + color).css("border", "1px dashed " + borderColor);

    lastColor = color;
}

function onFill() {

    currentTool = "fill";

    console.log("Đã chọn công cụ Tô sơn");

}

function hexToRgba(color) {

    if (!color) {
        return null;
    }

    if (color.charAt(0) === "#") {

        var hex = color.substring(1);

        if (hex.length === 3) {

            hex =
                hex[0] + hex[0] +
                hex[1] + hex[1] +
                hex[2] + hex[2];
        }

        if (hex.length === 6) {

            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }
    }

    var tempCanvas =
        document.createElement("canvas");

    tempCanvas.width = 1;
    tempCanvas.height = 1;

    var tempContext =
        tempCanvas.getContext("2d");

    tempContext.fillStyle = color;

    tempContext.fillRect(0, 0, 1, 1);

    var pixel =
        tempContext.getImageData(
            0,
            0,
            1,
            1
        ).data;

    return {
        r: pixel[0],
        g: pixel[1],
        b: pixel[2]
    };
}

function onStamp(id) {

	stampId = '#' + id;

    if (lastStampId == stampId) {
        stampId = '';
    }

	$(lastStampId).css("border", "0px dashed white");
	$(stampId).css("border", "1px dashed black");
	
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

const urlParams =
    new URLSearchParams(window.location.search);

const drawingId = urlParams.get("id");

console.log("ID bài vẽ:", drawingId);

async function loadDrawingFromCloud() {

    console.log("Đang kiểm tra ID bài vẽ trong URL...");

    const urlParams =
        new URLSearchParams(window.location.search);

    const drawingId =
        urlParams.get("id");

    console.log("ID bài vẽ:", drawingId);

    if (!drawingId) {

        console.log(
            "Không có ID → mở bảng vẽ mới."
        );

        return;
    }

    try {

        console.log(
            "Đang tải bài vẽ ID:",
            drawingId
        );

        const drawing =
            await ApiService.getById(drawingId);

        console.log(
            "Bài vẽ lấy được:",
            drawing
        );

        if (!drawing) {

            alert("Không tìm thấy bài vẽ!");

            return;
        }

        const imageData =
            drawing.ImageData ||
            drawing.imageData ||
            drawing.image_data;

        if (!imageData) {

            alert(
                "Bài vẽ không có dữ liệu hình ảnh!"
            );

            return;
        }

        const image =
            new Image();

        image.onload = function () {

            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            context.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
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

            console.log(
                "Đã vẽ bài ID " +
                drawingId +
                " lên Canvas."
            );

        };

        image.onerror = function () {

            console.error(
                "Không thể tải hình ảnh:",
                imageData
            );

            alert(
                "Không thể hiển thị bài vẽ!"
            );

        };

        image.src = imageData;

    } catch (error) {

        console.error(
            "Lỗi tải bài vẽ:",
            error
        );

        alert(
            "Không thể tải bài vẽ!"
        );
    }
}

function setBrush() {

    var brushType =
        document.getElementById("brushType");

    var brushSize =
        document.getElementById("brushSize");

    var opacity =
        document.getElementById("brushOpacity");


    if (brushType) {

        currentBrush =
            brushType.value;

    }


    if (brushSize) {

        brushSizeValue =
            Number(brushSize.value);

    }


    if (opacity) {

        brushOpacity =
            Number(opacity.value) / 100;

    }


    applyBrush();

}

function applyBrush() {

    if (!context) {
        return;
    }


    context.globalAlpha =
        brushOpacity;


    context.lineWidth =
        brushSizeValue;


    context.lineCap =
        "round";

    context.lineJoin =
        "round";

    context.shadowBlur = 0;

    context.shadowColor =
        "transparent";

    if (currentBrush === "pen") {

        context.globalAlpha =
            brushOpacity;

        context.lineWidth =
            brushSizeValue;

        context.lineCap =
            "round";

        context.setLineDash([]);

    }

    else if (currentBrush === "pencil") {

        context.globalAlpha =
            brushOpacity * 0.65;

        context.lineWidth =
            Math.max(
                1,
                brushSizeValue * 0.6
            );

        context.lineCap =
            "round";

        context.setLineDash([]);

    }

    else if (currentBrush === "marker") {

        context.globalAlpha =
            brushOpacity * 0.65;

        context.lineWidth =
            brushSizeValue * 2;

        context.lineCap =
            "square";

        context.setLineDash([]);

    }

    else if (currentBrush === "crayon") {

        context.globalAlpha =
            brushOpacity * 0.8;

        context.lineWidth =
            brushSizeValue * 1.5;

        context.lineCap =
            "round";

        context.setLineDash([]);

    }

    else if (currentBrush === "airbrush") {

        context.globalAlpha =
            brushOpacity * 0.15;

        context.lineWidth =
            brushSizeValue * 4;

        context.lineCap =
            "round";

        context.setLineDash([]);

    }

    else if (currentBrush === "spray") {

        context.globalAlpha =
            brushOpacity * 0.5;

        context.lineWidth =
            1;

        context.lineCap =
            "round";

        context.setLineDash([]);

    }

    else if (currentBrush === "neon") {

        context.globalAlpha =
            brushOpacity;

        context.lineWidth =
            brushSizeValue;

        context.lineCap =
            "round";

        context.setLineDash([]);

        context.shadowBlur =
            brushSizeValue * 2;

        context.shadowColor =
            context.strokeStyle;

    }

    else if (currentBrush === "calligraphy") {

        context.globalAlpha =
            brushOpacity;

        context.lineWidth =
            brushSizeValue * 2;

        context.lineCap =
            "square";

        context.lineJoin =
            "miter";

        context.setLineDash([]);

    }

}

function sprayBrush(x, y) {

    var radius =
        brushSizeValue * 2;

    var amount =
        Math.max(
            10,
            brushSizeValue * 2
        );


    context.save();

    context.globalAlpha =
        brushOpacity * 0.5;


    for (
        var i = 0;
        i < amount;
        i++
    ) {

        var angle =
            Math.random() *
            Math.PI * 2;

        var distance =
            Math.random() *
            radius;


        var px =
            x +
            Math.cos(angle) *
            distance;


        var py =
            y +
            Math.sin(angle) *
            distance;


        context.beginPath();

        context.arc(
            px,
            py,
            Math.random() * 1.5 + 0.5,
            0,
            Math.PI * 2
        );

        context.fill();

    }


    context.restore();

}

function floodFill(startX, startY) {

    var imageData = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    var data = imageData.data;

    var width = canvas.width;
    var height = canvas.height;

    startX = Math.floor(startX);
    startY = Math.floor(startY);

    var startIndex =
        (startY * width + startX) * 4;

    var targetR = data[startIndex];
    var targetG = data[startIndex + 1];
    var targetB = data[startIndex + 2];
    var targetA = data[startIndex + 3];

    var color = hexToRgb(context.fillStyle);

    if (!color) {
        return;
    }

    var fillR = color.r;
    var fillG = color.g;
    var fillB = color.b;

    if (
        targetR === fillR &&
        targetG === fillG &&
        targetB === fillB
    ) {
        return;
    }

    var stack = [[startX, startY]];

    while (stack.length > 0) {

        var point = stack.pop();

        var x = point[0];
        var y = point[1];

        if (
            x < 0 ||
            x >= width ||
            y < 0 ||
            y >= height
        ) {
            continue;
        }

        var index =
            (y * width + x) * 4;

        if (
            data[index] !== targetR ||
            data[index + 1] !== targetG ||
            data[index + 2] !== targetB ||
            data[index + 3] !== targetA
        ) {
            continue;
        }

        data[index] = fillR;
        data[index + 1] = fillG;
        data[index + 2] = fillB;
        data[index + 3] = 255;

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }

    context.putImageData(imageData, 0, 0);

    saveState();
    autoSave();
}

function getColorFromCanvas() {

    var tempCanvas =
        document.createElement("canvas");

    tempCanvas.width = 1;
    tempCanvas.height = 1;


    var tempContext =
        tempCanvas.getContext("2d");


    tempContext.fillStyle =
        context.fillStyle;


    tempContext.fillRect(
        0,
        0,
        1,
        1
    );


    var pixel =
        tempContext.getImageData(
            0,
            0,
            1,
            1
        ).data;


    return {

        r: pixel[0],

        g: pixel[1],

        b: pixel[2]

    };

}

function hexToRgb(color) {

    if (!color) {
        return null;
    }

    if (color.charAt(0) === "#") {

        var hex = color.substring(1);

        if (hex.length === 3) {

            hex =
                hex[0] + hex[0] +
                hex[1] + hex[1] +
                hex[2] + hex[2];
        }

        if (hex.length === 6) {

            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }
    }

    return null;
}