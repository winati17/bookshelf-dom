/**
 * [
 *    {
 *  *   id: <int>
 *      task: <string>
 *      timestamp: <string>
 *      isCompleted: <boolean>
 * 
 *      id: string | number,
 *      title: string,
 *      author: string,
 *      year: number,
 *      isComplete: boolean,
 *    }
 * ]
 */

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function isStorageExist() /* boolean */ {
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

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = "Penulis: " + author;

  const textYear = document.createElement('p');
  textYear.innerText = "Tahun: " + year;

  const textContainer = document.createElement('article');
  textContainer.classList.add('book_item');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.classList.add('action');
  textContainer.append(container);

  if (isComplete) {
    const uncompleteButton = document.createElement('button');
    uncompleteButton.classList.add('green');
    uncompleteButton.innerText = "Belum selesai di Baca";
    uncompleteButton.addEventListener('click', function () {
      undoBookFromCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = "Hapus buku";
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(id);
    });

    container.append(uncompleteButton, trashButton);
  } else {
    const completeButton = document.createElement('button');
    completeButton.classList.add('green');
    completeButton.innerText = "Selesai dibaca";
    completeButton.addEventListener('click', function () {
      addBookToCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('red');
    trashButton.innerText = "Hapus buku";
    trashButton.addEventListener('click', function () {
      removeBookFromCompleted(id);
    });
    container.append(completeButton, trashButton);
  }
  return textContainer;
}

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isComplete = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete)
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function removeBookFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
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

function searchBook() {
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("searchBook");
  filter = input.value.toUpperCase();
  ul = document.getElementById("book_item");
  li = ul.getElementsByTagName("h3");
  for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("h3")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
      } else {
          li[i].style.display = "none";
      }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const checkBox = document.getElementById('inputBookIsComplete');
  const booktype = document.getElementById('BookType');
  checkBox.addEventListener('change', function (event) {
    if (checkBox.checked == true) {
      booktype.innerText = "Selesai dibaca";
    } else {
      booktype.innerText = "Belum selesai dibaca";
    }
  });

  const submitForm /* HTMLFormElement */ = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});


document.addEventListener(RENDER_EVENT, function () {
  const listUncompleted = document.getElementById('incompleteBookshelfList');
  const listCompleted = document.getElementById('completeBookshelfList');

  // clearing list item
  listUncompleted.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of books) {
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

