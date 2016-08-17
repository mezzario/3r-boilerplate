import * as ReduxActions from "redux-actions"

export const AddTodo = "AddTodo"
export const addTodo = ReduxActions.createAction(AddTodo)

export const DeleteTodo = "DeleteTodo"
export const deleteTodo = ReduxActions.createAction(DeleteTodo)

export const EditTodoText = "EditTodoText"
export const editTodoText = ReduxActions.createAction(EditTodoText)

export const SetTodoCompletion = "SetTodoCompletion"
export const setTodoCompletion = ReduxActions.createAction(SetTodoCompletion)

export const ClearCompletedTodos = "ClearCompletedTodos"
export const clearCompletedTodos = ReduxActions.createAction(ClearCompletedTodos)
