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
            update()
        }
    } catch (e) {
        console.log(e);
    }
}

async function update() {
    const selectForm = document.getElementsByClassName('groupForm');
    for (i = 0; i < selectForm.length; i++) {
        const getId = selectForm[i];

        selectForm[i].addEventListener('submit', async function (event) {
            event.preventDefault();

            const inputField = document.createElement('input');
            const inputFieldHidden = document.createElement('input');
            const creatForm = document.createElement('form');
            const createButton = document.createElement('input');
            const thingText = getId.getElementsByTagName('span')[0].textContent;
            const targetId = event.target.querySelector('.id').value;

            creatForm.method = 'post';
            creatForm.className = ('updateForm d-inline');
            inputField.className = 'form-control';
            inputField.value = thingText;
            inputField.type = 'text';
            inputField.name = 'thing';
            inputFieldHidden.type = 'hidden';
            inputFieldHidden.value = targetId;
            inputFieldHidden.name = 'id';
            createButton.type = 'submit';
            createButton.value = 'Ok';
            createButton.className = 'btn-danger btn btn-sm mt-2';

            getId.parentNode.appendChild(creatForm).appendChild(inputField);
            getId.parentNode.appendChild(creatForm).appendChild(createButton);
            getId.parentNode.appendChild(creatForm).appendChild(inputFieldHidden);

            getId.remove();

            const selectUpdateForm = document.getElementsByClassName('updateForm');
            for (i = 0; selectUpdateForm.length; i++) {
                const getUpdateForm = selectUpdateForm[i];
                selectUpdateForm[i].addEventListener('submit', async function (event) {
                    event.preventDefault();

                    const formData = new FormData(getUpdateForm);
                    const data = new URLSearchParams(formData);

                    try {
                        const response = await fetch('/update', {
                            method: 'post',
                            body: data
                        });
                    } catch (e) {
                        console.log(e);
                    }
                });
            }
        });
    }
}

async function removeThing() {
    const selectDeleteForm = document.getElementsByClassName('deleteForm');
    for (i = 0; i < selectDeleteForm.length; i++) {
        const getId = selectDeleteForm[i];
        selectDeleteForm[i].addEventListener('submit', async function (event) {
            event.preventDefault();

            getId.parentNode.parentNode.remove();
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
update();
