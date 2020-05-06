function login() {
    let form = document.forms.loginForm;
    let formData = new FormData(form);
    form.reset();
    fetch("http://127.0.0.1:4444/api/login", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.status != 200) {
            response.json().then(err => {
                alert(err.error);
            });
        }
        console.log("here");
        window.location.replace("http://127.0.0.1:4444/home");
    });
}

function register() {
    let form = document.forms.loginForm;
    let formData = new FormData(form);
    form.reset();

    fetch("http://127.0.0.1:4444/api/register", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.status != 200) {
            response.json().then(err => {
                alert(err.error);
            });
        }
    });
}