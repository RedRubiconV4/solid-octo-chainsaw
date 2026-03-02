import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
    host: 'db', 
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'todoapp'
    // connectionString: 'postgresql://postgres:postgres@db:5432/todoapp' // same as above
});

export default pool