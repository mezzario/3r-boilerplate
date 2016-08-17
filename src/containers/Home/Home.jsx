/* eslint-disable react/prop-types */

import * as React from "react"
import * as ReactRouter from "react-router"
import * as Redux from "redux"
import * as ReactRedux from "react-redux"
const shouldPureComponentUpdate = require("react-pure-render/function")
const classNames = require("classnames")
const Styles = require("./Home.less")
import * as Action from "../../core/Actions"
import { TodoList } from "../../components"
const { spring, TransitionMotion } = require("react-motion")
const Modernizr = require("modernizr")
import AppHistory from "../../core/History"
const _ = { debounce: require("lodash.debounce") }

// do not make it static class field: "react-transform-hmr" wraps class
// with proxy and static fields become unavailable
let _firstRender = true

class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            filterTodosByText: "",
            filteredTodos: props.todos
        }
    }

    componentDidMount() {
        // this.props.addTodo(
        //     fetch("https://baconipsum.com/api/?type=all-meat&paras=10")
        //         .then(response => response.json()))
    }

    shouldComponentUpdate(/*nextProps, nextState, nextContext*/) {
        return shouldPureComponentUpdate.apply(this, Array.prototype.slice.call(arguments))
    }

    componentWillReceiveProps(nextProps) {
        this.filterTodos(undefined, nextProps.todos, true)
    }

    handleNewTodoKeyDown(e) {
        let input = e.target
        let text = input.value.trim()

        if (e.which === 13 && text) {
            this.props.addTodo(text)

            if (this.props.todosView === "completed")
                AppHistory.push("/")

            input.value = ""

            this.filterTodosDebounced("")
        }
    }

    filterTodos(
        byText = this.state.filterTodosByText,
        todos = this.props.todos,
        force = false
    ) {
        byText = (byText || "").trim().toLocaleLowerCase().replace(/\s+/g, " ")

        let filteredTodos = this.state.filteredTodos

        if (force || byText !== this.state.filterTodosByText)
            if (!byText)
                filteredTodos = todos
            else {
                let parts = byText.split(" ")

                filteredTodos = todos.filter(todo => {
                    let todoText = todo.text.toLocaleLowerCase().trim()
                    return parts.every(part => todoText.indexOf(part) >= 0)
                })
            }

        this.setState({ filterTodosByText: byText, filteredTodos })
    }

    filterTodosDebounced = (() => _.debounce(this.filterTodos, 400))()

    handleNewTodoChange(e) {
        this.filterTodosDebounced(e.target.value)
    }

    handleClearCompletedClick(e) {
        e.preventDefault()

        this._todoList.cancelEdit()
        this.props.clearCompletedTodos()
    }

    render() {
        let anim = !_firstRender && !__SERVER__
        _firstRender = false

        let fixedStyle = { "opacity": 1 }
        let enterStyle = { "opacity": 0 }
        let usualStyle = { "opacity": spring(1) }
        let leaveStyle = { "opacity": spring(0) }

        if (!anim) {
            enterStyle = fixedStyle
            usualStyle = fixedStyle
        }

        let getConfigs = style => this.props.todosTotal ? [{ key: "list", style }] : []
        let defaultConfigs = getConfigs(enterStyle)
        let configs = getConfigs(usualStyle)

        return <div className={classNames("ui stackable centered grid", Styles.root)}>
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

                    {configs =>
                        <div>{configs.map(({ key, style }) =>
                            <div key={key} style={style}>{
                                <TodoList
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
                                            {[ ["", "All", "/"],
                                               ["active", "Active", "/active"],
                                               ["completed", "Completed", "/completed"] ]
                                            .map(pair =>
                                                <ReactRouter.Link
                                                    key={pair[0]}
                                                    className={classNames("ui button", { "active": this.props.todosView === pair[0] })}
                                                    to={pair[2]}
                                                    onClick={() => { this._todoList.cancelEdit() }}
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
    }
}

export default ReactRedux.connect(
    // mapStateToProps
    (state, ownProps) => {
        let todosView
        let todos
        let activeTodos = state.todos.filter(todo => !todo.completed)

        switch (ownProps.location.pathname.toLowerCase()) {
            case "/active":
                todosView = "active"
                todos = activeTodos
                break

            case "/completed":
                todosView = "completed"
                todos = state.todos.filter((todo) => todo.completed)
                break

            default:
                todosView = ""
                todos = state.todos
                break
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
)(Home)
