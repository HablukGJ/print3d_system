import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

// Initialize tables
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         email TEXT UNIQUE NOT NULL,
                                         password TEXT NOT NULL,
                                         name TEXT NOT NULL,
                                         role TEXT CHECK(role IN ('ADMIN', 'USER')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
`);

// Support for additional columns and archived status
const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE name = 'print_requests'").get() as any;

const migrate = (sql: string) => {
    const hasArchived = sql.includes("'archived'");
    const hasFilePath = sql.includes("file_path");

    if (!hasArchived || !hasFilePath) {
        console.log("Migrating print_requests table...");
        db.exec(`
      CREATE TABLE print_requests_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        student_group TEXT NOT NULL,
        comment TEXT,
        file_path TEXT,
        file_original_name TEXT,
        status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'archived')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

        // Figure out which columns to copy
        const columns = ['id', 'user_id', 'full_name', 'student_group', 'comment', 'status', 'created_at'];
        const selectColumns = columns.join(', ');

        db.exec(`
      INSERT INTO print_requests_new (${selectColumns})
      SELECT ${selectColumns} FROM print_requests;
      DROP TABLE print_requests;
      ALTER TABLE print_requests_new RENAME TO print_requests;
    `);
    }
};

if (tableSql) {
    migrate(tableSql.sql);
} else {
    db.exec(`
    CREATE TABLE print_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      student_group TEXT NOT NULL,
      comment TEXT,
      file_path TEXT,
      file_original_name TEXT,
      status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'archived')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export default db;
