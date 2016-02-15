import * as ReduxActions from "redux-actions";
import { TodosView } from "./Todos";

interface Action<T> extends Function {
    (payload: T): any;
    (payload: Promise<T>): any;
}

export const AddTodo = "AddTodo";
export type AddTodoFunc = Action<string | string[]>;
export const addTodo: AddTodoFunc = ReduxActions.createAction(AddTodo);

export const DeleteTodo = "DeleteTodo";
export type DeleteTodoFunc = Action<number>;
export const deleteTodo: DeleteTodoFunc = ReduxActions.createAction(DeleteTodo);

export const EditTodoText = "EditTodoText";
export type EditTodoTextFunc = Action<{ id: number, text: string }>;
export const editTodoText: EditTodoTextFunc = ReduxActions.createAction(EditTodoText);

export const SetTodoCompletion = "SetTodoCompletion";
export type SetTodoCompletionFunc = Action<{ id: number, completed: boolean }>;
export const setTodoCompletion: SetTodoCompletionFunc = ReduxActions.createAction(SetTodoCompletion);

export const ClearCompletedTodos = "ClearCompletedTodos";
export type ClearCompletedTodosFunc = () => any;
export const clearCompletedTodos: ClearCompletedTodosFunc = ReduxActions.createAction(ClearCompletedTodos);
