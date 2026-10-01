CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    assignee VARCHAR(50)
);

INSERT INTO tasks (title, completed, assignee) VALUES
('Apprendre à créer des applications', FALSE, 'John'),
('Apprendre à utiliser Git', TRUE, 'Jane'),
('Apprendre à utiliser Docker', FALSE, 'Alice');