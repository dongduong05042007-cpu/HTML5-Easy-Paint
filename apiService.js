// apiService.js

const API_BASE_URL = "http://localhost:3000/api/drawings";

const ApiService = {

    // ==============================
    // LƯU BÀI VẼ
    // ==============================
    async saveToCloud(title, imageData) {

        try {

            const response = await fetch(API_BASE_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    imageData: imageData
                })
            });

            if (!response.ok) {
                throw new Error("Không thể lưu bài vẽ lên Cloud!");
            }

            return await response.json();

        } catch (error) {

            console.error("saveToCloud error:", error);

            throw error;
        }
    },


    // ==============================
    // LẤY DANH SÁCH BÀI VẼ
    // ==============================
    async getList() {

        try {

            const response = await fetch(API_BASE_URL);

            if (!response.ok) {
                throw new Error("Không thể lấy danh sách bài vẽ!");
            }

            return await response.json();

        } catch (error) {

            console.error("getList error:", error);

            throw error;
        }
    },


    // ==============================
    // LẤY 1 BÀI VẼ THEO ID
    // ==============================
    async getById(id) {

        try {

            const response = await fetch(`${API_BASE_URL}/${id}`);

            if (!response.ok) {
                throw new Error("Không thể lấy bài vẽ!");
            }

            return await response.json();

        } catch (error) {

            console.error("getById error:", error);

            throw error;
        }
    }

};