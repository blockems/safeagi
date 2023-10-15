import json
import sqlite3

# Replace 'your_database.db' with the actual path to your SQLite database file
db_file = './data/database.db'
json_file = 'demand_tracker_db.json'  # JSON data file

# Open a connection to the database
conn = sqlite3.connect(db_file)

try:
    # Create a cursor object to interact with the database
    cursor = conn.cursor()

    # Read JSON data from the file
    with open(json_file, 'r') as file:
        data = json.load(file)

    # Iterate over the JSON data and insert each task into the 'tasks' table
    for task in data:
        cursor.execute(
            "INSERT INTO tasks (id, name, category, parent, as_a, i_want_to, so_i_can, ac) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                task["id"],
                task["name"],
                task["category"],
                task["parent"],
                task["as_a"],
                task["i_want_to"],
                task["so_i_can"],
                task["ac"],
            ),
        )

    # Commit the changes to the database
    conn.commit()

    print(f"Data from '{json_file}' loaded into the 'tasks' table successfully.")

except sqlite3.Error as e:
    print(f"Error: {e}")

finally:
    # Close the database connection
    conn.close()
