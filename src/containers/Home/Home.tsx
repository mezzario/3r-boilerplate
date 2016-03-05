/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react"; React;
import * as ReactRouter from "react-router";
import * as Redux from "redux";
import * as ReactRedux from "react-redux";
const shouldPureComponentUpdate = require("react-pure-render/function") as Function;
const classNames = require("classnames") as ClassNamesFn;
const Styles = require("./Home.less");
import { TodoItem, TodosView } from "../../core/Todos";
import { AppStore } from "../../core/Store";
import * as Action from "../../core/Actions";
import * as Containers from "../../containers";
import * as Components from "../../components";
const { spring, presets, TransitionMotion } = require("react-motion");
const Modernizr = require("modernizr") as __Modernizr.ModernizrStatic;
import AppHistory from "../../core/History";
const _ = { debounce: require("lodash.debounce") } as _.LoDashStatic;

interface HomeProps extends /*React.Props<Home>, */ReactRouter.RouteComponentProps<{}, {}> {
    todosView: TodosView;
    todos: TodoItem[];
    todosTotal: number;
    todosLeft: number;

    addTodo: Action.AddTodoFunc;
    deleteTodo?: Action.DeleteTodoFunc;
    editTodoText: Action.EditTodoTextFunc;
    setTodoCompletion?: Action.SetTodoCompletionFunc;
    clearCompletedTodos: Action.ClearCompletedTodosFunc;
}

interface HomeState {
    filterTodosByText?: string;
    filteredTodos?: TodoItem[];
}

class Home extends React.Component<HomeProps, HomeState> {
    private _todoList: Components.TodoList;

    constructor(props: HomeProps) {
        super(props);

        this.state = {
            filterTodosByText: "",
            filteredTodos: props.todos
        };
    }

    componentDidMount() {
        // this.props.addTodo(
        //     fetch("https://baconipsum.com/api/?type=all-meat&paras=10")
        //         .then(response => response.json()));

        // this.props.addTodo([
        //     "Watch movie from favorites",
        //     "Call Alice tomorrow afternoon",
        //     "Buy gifts for colleagues",
        //     "Apply for a new job"
        // ]);
    }

    shouldComponentUpdate(nextProps: HomeProps, nextState: HomeState, nextContext) {
        return shouldPureComponentUpdate.apply(this, Array.prototype.slice.call(arguments));
    }

    componentWillReceiveProps(nextProps: HomeProps) {
        this.filterTodos(undefined, nextProps.todos, true);
    }

    private handleNewTodoKeyDown(e: React.KeyboardEvent) {
        let input = e.target as HTMLInputElement;
        let text = input.value.trim();

        if (e.which === 13 && text) {
            this.props.addTodo(text);

            if (this.props.todosView === TodosView.Completed)
                AppHistory.push("/");

            input.value = "";

            this.filterTodosDebounced("");
        }
    }

    private filterTodos(
        byText = this.state.filterTodosByText,
        todos = this.props.todos,
        force = false
    ) {
        byText = (byText || "").trim().toLocaleLowerCase().replace(/\s+/g, " ");

        let filteredTodos = this.state.filteredTodos;

        if (force || byText !== this.state.filterTodosByText)
            if (!byText)
                filteredTodos = todos;
            else {
                let parts = byText.split(" ");

                filteredTodos = todos.filter(todo => {
                    let todoText = todo.text.toLocaleLowerCase().trim();
                    return parts.every(part => todoText.indexOf(part) >= 0);
                });
            }

        this.setState({ filterTodosByText: byText, filteredTodos });
    }

    private filterTodosDebounced = (() => _.debounce(this.filterTodos, 400))();

    private handleNewTodoChange(e: React.FormEvent) {
        this.filterTodosDebounced((e.target as HTMLInputElement).value);
    }

    private handleClearCompletedClick(e: React.MouseEvent) {
        e.preventDefault();

        this._todoList.cancelEdit();
        this.props.clearCompletedTodos();
    }

    render() {
        let enterStyle = { "opacity": 0         };
        let usualStyle = { "opacity": spring(1) };
        let leaveStyle = { "opacity": spring(0) };

        let getConfigs = style => this.props.todosTotal ? [{ key: "list", style }] : [];
        let defaultConfigs = getConfigs(enterStyle);
        let configs = getConfigs(usualStyle);

        return <Containers.ContentPage withHeader={false}>
            <div className={classNames("ui stackable centered grid", Styles.root)}>
                <div className="column">
                    <h2 className={classNames("ui header orange", Styles.mainHeader)}><i className="icon-checklist" /> todos</h2>

                    <div className="ui form">
                        <div className="field">
                            <input
                                ref={(input: HTMLInputElement) => !Modernizr.touchevents && input && input.focus()}
                                className={Styles.newTodoInput}
                                type="text"
                                autoFocus={true}
                                placeholder="What needs to be done?"
                                onKeyDown={this.handleNewTodoKeyDown.bind(this)}
                                onChange={this.handleNewTodoChange.bind(this)}
                            />
                        </div>
                    </div>

                    {/*animate show/hide of todo list*/}
                    <TransitionMotion
                        defaultStyles={defaultConfigs}
                        styles={configs}
                        willEnter={() => enterStyle}
                        willLeave={() => leaveStyle}>

                        {(configs: { key: string, data: TodoItem, style }[]) =>
                            <div>{configs.map(({ key, style }) =>
                                <div key={key} style={style}>{
                                    <Components.TodoList
                                        ref={ref => this._todoList = ref}
                                        todos={this.state.filteredTodos}
                                        emptyMessage={() =>
                                            this.state.filteredTodos.length === this.props.todos.length
                                                ? "no items in this view"
                                                : "no items found that satisfy the query"}
                                        deleteTodo={this.props.deleteTodo}
                                        editTodoText={this.props.editTodoText}
                                        setTodoCompletion={this.props.setTodoCompletion}
                                        header={
                                            <div className={classNames("ui top attached three basic buttons", Styles.viewSelector)}>
                                                {[ [TodosView.All, "All", "/"],
                                                   [TodosView.Active, "Active", "/active"],
                                                   [TodosView.Completed, "Completed", "/completed"] ]
                                                .map(pair =>
                                                    <ReactRouter.Link
                                                        key={pair[0]}
                                                        className={classNames("ui button", { "active": this.props.todosView === pair[0] })}
                                                        to={pair[2] as any}
                                                        onClick={() => { this._todoList.cancelEdit(); }}
                                                    >{pair[1]}</ReactRouter.Link>)}
                                            </div>
                                        }
                                        footer={
                                            <div className={classNames("ui bottom attached secondary segment", Styles.statusBar)}>
                                                {!this.props.todosLeft
                                                    ? <span><i className="icon-done_all" />All done</span>
                                                    : (this.props.todosLeft !== this.props.todosTotal ? `${this.props.todosLeft} of ` : "") + `${this.props.todosTotal} item${this.props.todosTotal > 1 ? "s" : ""} left`}

                                                {this.props.todosLeft !== this.props.todosTotal &&
                                                    <a href="#" onClick={this.handleClearCompletedClick.bind(this)}><i className="icon-bin" /><span>Clear Completed</span></a>}
                                            </div>
                                        }
                                    />
                                }</div>
                            )}</div>}
                    </TransitionMotion>
                </div>
            </div>
        </Containers.ContentPage>
    }
}

export default ReactRedux.connect(
    // mapStateToProps
    (state: AppStore, ownProps: HomeProps) => {
        let todosView: TodosView;
        let todos: TodoItem[];
        let activeTodos = state.todos.filter(todo => !todo.completed);
        let location = (state.routing as any).locationBeforeTransitions as HistoryModule.Location;

        switch (location.pathname.toLowerCase()) {
            case "/active":
                todosView = TodosView.Active;
                todos = activeTodos;
                break;

            case "/completed":
                todosView = TodosView.Completed;
                todos = state.todos.filter((todo) => todo.completed);
                break;

            default:
                todosView = TodosView.All;
                todos = state.todos;
                break;
        }

        return {
            todosView,
            todos,
            todosTotal: state.todos.length,
            todosLeft: activeTodos.length,
        }
    },

    // mapDispatchToProps
    dispatch => Redux.bindActionCreators({
        addTodo: Action.addTodo,
        deleteTodo: Action.deleteTodo,
        editTodoText: Action.editTodoText,
        setTodoCompletion: Action.setTodoCompletion,
        clearCompletedTodos: Action.clearCompletedTodos
    }, dispatch)
)(Home);
