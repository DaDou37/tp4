import { useEffect, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [filter, setFilter] = useState('all');
  const [assignee, setAssignee] = useState('');

  // Chargement des tâches depuis l'API
  async function loadTasks(currentFilter = filter) {
    try {
      setError('');

      let url = `${API_URL}/tasks`;

      if (currentFilter !== 'all') {
        url += `?status=${currentFilter}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erreur API');
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      setError("Impossible de contacter l'API");
    }
  }

  // Chargement initial et lorsque le filtre change
  useEffect(() => {
    async function fetchTasks() {
      try {
        setError('');

        let url = `${API_URL}/tasks`;

        if (filter !== 'all') {
          url += `?status=${filter}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Erreur API');
        }

        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error(error);
        setError("Impossible de contacter l'API");
      }
    }

    fetchTasks();
  }, [filter]);

  // Ajout d'une nouvelle tâche
  async function addTask(event) {
    event.preventDefault();

    setMessage('');
    setError('');
    setTitleError('');

    if (!title.trim()) {
      setTitleError('Le titre est requis');
      return;
    }

    if (title.length > 255) {
      setTitleError('Le titre ne peut pas dépasser 255 caractères');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          completed: false,
          assignee: assignee.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la tâche');
      }

      setTitle('');
      setAssignee('');
      setMessage('Tâche créée avec succès');

      await loadTasks();
    } catch (error) {
      console.error(error);
      setError('Impossible de créer la tâche');
    }
  }

  // Mise à jour du statut de la tâche
  async function toggleTask(id) {
    try {
      setMessage('');
      setError('');

      const response = await fetch(
        `${API_URL}/tasks/${id}/completed`,
        {
          method: 'PATCH'
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la modification');
      }

      setMessage('Statut de la tâche modifié.');

      await loadTasks();
    } catch (error) {
      console.error(error);
      setError('Impossible de modifier la tâche.');
    }
  }

  // Suppression d'une tâche
  async function deleteTask(id, taskTitle) {
    try {
      setMessage('');
      setError('');

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setMessage(`Tâche "${taskTitle}" supprimée avec succès.`);

      await loadTasks();
    } catch (error) {
      console.error(error);
      setError('Impossible de supprimer la tâche.');
    }
  }

  // Suppression du bénévole sans supprimer la tâche
  async function removeAssignee(id) {
    try {
      setMessage('');
      setError('');

      const response = await fetch(
        `${API_URL}/tasks/${id}/assignee`,
        {
          method: 'PATCH'
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du bénévole');
      }

      setMessage('Bénévole retiré de la tâche.');

      await loadTasks();
    } catch (error) {
      console.error(error);
      setError('Impossible de retirer le bénévole.');
    }
  }

  function changeFilter(newFilter) {
    setMessage('');
    setFilter(newFilter);
  }

  return (
    <>
      <header>
        <h1>Gestion des tâches</h1>
      </header>

      <main>
        {message && <p role="status">{message}</p>}

        {error && <p role="alert">{error}</p>}

        <section aria-labelledby="add-task-title">
          <h2 id="add-task-title">Ajouter une tâche</h2>

          <form onSubmit={addTask} noValidate>
            <label htmlFor="task-title">
              Titre :
            </label>

            <input
              id="task-title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={titleError ? 'true' : undefined}
              aria-describedby={
                titleError ? 'title-error' : undefined
              }
              maxLength={255}
            />

            {titleError && (
              <p id="title-error" role="alert">
                {titleError}
              </p>
            )}

            <label htmlFor="task-assignee">
              Prénom du bénévole :
            </label>

            <input
              id="task-assignee"
              name="assignee"
              type="text"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              maxLength={50}
            />

            <button type="submit">
              Ajouter la tâche
            </button>
          </form>
        </section>

        <section aria-labelledby="filter-tasks-title">
          <h2 id="filter-tasks-title">
            Filtrer les tâches
          </h2>

          <div>
            <button
              type="button"
              onClick={() => changeFilter('all')}
              aria-pressed={filter === 'all'}
            >
              Toutes
            </button>

            <button
              type="button"
              onClick={() => changeFilter('completed')}
              aria-pressed={filter === 'completed'}
            >
              Terminées
            </button>

            <button
              type="button"
              onClick={() => changeFilter('pending')}
              aria-pressed={filter === 'pending'}
            >
              En cours
            </button>
          </div>
        </section>

        <section aria-labelledby="tasks-title">
          <h2 id="tasks-title">
            Liste des tâches
          </h2>

          {!error && tasks.length === 0 && (
            <p>Aucune tâche pour le moment.</p>
          )}

          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <input
                  id={`task-${task.id}`}
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />

                <label htmlFor={`task-${task.id}`}>
                  {task.title}
                </label>

                {' - '}

                {task.completed ? 'Terminée' : 'En cours'}

                <div>
                  {task.assignee ? (
                    <>
                      <span>
                        Bénévole : {task.assignee}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeAssignee(task.id)}
                      >
                        Retirer le bénévole
                      </button>
                    </>
                  ) : (
                    <span>
                      Aucun bénévole assigné
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id, task.title)}
                  aria-label={`Supprimer la tâche ${task.title}`}
                >
                  Supprimer la tâche
                </button>
              </li>
            ))}
          </ul>
          <p id="privacy-notice">
            L'association collecte uniquement le prénom du bénévole
            afin de savoir qui s'occupe de la tâche. Le prénom est
            conservé avec la tâche et supprimé lorsque la tâche est
            supprimée. Pour demander sa suppression plus tôt :
            contact@association.example
          </p>
        </section>
      </main>
    </>
  );
}

export default App;
