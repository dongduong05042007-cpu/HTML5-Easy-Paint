// apiService.js

const API_BASE_URL =
    "http://localhost:3000/api/drawings";


const ApiService = {

    async saveToCloud(title, imageData) {

        try {

            const response =
                await fetch(API_BASE_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        title: title,
                        imageData: imageData
                    })

                });


            if (!response.ok) {

                throw new Error(
                    "Không thể lưu bài vẽ lên Cloud!"
                );

            }


            return await response.json();


        } catch (error) {

            console.error(
                "saveToCloud error:",
                error
            );

            throw error;

        }

    },

    async getList() {

        try {

            const response =
                await fetch(API_BASE_URL);


            if (!response.ok) {

                throw new Error(
                    "Không thể lấy danh sách bài vẽ!"
                );

            }


            return await response.json();


        } catch (error) {

            console.error(
                "getList error:",
                error
            );

            throw error;

        }

    },

    async getById(id) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/${id}`
                );


            if (!response.ok) {

                throw new Error(
                    "Không thể lấy bài vẽ!"
                );

            }


            return await response.json();


        } catch (error) {

            console.error(
                "getById error:",
                error
            );

            throw error;

        }

    },

    async deleteById(id) {

        try {

            console.log(
                "Đang gửi yêu cầu DELETE:",
                `${API_BASE_URL}/${id}`
            );


            const response =
                await fetch(
                    `${API_BASE_URL}/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!response.ok) {

                const errorText =
                    await response.text();

                console.error(
                    "Server trả về:",
                    errorText
                );

                throw new Error(
                    "Không thể xóa bài vẽ!"
                );

            }


            return await response.json();


        } catch (error) {

            console.error(
                "deleteById error:",
                error
            );

            throw error;

        }

    }

};