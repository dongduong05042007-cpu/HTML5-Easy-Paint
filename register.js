const API_URL =
    "http://localhost:3000/api/auth/register";


const registerForm =
    document.getElementById("registerForm");


const usernameInput =
    document.getElementById("username");


const passwordInput =
    document.getElementById("password");


const confirmPasswordInput =
    document.getElementById("confirmPassword");


const registerButton =
    document.getElementById("registerButton");


const message =
    document.getElementById("message");



registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const username =
            usernameInput.value.trim();


        const password =
            passwordInput.value;


        const confirmPassword =
            confirmPasswordInput.value;

        if (
            !username ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                "Vui lòng nhập đầy đủ thông tin!",
                "error"
            );

            return;

        }

        if (
            password !== confirmPassword
        ) {

            showMessage(
                "Mật khẩu nhập lại không khớp!",
                "error"
            );

            return;

        }

        if (password.length < 6) {

            showMessage(
                "Mật khẩu phải có ít nhất 6 ký tự!",
                "error"
            );

            return;

        }


        registerButton.disabled = true;

        registerButton.textContent =
            "Đang đăng ký...";


        message.textContent = "";


        try {

            console.log(
                "Đang đăng ký:",
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
                "Register response:",
                data
            );

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Đăng ký thất bại!"
                );

            }

            showMessage(
                "Đăng ký thành công! Đang chuyển đến trang đăng nhập...",
                "success"
            );


            registerForm.reset();


            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1200
            );


        } catch (error) {

            console.error(
                "Register error:",
                error
            );


            showMessage(
                error.message ||
                "Không thể kết nối Server!",
                "error"
            );


        } finally {

            registerButton.disabled =
                false;

            registerButton.textContent =
                "Đăng ký";

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