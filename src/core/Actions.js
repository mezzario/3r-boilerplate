import {createAction} from "redux-actions"

export const AddTodo = "AddTodo"
export const addTodo = createAction(AddTodo)

export const DeleteTodo = "DeleteTodo"
export const deleteTodo = createAction(DeleteTodo)

export const EditTodoText = "EditTodoText"
export const editTodoText = createAction(EditTodoText)

export const SetTodoCompletion = "SetTodoCompletion"
export const setTodoCompletion = createAction(SetTodoCompletion)

export const ClearCompletedTodos = "ClearCompletedTodos"
export const clearCompletedTodos = createAction(ClearCompletedTodos)
