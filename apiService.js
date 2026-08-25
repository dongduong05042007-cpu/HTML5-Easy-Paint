const API_BASE_URL =
    "http://localhost:3000/api/drawings";
const ApiService = {

    getToken() {

        return localStorage.getItem("token");

    },

    setToken(token) {

        localStorage.setItem("token", token);

    },

    clearToken() {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

    },

    checkTokenExpired(token) {

        if (!token) {
            return true;
        }

        try {

            const payload =
                JSON.parse(
                    atob(
                        token.split(".")[1]
                    )
                );

            const currentTime =
                Math.floor(Date.now() / 1000);

            return payload.exp < currentTime;

        } catch (error) {

            console.error(
                "Token không hợp lệ:",
                error
            );

            return true;

        }

    },

    getValidToken() {

        const token =
            this.getToken();

        if (!token) {

            console.error(
                "Không tìm thấy token!"
            );

            return null;

        }

        if (
            this.checkTokenExpired(token)
        ) {

            console.error(
                "Token đã hết hạn!"
            );

            this.clearToken();

            return null;

        }

        return token;

    },

    async saveToCloud(
        title,
        imageData
    ) {

        try {

            const token =
                this.getValidToken();

            if (!token) {

                throw new Error(
                    "Bạn chưa đăng nhập hoặc token đã hết hạn!"
                );

            }


            const response =
                await fetch(
                    API_BASE_URL,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                title:
                                    title,

                                imageData:
                                    imageData

                            })

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

            const token =
                this.getValidToken();

            if (!token) {

                throw new Error(
                    "Bạn chưa đăng nhập hoặc token đã hết hạn!"
                );

            }


            const response =
                await fetch(
                    API_BASE_URL,
                    {

                        method: "GET",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`

                        }

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
                    "Không thể lấy danh sách bài vẽ"
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

            const token =
                this.getValidToken();

            if (!token) {

                throw new Error(
                    "Bạn chưa đăng nhập hoặc token đã hết hạn!"
                );

            }


            const response =
                await fetch(
                    `${API_BASE_URL}/${id}`,
                    {

                        method: "GET",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`

                        }

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

            const token =
                this.getValidToken();

            if (!token) {

                throw new Error(
                    "Bạn chưa đăng nhập hoặc token đã hết hạn!"
                );

            }


            console.log(
                "Đang gửi yêu cầu DELETE:",
                `${API_BASE_URL}/${id}`
            );


            const response =
                await fetch(
                    `${API_BASE_URL}/${id}`,
                    {

                        method: "DELETE",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`

                        }

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


window.ApiService = ApiService;