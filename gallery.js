let deleteId = null;

async function loadGallery() {

    const gallery =
        document.getElementById("gallery");

    const loading =
        document.getElementById("loading");

    const galleryCount =
        document.getElementById("galleryCount");


    // Kiểm tra HTML

    if (!gallery) {

        console.error(
            "Không tìm thấy #gallery"
        );

        return;

    }


    try {

        console.log("================================");

        console.log("ĐANG TẢI GALLERY");

        console.log("================================");

        const drawings = await ApiService.getList();


        console.log("Dữ liệu nhận từ API:", drawings);

        if (loading) {loading.style.display = "none";}

        gallery.innerHTML = "";

        if (!drawings || drawings.length === 0) {

            if (galleryCount) {

                galleryCount.textContent =
                    "0 bản vẽ";

            }


            gallery.innerHTML = `

                <div class="empty-gallery">

                    <div class="empty-gallery-icon">
                        🎨
                    </div>

                    <h2>
                        Chưa có bài vẽ nào
                    </h2>

                    <p>
                        Hãy tạo một bản vẽ mới để bắt đầu.
                    </p>

                </div>

            `;

            return;

        }

        if (galleryCount) {

            galleryCount.textContent =
                `${drawings.length} bản vẽ`;

        }

        drawings.forEach(function (drawing) {

            console.log(
                "Đang xử lý bài vẽ:",
                drawing
            );

            const id =
                drawing.Id ??
                drawing.id;

            const title =
                drawing.Title ??
                drawing.title ??
                "Bài vẽ không tên";

            const imageData =
                drawing.ImageData ??
                drawing.imageData ??
                drawing.image_data ??
                null;

            const createdAt =
                drawing.CreatedAt ??
                drawing.createdAt ??
                null;

            let formattedDate =
                "Không rõ ngày tạo";


            if (createdAt) {

                try {

                    const date =
                        new Date(createdAt);


                    formattedDate =
                        date.toLocaleDateString(
                            "vi-VN",
                            {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                            }
                        );

                }
                catch (error) {

                    console.warn(
                        "Không thể format ngày:",
                        createdAt
                    );

                }

            }

            const card =
                document.createElement("div");


            card.className =
                "drawing-card";

            let imageHTML = "";


            if (
                imageData &&
                typeof imageData === "string"
            ) {

                imageHTML = `

                    <img
                        src="${imageData}"
                        alt="${escapeHTML(title)}"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    >

                    <div
                        class="image-placeholder"
                        style="
                            display:none;
                            height:240px;
                            align-items:center;
                            justify-content:center;
                            background:#f1f1f1;
                            font-size:55px;
                        "
                    >
                        🎨
                    </div>

                `;

            }
            else {

                imageHTML = `

                    <div
                        class="image-placeholder"
                        style="
                            height:240px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:#f1f1f1;
                            font-size:55px;
                        "
                    >
                        🎨
                    </div>

                `;

            }

            card.innerHTML = `

    <!-- =========================
         THUMBNAIL
    ========================== -->

    <div
        class="drawing-thumbnail"
        onclick="openDrawing(${id})"
    >

        ${imageHTML}

        <button
            class="delete-button"
            onclick="event.stopPropagation(); showDeleteModal(${id})"
            title="Xóa bài vẽ"
        >

            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                    fill="currentColor"
                />
            </svg>

        </button>

    </div>




                <!-- =========================
                     THÔNG TIN
                ========================== -->

                <div class="drawing-info">

                    <h3 class="drawing-title">
                        ${escapeHTML(title)}
                    </h3>


                    <p class="drawing-id">
                        ID: ${id}
                    </p>


                    <p class="drawing-date">
                        📅 ${formattedDate}
                    </p>

                </div>


                <!-- =========================
                     BUTTONS
                ========================== -->

                <div class="drawing-actions">

                    <button
                        class="delete-button"
                        onclick="showDeleteModal(${id})">

                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
                                fill="currentColor"
                            />
                        </svg>

                    </button>


                </div>

            `;

            gallery.appendChild(card);

        });


        console.log(
            "Gallery đã tải xong!"
        );

    }
    catch (error) {

        console.error(
            "LỖI GALLERY:",
            error
        );


        if (loading) {

            loading.style.display =
                "block";


            loading.innerHTML = `

                <div style="
                    padding:50px;
                    text-align:center;
                ">

                    <div style="
                        font-size:45px;
                        margin-bottom:15px;
                    ">
                        ⚠️
                    </div>

                    <h2>
                        Không thể tải Gallery
                    </h2>

                    <p>
                        Kiểm tra Server hoặc API.
                    </p>

                </div>

            `;

        }


        if (galleryCount) {

            galleryCount.textContent =
                "Lỗi tải dữ liệu";

        }

    }

}

function openDrawing(id) {

    console.log(
        "Đang mở bài vẽ ID:",
        id
    );


    // Kiểm tra ID

    if (
        id === undefined ||
        id === null
    ) {

        alert(
            "Không tìm thấy ID bài vẽ!"
        );

        return;

    }

    window.location.href =
        `paint.html?id=${encodeURIComponent(id)}`;

}

function showDeleteModal(id) {

    console.log(
        "Chuẩn bị xóa bài vẽ:",
        id
    );


    deleteId = id;


    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (!modal) {

        console.error(
            "Không tìm thấy deleteModal"
        );

        return;

    }


    modal.style.display =
        "flex";

}

function closeDeleteModal() {

    deleteId = null;


    const modal =
        document.getElementById(
            "deleteModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}

async function deleteDrawing(id) {

    console.log("================================");
    console.log("BẮT ĐẦU XÓA BÀI VẼ");
    console.log("ID cần xóa:", id);
    console.log("================================");

    const result = confirm(
        "Bạn có chắc chắn muốn xóa bài vẽ này không?"
    );

    if (!result) {
        console.log("Người dùng đã hủy xóa.");
        return;
    }

    try {

        console.log("Đang gọi ApiService.deleteById...");
        console.log("ID:", id);

        const response = await ApiService.deleteById(id);

        console.log("Kết quả DELETE:", response);

        alert("Xóa bài vẽ thành công!");

        await loadGallery();

    } catch (error) {

        console.error("================================");
        console.error("LỖI XÓA BÀI VẼ");
        console.error("================================");
        console.error(error);

        alert(
            "Không thể xóa bài vẽ!\n\n" +
            "Mở F12 → Console để xem lỗi."
        );
    }
}

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

function initDeleteModal() {

    const cancelButton =
        document.getElementById(
            "cancelDelete"
        );


    const confirmButton =
        document.getElementById(
            "confirmDelete"
        );


    const modal =
        document.getElementById(
            "deleteModal"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                closeDeleteModal();

            }
        );

    }

    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            function () {

                confirmDeleteDrawing();

            }
        );

    }

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeDeleteModal();

                }

            }
        );

    }

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeDeleteModal();

            }

        }
    );

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Paint Gallery đang khởi động..."
        );


        initDeleteModal();


        loadGallery();

    }
);

// ========================================
// XÁC NHẬN XÓA
// ========================================

async function confirmDeleteDrawing() {

    if (
        deleteId === null ||
        deleteId === undefined
    ) {

        console.error(
            "Không có ID bài vẽ cần xóa!"
        );

        return;

    }


    const id = deleteId;


    console.log(
        "Xác nhận xóa bài vẽ:",
        id
    );


    try {

        const response =
            await ApiService.deleteById(id);


        console.log(
            "Kết quả DELETE:",
            response
        );


        // Đóng modal

        closeDeleteModal();


        // Tải lại Gallery

        await loadGallery();


    } catch (error) {

        console.error(
            "Lỗi xóa bài vẽ:",
            error
        );


        alert(
            "Không thể xóa bài vẽ!\n\n" +
            error.message
        );

    }

}