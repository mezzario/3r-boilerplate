/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react"; React;
const shouldPureComponentUpdate = require("react-pure-render/function") as Function;
const classNames = require("classnames") as ClassNamesFn;
const Styles = require("./TodoList.less");
import { TodoItem } from "../../core/Todos";
import * as Action from "../../core/Actions";
import TodoListItem from "../TodoListItem/TodoListItem";
const { spring, presets, TransitionMotion } = require("react-motion");

interface TodoListProps extends React.Props<TodoList> {
    todos: TodoItem[];
    emptyMessage?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;

    deleteTodo?: Action.DeleteTodoFunc;
    editTodoText?: Action.EditTodoTextFunc;
    setTodoCompletion?: Action.SetTodoCompletionFunc;
}

interface TodoListState {
    editedTodoId?: number;
    emptyMessage?: string;
}

export default class TodoList extends React.Component<TodoListProps, TodoListState> {
    private _itemComps: { [id: string]: TodoListItem } = {};

    constructor(props: TodoListProps) {
        super(props);

        this.state = {
            emptyMessage: this.props.emptyMessage || "empty"
        };
    }

    shouldComponentUpdate(nextProps: TodoListProps, nextState: TodoListState, nextContext) {
        return shouldPureComponentUpdate.apply(this, Array.prototype.slice.call(arguments));
    }

    cancelEdit() {
        Object.keys(this._itemComps).forEach(id => {
            let itemComp = this._itemComps[id];
            if (itemComp)
                itemComp.setEditMode(false);
        });
    }

    render() {
        const todos = this.props.todos.length ? this.props.todos : [{ id: 0 } as TodoItem];
        const preset = { stiffness: 300, damping: 30 };
        const itemHeight = 46;

        let enterStyle = { "opacity": 0,                 "height": 0                          };
        let usualStyle = { "opacity": spring(1),         "height": spring(itemHeight, preset) };
        let leaveStyle = { "opacity": spring(0, preset), "height": spring(0, preset)          };

        let getConfigs = style => todos.map(todo => ({ key: String(todo.id), data: todo, style }));
        let defaultConfigs = getConfigs(enterStyle);
        let configs = getConfigs(usualStyle);

        return (
            <TransitionMotion
                defaultStyles={defaultConfigs}
                styles={configs}
                willEnter={() => enterStyle}
                willLeave={() => Object.assign({}, leaveStyle, { "borderBottom": 0 })}>

                {(configs: { key: string, data: TodoItem, style }[]) =>
                    <div className={Styles.root}>
                        {this.props.header}

                        {configs.map(({ key, data: todo, style }) =>
                            todo.id
                                ? <TodoListItem
                                    key={key}
                                    todo={todo}
                                    style={style}
                                    ref={ref => this._itemComps[key] = ref}
                                    onBeforeEdit={() => this.cancelEdit()}
                                    deleteTodo={this.props.deleteTodo}
                                    editTodoText={this.props.editTodoText}
                                    setTodoCompletion={this.props.setTodoCompletion}
                                />
                                : <div key={key} style={style} className={classNames("ui attached segment", Styles.emptyMessage)}>
                                    <div>{this.state.emptyMessage}</div>
                                </div>)}

                        {this.props.footer}
                    </div>}
            </TransitionMotion>
        );
    }
}
