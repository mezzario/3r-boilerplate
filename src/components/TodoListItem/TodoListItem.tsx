/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react"; React;
import * as ReactRedux from "react-redux";
const shouldPureComponentUpdate = require("react-pure-render/function") as Function;
const classNames = require("classnames") as ClassNamesFn;
const Styles = require("./TodoListItem.less");
import { TodoItem } from "../../core/Todos";
import * as Action from "../../core/Actions";

interface TodoListItemProps extends React.Props<TodoListItem> {
    todo: TodoItem;
    style: React.CSSProperties;

    onBeforeEdit?: () => any;

    deleteTodo?: Action.DeleteTodoFunc;
    editTodoText?: Action.EditTodoTextFunc;
    setTodoCompletion?: Action.SetTodoCompletionFunc;
}

interface TodoListItemState {
    editMode: boolean;
}

export default class TodoListItem extends React.Component<TodoListItemProps, TodoListItemState> {
    private _textInput: HTMLInputElement;

    constructor(props: TodoListItemProps) {
        super(props);

        this.state = { editMode: false };
    }

    shouldComponentUpdate(nextProps: TodoListItemProps, nextState: TodoListItemState, nextContext) {
        return shouldPureComponentUpdate.apply(this, Array.prototype.slice.call(arguments));
    }

    private handleTextInputKeyDown(e: React.KeyboardEvent) {
        if (e.which === 13)
            this.saveTodoText((e.target as HTMLInputElement).value);
        else if (e.which === 27)
            this.setEditMode(false);
    }

    private handleTextInputRefUpdate(ref: HTMLInputElement) {
        this._textInput = ref;

        if (ref) {
            ref.focus();
            ref.setSelectionRange(0, ref.value.length);
        }
    }

    private saveTodoText(newText: string) {
        let text = newText.trim();
        if (text && text !== this.props.todo.text)
            this.props.editTodoText({ id: this.props.todo.id, text });

        this.setEditMode(false);
    }

    setEditMode(editMode: boolean) {
        if (editMode && this.props.onBeforeEdit)
            this.props.onBeforeEdit();

        this.setState({ editMode });
    }

    render() {
        let { todo } = this.props;
        let { editMode } = this.state;

        return <div className={classNames("ui attached segment", Styles.root, { "completed": todo.completed, "edit": editMode })}
            style={Object.assign({}, this.props.style)}
            onDoubleClick={e => this.setEditMode(true)}>

            <div className="checkbox-wrapper">
                <div className={classNames("ui slider checkbox", { checked: !todo.completed })}
                    onClick={() => this.props.setTodoCompletion({ id: todo.id, completed: !todo.completed })}>

                    <input type="checkbox" checked={!todo.completed} readOnly={true} disabled={editMode} />
                    <label>{!editMode ? <span>{todo.text}</span> : <span>&nbsp;</span>}</label>
                </div>
            </div>

            {!editMode && <i className="icon-edit inline-button edit" onClick={e => this.setEditMode(true)} />}
            {!editMode && <i className="icon-bin inline-button delete" onClick={e => this.props.deleteTodo(todo.id)} />}

            {editMode &&
                <div className="ui form text-editor">
                    <div className="field">
                        <input type="text"
                            ref={this.handleTextInputRefUpdate.bind(this)}
                            defaultValue={todo.text}
                            onKeyDown={this.handleTextInputKeyDown.bind(this)} />
                    </div>
                </div>}

            {editMode && <i className="icon-checkmark inline-button save" onClick={e => this.saveTodoText(this._textInput.value)} />}
            {editMode && <i className="icon-cancel inline-button cancel" onClick={e => this.setEditMode(false)} />}
        </div>
    }
}
