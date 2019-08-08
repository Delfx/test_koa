//TODO add new thing without deleting it ///

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
    const selectForm = document.getElementsByClassName('changeForm');
    for (const updateForm of selectForm) {

        updateForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const allForms = updateForm.parentNode;
            const inputField = document.createElement('input');
            const inputFieldHidden = document.createElement('input');
            const creatForm = document.createElement('form');
            const createButton = document.createElement('input');
            const thingText = allForms.querySelector('span').textContent;
            const targetId = event.target.querySelector('.id').value;

            creatForm.method = 'post';
            creatForm.className = ('updateForm d-inline');
            // createForm.classList.add('');
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

            creatForm.appendChild(inputField);
            creatForm.appendChild(createButton);
            creatForm.appendChild(inputFieldHidden);


            // creatUpdateForm.appendChild(creatForm).appendChild(inputField);
            // creatUpdateForm.appendChild(creatForm).appendChild(createButton);
            // creatUpdateForm.appendChild(creatForm).appendChild(inputFieldHidden);

            for (const form of allForms.querySelectorAll('form')) {
                //css Display none -- display block
                form.remove();
            }

            allForms.appendChild(creatForm);

            const selectUpdateForm = document.querySelectorAll('.updateForm');
            // selectUpdateForm.addEventListener('submit', function (event) {
            //     console.log(event.target);
            //     event.preventDefault();
            // });
            for (let i = 0; i < selectUpdateForm.length; i++) {
                const getUpdateForm = selectUpdateForm[i];
                selectUpdateForm[i].addEventListener('submit', async function (event) {
                    console.log("hello");
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

    for (const form of selectDeleteForm) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            const entry = form.parentNode.parentNode;

            const formData = new FormData(form);
            const formBody = new URLSearchParams(formData);

            try {
                const response = await fetch('/delete', {
                    method: 'post',
                    body: formBody
                });

                const data = await response.json();

                if (data.success) {
                    entry.remove();
                }
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
