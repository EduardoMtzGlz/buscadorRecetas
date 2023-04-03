function iniciarApp(){
    
    const selectCategorias = document.querySelector('#categorias'); 
    const resultadosContenedor = document.querySelector('#resultado');
    if(selectCategorias){
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias(); 
    }

    const favoritosDiv = document.querySelector('.favoritos');

    if(favoritosDiv){
        obtenerFavoritos()
    }
    
     
    const modal = new bootstrap.Modal('#modal', {}); 

  
    
    function obtenerCategorias(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';         

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    }

    function mostrarCategorias(categorias =[]){
        categorias.forEach( categoria => {
            const {strCategory} = categoria; 
            const option = document.createElement('OPTION'); 
            option.value = strCategory; 
            option.textContent = strCategory;
            selectCategorias.appendChild(option); 
        }) 
    }

    function seleccionarCategoria(event){
        const categoria = event.target.value; 
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`; 
        
        spinnerCarga(); 
        
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => {
                
                mostrarResultados(resultado.meals)})
    }

    function mostrarResultados(resultados =[]){
        
        limpiarHTML(resultadosContenedor);

        const heading = document.createElement('h2');
        heading.classList.add('text-center', 'text-black', 'my-5'); 
        heading.textContent = resultados.length ? 'Resultados' : 'No hay resultados'; 
        resultadosContenedor.appendChild(heading); 
        
        //Iterar en los resultados 
        resultados.forEach(resultado =>{        

            const {idMeal, strMeal, strMealThumb} = resultado; 

            const resuldatoContenedor = document.createElement('div'); 
            resuldatoContenedor.classList.add('col-md-4'); 

            const resultadoCard = document.createElement('div')
            resultadoCard.classList.add('card', 'mb-4'); 

            const resultadoImagen = document.createElement('img'); 
            resultadoImagen.classList.add('card-img-top');
            resultadoImagen.alt = `Imagen de la receta ${strMeal ?? resultado.titulo}`; 
            resultadoImagen.src = strMealThumb ?? resultado.img; 

            const resultadoCardBody = document.createElement('div'); 
            resultadoCardBody.classList.add('card-body'); 

            const resultadoHeading = document.createElement('h3'); 
            resultadoHeading.classList.add('card-title', 'mb-3'); 
            resultadoHeading.textContent = strMeal ?? resultado.titulo; 

            const resultadoBTN = document.createElement('button'); 
            resultadoBTN.classList.add('btn', 'btn-danger', 'w-100'); 
            resultadoBTN.textContent = 'Ver Receta'; 
            // resultadoBTN.dataset.bsTarget = '#modal'
            // resultadoBTN.dataset.bsToggle = 'modal'
            resultadoBTN.onclick = function () {
                seleccionarResultado(idMeal ?? resultado.id); 
            }
           
            //Inyectando al html

            resultadoCardBody.appendChild(resultadoHeading); 
            resultadoCardBody.appendChild(resultadoBTN); 

            resultadoCard.appendChild(resultadoImagen); 
            resultadoCard.appendChild(resultadoCardBody); 

            resuldatoContenedor.appendChild(resultadoCard); 
            resultadosContenedor.appendChild(resuldatoContenedor); 
        })
    }

    function seleccionarResultado(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`; 

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))

    }

    function mostrarRecetaModal(receta){
        //Muestra el modal 
        const {idMeal, strMeal, strInstructions, strMealThumb} = receta
        
        //Añadir contenido al modal 
        const modalTitle = document.querySelector('#staticBackdropLabel'); 
        const modalBody = document.querySelector('.modal .modal-body'); 

        modalTitle.textContent = strMeal; 

        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes y cantidades</h3>
        `; 

        const listGroup = document.createElement('ul'); 
        listGroup.classList.add('list-group'); 
        //Mostrar o iterar sobre las cantidades 
        for(let i=1; i<=20; i++){
            if(receta[`strIngredient${i}`]){
                const ingrediente = receta[`strIngredient${i}`]; 
                const cantidad = receta[`strMeasure${i}`]; 

                const ingredienteLi = document.createElement('li');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`; 

                listGroup.appendChild(ingredienteLi); 
            }
        }

        modalBody.appendChild(listGroup); 

        const modalFooter = document.querySelector('.modal-footer')
        limpiarHTML(modalFooter); 

        //Botones de cerrar y favoritos
        const btnFavorito = document.createElement('button'); 
        btnFavorito.classList.add('btn', 'btn-danger', 'col'); 
        btnFavorito.textContent = existeEnStorage(idMeal) ? 'Eliminar Favorito' : "Guardar Favorito";
        
        //localStorage
        btnFavorito.onclick = function(){
            if(existeEnStorage(idMeal)){
                elminarFavorito(idMeal)
                btnFavorito.textContent = 'Guardar Favorito'; 
                mostrarToast('Eliminado Correctamente'); 

                setTimeout(() => {
                    window.location.href = "favoritos.html";
                }, 100);
                return
            }


            agregarFavorito({
                id: idMeal, 
                titulo: strMeal,
                img: strMealThumb  
            }); 
            btnFavorito.textContent = 'Eliminar Favorito'; 
            mostrarToast('Agregado Correctamente'); 
        }


        const btnCerrar = document.createElement('button'); 
        btnCerrar.classList.add('btn', 'btn-secondary', 'col'); 
        btnCerrar.textContent = 'Cerrar'; 
        btnCerrar.onclick = function(){
            modal.hide(); 
        }

        modalFooter.appendChild(btnFavorito); 
        modalFooter.appendChild(btnCerrar); 

        

        //Mostrar el modal
        modal.show()

        

    }
  
    
    function spinnerCarga(){
        
        limpiarHTML(resultadosContenedor);
        const divSpinner = document.createElement('div'); 
        divSpinner.classList.add('spinner'); 
        
        divSpinner.innerHTML = `
            <div class="bounce1"></div>
            <div class="bounce2"></div>
            <div class="bounce3"></div>
        `; 
        
        resultadosContenedor.appendChild(divSpinner);
        
        
    }

    function agregarFavorito(receta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; 
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta])); 
    }

    function elminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; 
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id); 
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos)); 

    }

    function existeEnStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; 
        return favoritos.some(favorito => favorito.id === id); 
    }
    
    function limpiarHTML(referencia){
        while(referencia.firstChild){
            referencia.removeChild(referencia.firstChild)
        }
    }

    function mostrarToast(mensaje){
        const toastDiv = document.querySelector('#toast'); 
        const toastBody = document.querySelector('.toast-body'); 
        toastBody.textContent = mensaje; 

        toastDiv.appendChild(toastBody); 

        const toast = new bootstrap.Toast(toastDiv); 
        toast.show(); 
        

    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? []; 
        if(favoritos.length){
            mostrarResultados(favoritos); 
            return;
        }

        const noFavoritos = document.createElement('p'); 
        noFavoritos.textContent = 'No hay elementos'; 
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');

        favoritosDiv.appendChild(noFavoritos); 

    }
}



document.addEventListener('DOMContentLoaded', iniciarApp); 

