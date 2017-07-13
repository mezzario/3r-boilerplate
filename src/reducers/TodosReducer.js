import * as ReduxActions from "redux-actions"
import * as Action from "../core/Actions"

export default ReduxActions.handleActions({
  [Action.AddTodo]: (state, action) => {
    let nextId = (state.length > 0 ? Math.max.apply(null, state.map(o => o.id)) : 0) + 1

    return [
      ...(Array.isArray(action.payload) ? action.payload : [action.payload])
        .map(text => ({id: nextId++, text, completed: false})),
      ...state
    ]
  },

  [Action.DeleteTodo]: (state, action) =>
    state.filter(todo => todo.id !== action.payload),

  [Action.EditTodoText]: (state, action) =>
    state.map(todo => todo.id === action.payload.id
      ? {...todo, text: action.payload.text}
      : todo),

  [Action.SetTodoCompletion]: (state, action) =>
    state.map(todo => todo.id === action.payload.id
      ? {...todo, completed: action.payload.completed}
      : todo),

  [Action.ClearCompletedTodos]: (state/*, action*/) =>
    state.filter(todo => !todo.completed),

}, [])
