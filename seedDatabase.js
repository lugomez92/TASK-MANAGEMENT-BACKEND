const db = require('./data/database');
const bcrypt = require('bcryptjs');
const seedData = require('./data/seedData.json');

// Function to clear the database before seeding
const clearDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM tasks", (err) => {
        if (err) return reject(err);
        db.run("DELETE FROM users", (err) => {
          if (err) return reject(err);
          db.run("DELETE FROM teams", (err) => {
            if (err) return reject(err);
            db.run("DELETE FROM team_engineers", (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        });
      });
    });
  });
};

// Function to seed the database
const seedDatabase = async () => {
  await clearDatabase();

  // Insert users
  for (const user of seedData.users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO users (id, name, email, password, role, teamId) VALUES (?, ?, ?, ?, ?, ?)", [user.id, user.name, user.email, hashedPassword, user.role, user.teamId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  // Insert teams and team_engineers
  for (const team of seedData.teams) {
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO teams (id, name, managerId, pmId) VALUES (?, ?, ?, ?)", [team.id, team.name, team.managerId, team.pmId], (err) => {
        if (err) reject(err);
        resolve();
      });
    });

    for (const engineerId of team.engineerIds) {
      await new Promise((resolve, reject) => {
        db.run("INSERT INTO team_engineers (teamId, engineerId) VALUES (?, ?)", [team.id, engineerId], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    }
  }

  // Insert tasks
  for (const task of seedData.tasks) {
    await new Promise((resolve, reject) => {
      db.run("INSERT INTO tasks (id, title, description, status, assignedTo, teamId, dueDate, priority, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [task.id, task.title, task.description, task.status, task.assignedTo, task.teamId, task.dueDate, task.priority, task.comments], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
};

seedDatabase().then(() => {
  console.log('Database seeded successfully');
  db.close();
}).catch((err) => {
  console.error('Error seeding database:', err);
  db.close();
});