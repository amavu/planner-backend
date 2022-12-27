const { Pool } = require("pg");

const connection = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function getUserById(id) {
  return database
    .query(
      `
      SELECT * FROM users WHERE id = $1
    `,
      [id]
    )
    .then((results) => results.rows[0]);
}

function getUserByEmail(email) {
  return database
    .query(
      `
    SELECT id, firstname, surname, email, password, img FROM users WHERE email = $1
  `,
      [email]
    )
    .then((results) => results.rows[0]);
}

function createUser(firstname, surname, email, password, img) {
  return database
    .query(
      `
    INSERT INTO users
      (firstname, surname, email, password, img)
    VALUES
      ($1, $2, $3, $4, $5)
    RETURNING
      *
  `,
      [firstname, surname, email, password, img]
    )
    .then((results) => results.rows[0]);
}

// function editUser(id, firstname, surname, email, password, img) {
//   return database
//     .query(
//       `UPDATE users SET (firstname, surname, email, password, img) = ($2, $3, $4, $5, $6)
//       WHERE id = $1
//       RETURNING
//       *
//       `,
//       [id, firstname, surname, email, password, img]
//     )
//     .then((results) => results.rows[0]);
// }

function editUser(id, firstname, surname, email) {
  return database
    .query(
      `UPDATE users SET (firstname, surname, email) = ($2, $3, $4)
      WHERE id = $1
      RETURNING
      *
      `,
      [id, firstname, surname, email]
    )
    .then((results) => results.rows[0]);
}

function getToDoLists(userId) {
  return database
    .query(
      `SELECT * FROM todolist 
    LEFT JOIN usertodolist ON usertodolist.userid = ${userId}
    WHERE todolist.id = usertodolist.todolistid`
    )
    .then((results) => results.rows);
}

function getToDosById(id) {
  return database
    .query(
      `SELECT *
    FROM todo
    WHERE todolistid = ${id}`
    )
    .then((results) => results.rows);
}

function createToDoList(name, createdAt, owner, day) {
  return database
    .query(
      `
    INSERT INTO todolist
      (name, createdAt, owner, day)
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      *
  `,
      [name, createdAt, owner, day]
    )
    .then((results) => {
      console.log(results.rows);
      console.log("today ", new Date());
      return results.rows[0];
    });
}

function createToDo(text, startTime, checked, todolistId) {
  return database
    .query(
      `
    INSERT INTO todo
      (text, starttime, checked, todolistid)
    VALUES
      ($1, $2, $3, $4)
    RETURNING
      *
  `,
      [text, startTime, checked, todolistId]
    )
    .then((results) => results.rows[0]);
}

function editToDo(id, text, startTime) {
  return database
    .query(
      `UPDATE todo SET (text, starttime) = ($2, $3)
      WHERE id = $1
      RETURNING
      *
      `,
      [id, text, startTime]
    )
    .then((results) => results.rows[0]);
}

function checkedToDo(todoId, checked) {
  return database
    .query(
      `UPDATE todo
    SET checked = ${checked}
    WHERE id = ${todoId}
    RETURNING
      *
      `
    )
    .then((results) => results.rows[0]);
}

function getToDoById(id) {
  return database
    .query(
      `SELECT *
    FROM todo
    WHERE id = ${id}`
    )
    .then((results) => results.rows[0]);
}

function getToDoListById(id) {
  return database
    .query(
      `SELECT *
    FROM todolist
    WHERE id = ${id}`
    )
    .then((results) => results.rows[0]);
}

function deleteToDoById(id) {
  return database
    .query(
      `DELETE 
    FROM todo
    WHERE id = ${id}`
    )
    .then((results) => results.rows);
}

function deleteToDoListById(id) {
  return database
    .query(
      `DELETE 
    FROM todolist
    WHERE id = ${id}`
    )
    .then((results) => results.rows);
}

function shareToDoListWithUser(userId, todolistId) {
  return database
    .query(
      `INSERT INTO usertodolist(userid, todolistid) 
    VALUES(${userId}, ${todolistId})`
    )
    .then((results) => results.rows);
}

// async function deleteUser(id) {
//   console.log(id);
//   const query = await db
//     .multi(
//       `
//       DELETE FROM likes WHERE from_user_id = ${id} OR to_user_id = ${id};
//       DELETE FROM messages WHERE from_user_id = ${id} OR to_user_id = ${id};
//       DELETE from users WHERE id = ${id};
//       `
//     )
//     .then((res) => {
//       return res.rows;
//     });
//   return { userDeleted: true };
// }

module.exports = {
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
};
