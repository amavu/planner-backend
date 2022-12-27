require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  getUserById,
  getUserByEmail,
  createUser,
  editUser,
  getToDosById,
  getToDoLists,
  createToDoList,
  createToDo,
  editToDo,
  getToDoById,
  getToDoListById,
  deleteToDoById,
  deleteToDoListById,
  shareToDoListWithUser,
  checkedToDo,
} = require("./services/database");

// Express Server

const port = process.env.PORT;
const secret = process.env.SECRET;

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Server functions

app.get("/", (req, res) => {
  res.send({ message: "Hello from Planner API!" });
});

app.get("/users/:userid", async (req, res) => {
  try {
    const userId = req.params.userid;
    const user = await getUserById(userId);
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.post("/signup", async (req, res) => {
  const { firstname, surname, email, password, img } = req.body;
  // Hashing password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const newUser = await createUser(
      firstname,
      surname,
      email,
      hashedPassword,
      img
    );
    res.send(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.put("/users/:userid", async (req, res) => {
  const { id, firstname, surname, email, img } = req.body;

  const user = await getUserById(id);

  try {
    const updatedUser = editUser(id, firstname, surname, email, img);

    res.send(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

//With password edit
// app.put("/users/:userid", async (req, res) => {
//   const { id, firstname, surname, email, password, img } = req.body;

//   // checks if password is changed for re-hashing
//   const user = await getUserById(id);
//   const passwordIsChanged = user.password !== password;
//   let newPassword = "";

//   if (passwordIsChanged) {
//     const saltRounds = 10;
//     newPassword = await bcrypt.hash(password, saltRounds);
//   }

//   try {
//     const updatedUser = editUser(
//       id,
//       firstname,
//       surname,
//       email,
//       passwordIsChanged ? newPassword : password,
//       img
//     );

//     res.send(updatedUser);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       error: "Unable to contact database - please try again",
//     });
//   }
// });

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).send({ error: "Unknown user" });
    }
    // Load hash from your password DB
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      console.log("not correct password");
      return res.status(401).send({ error: "Wrong password" });
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          surname: user.surname,
        },
        Buffer.from(secret, "base64")
      );
      res.send({
        token: token,
      });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/todolists/:userId", async (req, res) => {
  const toDoLists = await getToDoLists(req.params.userId);
  res.status(200).send(toDoLists);
});

app.get("/todos/:id", async (req, res) => {
  try {
    const todolistId = req.params.id;
    const todos = await getToDosById(todolistId);
    res.send(todos);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.post("/todolists", async (req, res) => {
  const { name, owner, day } = req.body;

  try {
    const newToDoList = await createToDoList(
      name,
      new Date().toISOString(),
      owner,
      day
    );
    await shareToDoListWithUser(owner, newToDoList.id);
    res.send(newToDoList);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.post("/todo", async (req, res) => {
  const { text, startTime, checked, todolistId } = req.body;

  try {
    const newToDo = await createToDo(text, startTime, checked, todolistId);
    res.send(newToDo);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.put("/todo/:id", async (req, res) => {
  const { id, text, startTime } = req.body;

  try {
    const newToDo = await editToDo(id, text, startTime);
    res.send(newToDo);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.put("/checktodo/:todoId", async (req, res) => {
  const { checked } = req.body;

  try {
    const newToDo = await checkedToDo(req.params.todoId, checked);
    res.send(newToDo);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.get("/todo/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const todos = await getToDoById(todoId);
    res.send(todos);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.get("/todolist/:id", async (req, res) => {
  try {
    const todoListId = req.params.id;
    const todoList = await getToDoListById(todoListId);
    res.send(todoList);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.delete("/todo/:id", async (req, res) => {
  try {
    const todoId = req.params.id;
    const todo = await deleteToDoById(todoId);
    res.status(200).send(todo);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.delete("/todolist/:id", async (req, res) => {
  try {
    const todolistId = req.params.id;
    const todolist = await deleteToDoListById(todolistId);
    res.status(200).send(todolist);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

app.post("/sharetodolist/:todolistId", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).send({ error: "Unknown user" });
    }
    const shareToDoList = await shareToDoListWithUser(
      user.id,
      req.params.todolistId
    );
    res.send(shareToDoList);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Unable to contact database - please try again",
    });
  }
});

var server = http.createServer(app);

server.listen(port, () => {
  console.log(`Planner API listening on port ${port}`);
});
