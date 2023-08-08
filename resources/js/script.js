//Sve dijelove DOM-a koji su potrebni za kod
const listContainer = document.querySelector("[data-lists]")
const tasksContainer = document.querySelector("[data-tasks]")
const newListForm = document.querySelector("[data-new-list]")
const newListInput = document.querySelector("[data-new-list-input]")
const newTaskForm = document.querySelector("[data-new-task]")
const newTaskInput = document.querySelector("[data-new-task-input]")
const listTitle = document.querySelector("[data-list-title]")
const tasksLeft = document.querySelector("[data-tasks-left]")
const deleteListBtn = document.querySelector("[data-delete-list]")
const deleteCompletedBtn = document.querySelector("[data-delete-completed]")

//Local Storage - za pamćenje podataka
const LOCAL_STORAGE_LIST_KEY = "task.lists"
const LOCAL_STORAGE_SELECTED_LIST_ID = "task.selectedList"
//Inicijalizacija liste koja će loadat-i liste (iz local storage-a ili prazan array)
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []
//Za pamćenje ID-a odabrane liste 
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID)

//Event listener za kliknuti li element u listi lista
listContainer.addEventListener("click", e => {
    if(e.target.tagName.toLowerCase() === "li"){
        selectedListId = e.target.dataset.listId
        //funkcija za ažuriranje imena liste na desnoj strani stranice
        loadList(e.target.innerText)
        //ažuriranje stranice
        saveAndRender()
    }
})

//Event listener za kliknuti task (za praćenje broja dovršenih i nedovršenih task-ova)
tasksContainer.addEventListener("click", e => {
    if(e.target.tagName.toLowerCase() === "input"){
        let sel = lists.find(l => l.id === selectedListId)
        sel.tasks.forEach(task => {
            if(task.name === e.target.nextElementSibling.innerText){
                task.checked = !task.checked
                tasksLeft.innerHTML = `${sel.tasks.filter(task => !task.checked).length} tasks left`
                //ažuriranje stranice
                saveAndRender()
            }
        })
    }
})

//Za ažuriranje imena liste na desnoj strani stranice pri promjeni liste
function loadList(list){
    if(!list) return
    listTitle.innerText = list
}

//Event listener button-a za brisanje odabrane liste
deleteListBtn.addEventListener("click", () => {
    //funkcija za brisanje liste
    deleteList()
});

//Ako je odabrana lista filtrira se kroz lists da bi se izbacila odabrana lista
function deleteList(){
    if(selectedListId){
        lists = lists.filter(list => list.id !== selectedListId)
        listTitle.innerText = "Select a List"
        tasksLeft.innerText = "No tasks left"
        //poziva clear funckiju sa tasksContainer-om kao argument
        clear(tasksContainer)
        //ažuriranje stranice
        saveAndRender()
    }
}

//Event listener za brisanje dovršenih task-ova odabrane liste
deleteCompletedBtn.addEventListener("click", () => {
    if(selectedListId){
        let l = lists.find(list => list.id === selectedListId);
        l.tasks = l.tasks.filter(task => !task.checked)
        //ažuriranje stranice
        saveAndRender()
    }
})

//Event listener za dodavanje nove liste
newListForm.addEventListener("submit", e => {
    e.preventDefault()
    if(newListInput.value == null || newListInput.value === "") return
    //funkcija za kreiranje nove liste
    const newList = createElement(newListInput.value)
    lists.push(newList)
    newListInput.value = "";
    //ažuriranje stranice
    saveAndRender()
})

//Event listener za kreiranja novog zadatka odabrane liste
newTaskForm.addEventListener("submit", e => {
    e.preventDefault()
    if(newTaskInput.value == null || newTaskInput === "" || selectedListId == null) return
    //funckija za kreiranje novog zadatka
    const newTask = createTask(newTaskInput.value)
    let selectedList = lists.find(list => list.id === selectedListId)
    selectedList.tasks.push(newTask)
    newTaskInput.value = ""
    //ažuriranje stranice
    saveAndRender()
})

//Kreira novu listu za ID-om, imenom i listom zadataka
function createElement(name){
    return {id: Date.now().toString(), name: name, tasks: []}
}

//Kreira novi zadatak sa imenom i booleanom checked
function createTask(taskName){
    return {name: taskName, checked: false}
}

//poziva funckije save i render
function saveAndRender(){
    save()
    render()
}

//Sprema liste i odabranu listu u local storage
function save(){
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY,JSON.stringify(lists))
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID, selectedListId)
}

//Za render-anje stranice
function render(){
    //poziva clear funckiju sa listContainer-om kao argument
    clear(listContainer);
    //prolazi kroz svaku listu i kreira tu listu na DOM-u
    lists.forEach(list => {
        let newList = document.createElement("li")
        newList.dataset.listId = list.id
        newList.classList.add("list")
        newList.innerText = list.name
        //označuje odabranu listu
        if(list.id === selectedListId){
            newList.classList.add("selected")
            if(list.tasks != null){
                //poziva clear funcij za tasksContainer-om kao argument
                clear(tasksContainer)
                let newId
                //prolazi kroz svaki zadatak(task) u listi i kreira ga u DOM-u
                list.tasks.forEach(task => {
                    newId = Date.now() + Math.random().toString()
                    let newTaskContainer = document.createElement("div")
                    newTaskContainer.classList.add("task")
                    let newInput = document.createElement("input")
                    newInput.setAttribute("type", "checkbox")
                    newInput.setAttribute("id", newId)
                    newInput.checked = task.checked
                    let newLabel = document.createElement("label")
                    newLabel.setAttribute("for", newId)
                    let newSpan = document.createElement("span")
                    newSpan.classList.add("custom-checkbox")
                    newLabel.appendChild(newSpan)
                    const textNode = document.createTextNode(task.name)
                    newLabel.appendChild(textNode)
                    newTaskContainer.appendChild(newInput)
                    newTaskContainer.appendChild(newLabel)
                    tasksContainer.appendChild(newTaskContainer)
                })
                //Za ažuriranje imena liste i broj nedovršenih zadataka na desnoj strani stranice
                loadList(list.name)
                tasksLeft.innerHTML = `${list.tasks.filter(task => !task.checked).length} tasks left`
            }
        }
        listContainer.appendChild(newList);     
    });
}

//briše sve što se nalazi u elementu
function clear(element){
    while(element.firstChild){
        element.removeChild(element.firstChild)
    }
}

render()