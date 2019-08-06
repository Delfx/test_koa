async function addNewThing(data) {
    const list = document.getElementById('allthings');

    if (list) {
        list.remove();
    }

    const getContainers = document.querySelectorAll('.container');
    getContainers[1].insertAdjacentHTML('beforeend', data.html);


}

async function addThing(opts) {
    try {
        const response = await fetch('/add', {
            method: 'post',
            body: opts
        });

        const data = await response.json();

        if (data.success) {
            addNewThing(data);
            removeThing();
        }
    } catch (e) {
        console.log(e);
    }
}

async function removeThing() {
    const selectDeleteForm = document.getElementsByClassName('deleteForm');
    for (i = 0; i < selectDeleteForm.length; i++) {
        const getId = selectDeleteForm[i];
        selectDeleteForm[i].addEventListener('submit', async function (event) {
            event.preventDefault();

            getId.parentNode.remove();
            const formData = new FormData(getId);
            const data = new URLSearchParams(formData);

            try {
                const response = await fetch('/delete', {
                    method: 'post',
                    body: data
                });
            } catch (e) {
                console.log(e);
            }
        });
    }
}

(function () {
    const getForm = document.getElementById('submitForm');

    getForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(getForm);
        const data = new URLSearchParams(formData);

        addThing(data);
    });

})();

removeThing();

