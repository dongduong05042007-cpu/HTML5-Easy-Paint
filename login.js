const API_URL =
    "http://localhost:3000/api/auth/login";


const loginForm =
    document.getElementById("loginForm");


const usernameInput =
    document.getElementById("username");


const passwordInput =
    document.getElementById("password");


const loginButton =
    document.getElementById("loginButton");


const message =
    document.getElementById("message");



loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            usernameInput.value.trim();


        const password =
            passwordInput.value;


        if (!username || !password) {

            showMessage(
                "Vui lòng nhập đầy đủ thông tin!",
                "error"
            );

            return;

        }


        loginButton.disabled = true;

        loginButton.textContent =
            "Đang đăng nhập...";


        message.textContent = "";


        try {


            console.log(
                "Đang đăng nhập:",
                username
            );


            const response =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                username:
                                    username,

                                password:
                                    password

                            })

                    }
                );


            const data =
                await response.json();


            console.log(
                "Login response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Đăng nhập thất bại!"
                );

            }

            if (!data.token) {

                throw new Error(
                    "Server không trả về token!"
                );

            }


            localStorage.setItem(
                "token",
                data.token
            );

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

            }


            console.log(
                "Đăng nhập thành công!"
            );


            console.log(
                "Token:",
                data.token
            );


            console.log(
                "User:",
                data.user
            );


            showMessage(
                "Đăng nhập thành công!",
                "success"
            );

            setTimeout(
                function () {

                    window.location.href =
                        "index.html";

                },
                700
            );


        } catch (error) {


            console.error(
                "Login error:",
                error
            );


            showMessage(
                error.message ||
                "Không thể kết nối Server!",
                "error"
            );


        } finally {


            loginButton.disabled = false;

            loginButton.textContent =
                "Đăng nhập";

        }

    }
);



function showMessage(
    text,
    type
) {

    message.textContent =
        text;


    message.className =
        type;

}