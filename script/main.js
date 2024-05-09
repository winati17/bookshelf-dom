const books = [];
let filteredBookshelf = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  let year = document.getElementById('inputBookYear').value;
  year = parseInt(year);
  const isComplete = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.unshift(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const book = document.createElement("article");
  book.setAttribute("id", id);
  book.classList.add("card", "my-3");

  const bookTitle = document.createElement("h5");
  bookTitle.classList.add("text-truncate");
  bookTitle.style.maxWidth = "200px";
  bookTitle.innerText = title;

  const bookAuthor = document.createElement("span");
  bookAuthor.classList.add("text-truncate", "d-inline-block");
  bookAuthor.style.maxWidth = "200px";
  bookAuthor.innerText = "Penulis: " + author;

  const bookYear = document.createElement("span");
  bookYear.innerText = "Tahun: " + year;

  const br = document.createElement("br");

  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card-body", "border-start", "border-4", "border-primary", "d-flex", "justify-content-between");

  const cardContent = document.createElement("div");
  cardContent.classList.add("card-content");

  const cardAction = addAction(isComplete, id, title);

  cardContent.append(bookTitle, bookAuthor, br, bookYear);
  cardContainer.append(cardContent);
  cardContainer.append(cardAction);
  book.append(cardContainer);

  return book;
}

function addAction(isComplete, id, title) {
  const cardActions = document.createElement("div");

  const actionDelete = createActionDelete(id, title);
  cardActions.append(actionDelete);

  if (!isComplete) {
    const actionToCompleted = createActionToCompleted(id);
    cardActions.append(actionToCompleted);
  } else {
    const actionToUncompleted = createActionToUncompleted(id);
    cardActions.append(actionToUncompleted);
  }

  const editButton = createEditButton(id);
  cardActions.append(editButton);
  return cardActions;
}

function createActionToCompleted(idBook) {
  const action = document.createElement("button");
  action.classList.add("btn", "btn-sm", "btn-outline-warning");
  action.innerHTML = '<i class="bi bi-check"></i>';

  action.addEventListener("click", function () {
    const bookTarget = books.find((book) => book.id === idBook);
    if (!bookTarget) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  })

  return action;
}

function createActionToUncompleted(bookId) {
  const action = document.createElement("button");
  action.classList.add("btn", "btn-sm", "btn-outline-warning");
  action.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';

  action.addEventListener("click", function () {
    const bookTarget = books.find((book) => book.id === bookId);
    if (!bookTarget) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  })

  return action;
}

function addRemoveAlert(id, title) {
  Swal.fire({
    title: "Ingin menghapus?",
    text: "Buku yang dihapus tidak akan kembali",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Iya, hapus!",
    cancelButtonText: "Tidak jadi",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Terhapus!",
        text: "Buku " + title + " terhapus",
        icon: "success",
        showConfirmButton: false,
        timer: 1500
      });
      removeBook(id);
    }
  });
}

function removeBook(bookId) {
  const bookTarget = books.findIndex((book) => book.id === bookId);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function createActionDelete(id, title) {
  const actionDelete = document.createElement("button");
  actionDelete.classList.add("btn", "btn-sm", "btn-outline-danger", "mx-1");
  actionDelete.innerHTML = '<i class="bi bi-x"></i>';

  actionDelete.addEventListener("click", function () {
    addRemoveAlert(id, title);
  });

  return actionDelete;
}

function createEditButton(id){
  const editButton = document.createElement('button');
  editButton.classList.add("btn", "btn-sm", "btn-outline-secondary", "mx-1");
  editButton.innerHTML = '<i class="bi bi-pencil-square"></i>';
  editButton.addEventListener('click', function () {
    addEditAlert(id);
  });

  return editButton;
}

async function addEditAlert(id) {
  const bookTarget = books.find((book) => book.id === id);
  const { value: formValues } = await Swal.fire({
    title: "Edit Buku",
    html: `
      <style>
      p {
        margin-bottom : -12px;
      }
      </style>
      <p>Judul</p>
      <input id="title" type="text" class="swal2-input" value="${bookTarget.title}"  required>
      <p>Penulis</p>
      <input id="author" type="text" class="swal2-input" value="${bookTarget.author}" required>
      <p>Tahun</p>
      <input id="year" type="number" class="swal2-input" value="${bookTarget.year}" required>
    `,
    focusConfirm: false,
    preConfirm: () => {
      return [
        document.getElementById("title").value,
        document.getElementById("author").value,
        document.getElementById("year").value,
      ];
    }
  });
  if (formValues) {
    bookTarget.title = formValues[0];
    bookTarget.author = formValues[1];
    bookTarget.year = formValues[2];
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function bookSearch(keyword) {
  if (!keyword) {
    filteredBookshelf = books;
    return
  }
  const filter = keyword.toUpperCase();
  filteredBookshelf = books.filter((book) => {
    return book.title.toUpperCase().includes(filter)
  });
  console.log(filteredBookshelf);
}

document.addEventListener('DOMContentLoaded', function () {
  bookSearch();

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
    document.getElementById("inputBook").reset();
  });

  const searchSubmit = document.getElementById('searchBook');
  searchSubmit.addEventListener('submit', function (event) {
    event.preventDefault();
    const inputSearch = document.getElementById("searchBookTitle").value;
    console.log(inputSearch);
    bookSearch(inputSearch);
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
});


document.addEventListener(RENDER_EVENT, function () {
  const listUncompleted = document.getElementById('incompleteBookshelfList');
  const listCompleted = document.getElementById('completeBookshelfList');

  listUncompleted.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of filteredBookshelf) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(bookElement);
    } else {
      listUncompleted.append(bookElement);
    }
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});