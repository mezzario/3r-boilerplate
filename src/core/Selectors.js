import {createSelector} from "reselect"

const pathnameSelector = state => (state.routing.location || {}).pathname || ""
const todosSelector = state => state.todos

export const getTodosData = createSelector(
  pathnameSelector,
  todosSelector,
  (path, todos) => {
    path = path.replace(/^\/*|\/*$/gi, "")

    let todosView = path
    let filteredTodos = todos
    const activeTodos = todos.filter(todo => !todo.completed)

    switch (path) {
      case "active":
        filteredTodos = activeTodos
        break

      case "completed":
        filteredTodos = todos.filter(todo => todo.completed)
        break

      default:
        todosView = ""
        break
    }

    return {
      todosView,
      todos: filteredTodos,
      todosTotal: todos.length,
      todosLeft: activeTodos.length,
    }
  }
)
