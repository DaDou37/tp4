const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());


// POST /tasks - Ajoute une nouvelle tâche
app.post('/tasks', async (req, res) => {
  try {
    const { title, completed } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Le champ "title" est requis'
      });
    }

    const { rows } = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
      [title, completed ?? false]
    );

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la tâche:', error);

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// GET /tasks - Récupère la liste complète des tâches
app.get('/tasks', async (req, res) => {
  try {

    const { rows } = await pool.query(
      'SELECT * FROM tasks ORDER BY id'
    );

    res.json(rows);

  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// PUT /tasks/:id - Modifie une tâche spécifique
app.put('/tasks/:id', async (req, res) => {
  try {

    const { title, completed } = req.body;
    const id = parseInt(req.params.id);

    const { rows } = await pool.query(
      `UPDATE tasks
       SET title = $1,
           completed = $2
       WHERE id = $3
       RETURNING *`,
      [title, completed, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Tâche non trouvée'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Erreur lors de la modification de la tâche:', error);

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// DELETE /tasks/:id - Supprime une tâche spécifique
app.delete('/tasks/:id', async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    const { rows } = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Tâche non trouvée'
      });
    }

    res.status(204).send();

  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// PATCH /tasks/:id/completed - Modifie le statut completed
app.patch('/tasks/:id/completed', async (req, res) => {
  try {

    const id = parseInt(req.params.id);

    let query;
    let values;

  
    if (req.body && req.body.completed !== undefined) {

      query = `
        UPDATE tasks
        SET completed = $1
        WHERE id = $2
        RETURNING *
      `;

      values = [req.body.completed, id];

    } else {

      query = `
        UPDATE tasks
        SET completed = NOT completed
        WHERE id = $1
        RETURNING *
      `;

      values = [id];
    }

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Tâche non trouvée'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});