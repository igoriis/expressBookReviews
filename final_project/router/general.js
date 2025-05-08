const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!doesExist(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

public_users.get("/users",(req,res)=>{
    // Send JSON response with formatted friends data
    res.send(JSON.stringify(users,null,4));

});

const getAllBooks = async function () {
    let booksJSON = JSON.stringify(books, null, 4);
    if (booksJSON) {
        return booksJSON;
    } else {
        throw new Error("getAllBooks failed!");
    }
}
// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    let booksJSON;
    try {
        booksJSON = await getAllBooks();
      } catch (error) {
        res.status(500).json({message: error.message});
    }
    res.send(booksJSON);
});


function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let book = books[isbn]; 
        if (book) { 
            resolve(book);
        } else { 
            reject("getBookByISBN failed!");
        } 
    });
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
    .then(book => {
        res.send(book);
    })
    .catch(error => {
        res.status(500).json({message: error});
    });
 });


 function getBooksByAutor(author) {
    return new Promise(resolve => {
        let result = {};
        for (var isbn in books) {
            if (books[isbn].author.includes(author)) {
                result[isbn] = books[isbn];
            }
        }
        resolve(result);
    });
}
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    getBooksByAutor(req.params.author)
    .then(result => {
        res.send(result);
    });
});


function getBooksByTitle(title) {
    return new Promise(resolve => {
        let result = {};
        for (var isbn in books) {
            if (books[isbn].title.includes(title)) {
                result[isbn] = books[isbn];
            }
        }
        resolve(result);
    });
}
// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    getBooksByTitle(req.params.title)
    .then(result => {
        res.send(result);
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn].reviews);
});

module.exports.general = public_users;
