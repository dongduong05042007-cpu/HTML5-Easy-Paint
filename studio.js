const API_URL = "http://localhost:3000/api/drawings";

async function loadDrawingFromURL() {

    const params =
        new URLSearchParams(window.location.search);

    const id = params.get("id");

    // Không có id => tạo bản vẽ mới
    if (!id) {
        console.log("Đang tạo bản vẽ mới");
        return;
    }

    console.log("Đang mở bản vẽ:", id);

    try {

        const response =
            await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Không tìm thấy bản vẽ");
        }

        const drawing =
            await response.json();

        console.log("Drawing nhận được:", drawing);

        // Phần này phụ thuộc tên field API trả về
        const imageData =
            drawing.image ||
            drawing.data ||
            drawing.canvasData;

        if (!imageData) {
            console.error("Không có dữ liệu Canvas");
            return;
        }

        const img = new Image();

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

            saveState();
        };

        img.src = imageData;

    } catch (error) {

        console.error(
            "Lỗi khi mở bản vẽ:",
            error
        );

        alert(
            "Không thể mở bản vẽ!"
        );

        const params =
        new URLSearchParams(window.location.search);
        const drawingId = params.get("id");
        console.log("ID bài vẽ:", drawingId);
    }
    
}

async function loadDrawingFromCloud() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const drawingId =
        params.get("id");

    if (!drawingId) {
        return;
    }

    try {

        const drawing =
            await ApiService.getById(
                drawingId
            );

        console.log(
            "Bài vẽ lấy được:",
            drawing
        );

    } catch (error) {

        console.error(
            "Không thể tải bài vẽ:",
            error
        );

    }
}
loadDrawingFromCloud();