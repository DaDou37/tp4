const express = require('express');
const pool = require('./db');
const cors = require('cors');
const Joi = require('joi');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));

// Validation des données d'une tâche
const taskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .max(255),

  completed: Joi.boolean()
    .default(false),

  assignee: Joi.string()
    .trim()
    .max(50)
    .allow('', null)
    .optional()
});



// POST /tasks Ajouter une nouvelle tâche


app.post('/tasks', async (req, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const {
      title,
      completed,
      assignee
    } = value;

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, completed, assignee)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        title,
        completed,
        assignee || null
      ]
    );

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error(
      'Erreur lors de l\'ajout de la tâche:',
      error
    );

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// GET /tasks Récupérer les tâches


app.get('/tasks', async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM tasks';
    const values = [];

    if (status === 'completed') {
      query += ' WHERE completed = $1';
      values.push(true);

    } else if (status === 'pending') {
      query += ' WHERE completed = $1';
      values.push(false);

    } else if (status !== undefined) {
      return res.status(400).json({
        error:
          'Le paramètre "status" doit valoir "completed" ou "pending"'
      });
    }

    query += ' ORDER BY id';

    const { rows } = await pool.query(query, values);

    res.json(rows);

  } catch (error) {
    console.error(
      'Erreur lors de la récupération des tâches:',
      error
    );

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// PUT /tasks/:id Modifier une tâche

app.put('/tasks/:id', async (req, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }

    const {
      title,
      completed,
      assignee
    } = value;

    const id = parseInt(req.params.id);

    const { rows } = await pool.query(
      `UPDATE tasks
       SET title = $1,
           completed = $2,
           assignee = $3
       WHERE id = $4
       RETURNING *`,
      [
        title,
        completed,
        assignee || null,
        id
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Tâche non trouvée'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(
      'Erreur lors de la modification de la tâche:',
      error
    );

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// DELETE /tasks/:id Supprimer une tâche

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
    console.error(
      'Erreur lors de la suppression de la tâche:',
      error
    );

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// PATCH /tasks/:id/completed Modifier le statut completed

app.patch('/tasks/:id/completed', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    let query;
    let values;

    if (
      req.body &&
      req.body.completed !== undefined
    ) {
      query = `
        UPDATE tasks
        SET completed = $1
        WHERE id = $2
        RETURNING *
      `;

      values = [
        req.body.completed,
        id
      ];

    } else {
      query = `
        UPDATE tasks
        SET completed = NOT completed
        WHERE id = $1
        RETURNING *
      `;

      values = [id];
    }

    const { rows } = await pool.query(
      query,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Tâche non trouvée'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(
      'Erreur lors de la modification du statut:',
      error
    );

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// PATCH /tasks/:id/assignee Retirer le bénévole sans supprimer la tâche

app.patch('/tasks/:id/assignee', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const { rows } = await pool.query(
      `UPDATE tasks
       SET assignee = NULL
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Tâche non trouvée'
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error(
      'Erreur lors de la suppression du bénévole:',
      error
    );

    res.status(500).json({
      error: 'Erreur serveur'
    });
  }
});


// Démarrage du serveur

app.listen(PORT, () => {
  console.log(
    `Serveur lancé sur http://localhost:${PORT}`
  );
});
