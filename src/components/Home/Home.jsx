import React from "react"
import PropTypes from "prop-types"
import * as ReactRouter from "react-router-dom"
import * as Redux from "redux"
import * as ReactRedux from "react-redux"
const shouldPureComponentUpdate = require("react-pure-render/function")
const classNames = require("classnames")
const Styles = require("./Home.less")
import * as Action from "../../core/Actions"
import {TodoList} from "../../components"
const Modernizr = require("modernizr")
import AppHistory from "../../core/History"
const _ = {debounce: require("lodash.debounce")}
import {getTodosData} from "../../core/Selectors"
const CssTransition = require("react-addons-css-transition-group")
import * as Reducers from "../../core/Reducers"

class Home extends React.Component {
  static propTypes = {
    todosView: PropTypes.string.isRequired,
    todos: PropTypes.arrayOf(Reducers.propTypes.todo).isRequired,
    todosLeft: PropTypes.number.isRequired,
    todosTotal: PropTypes.number.isRequired,

    addTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    editTodoText: PropTypes.func.isRequired,
    setTodoCompletion: PropTypes.func.isRequired,
    clearCompletedTodos: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      filterTodosByText: "",
      filteredTodos: props.todos,
    }
  }

  // async componentDidMount() {
  //   const response = await fetch("https://baconipsum.com/api/?type=all-meat&paras=10")
  //   const strs = await response.json()

  //   this.props.addTodo(strs)
  // }

  shouldComponentUpdate(/*nextProps, nextState, nextContext*/) {
    return shouldPureComponentUpdate.apply(this, Array.prototype.slice.call(arguments))
  }

  componentWillReceiveProps(nextProps) {
    this.filterTodos(undefined, nextProps.todos, true)
  }

  handleNewTodoKeyDown(e) {
    const input = e.target
    const text = input.value.trim()

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
        const parts = byText.split(" ")

        filteredTodos = todos.filter(todo => {
          const todoText = todo.text.toLocaleLowerCase().trim()
          return parts.every(part => todoText.indexOf(part) >= 0)
        })
      }

    this.setState({filterTodosByText: byText, filteredTodos})
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
    return <div className={classNames(Styles.root, "ui stackable centered grid")}>
      <div className="column">
        <h2 className={classNames(Styles.mainHeader, "ui header orange")}><i className="icon-checklist" /> todos</h2>

        <div className="ui form">
          <div className="field">
            <input
              ref={input => !Modernizr.touchevents && input && input.focus()}
              className={Styles.newTodoInput}
              type="text"
              autoFocus={true}
              placeholder="What needs to be done?"
              onKeyDown={this.handleNewTodoKeyDown.bind(this)}
              onChange={this.handleNewTodoChange.bind(this)}
            />
          </div>
        </div>

        <CssTransition
          component="div"
          className="anim-wrapper"
          transitionName="fade"
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}
        >
          {this.props.todosTotal &&
            <TodoList
              key="todo-list"
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
                <div className={classNames(Styles.viewSelector, "ui top attached three basic buttons")}>
                  {[["", "All", "/"],
                    ["active", "Active", "/active/"],
                    ["completed", "Completed", "/completed/"]]
                    .map(pair =>
                      <ReactRouter.Link
                        key={pair[0]}
                        className={classNames("ui button", {"active": this.props.todosView === pair[0]})}
                        to={pair[2]}
                        onClick={() => { this._todoList.cancelEdit() }}
                      >{pair[1]}</ReactRouter.Link>)}
                </div>
              }
              footer={
                <div className={classNames(Styles.statusBar, "ui bottom attached secondary segment")}>
                  {!this.props.todosLeft
                    ? <span><i className="icon-all-done" />All done</span>
                    : (this.props.todosLeft !== this.props.todosTotal ? `${this.props.todosLeft} of ` : "") + `${this.props.todosTotal} item${this.props.todosTotal > 1 ? "s" : ""} left`}

                  {this.props.todosLeft !== this.props.todosTotal &&
                    <a href="#" onClick={this.handleClearCompletedClick.bind(this)}><i className="icon-bin" /><span>Clear Completed</span></a>}
                </div>
              }
            />}
        </CssTransition>
      </div>
    </div>
  }
}

export default ReactRedux.connect(
  (state/*, ownProps*/) => getTodosData(state), // mapStateToProps

  dispatch => Redux.bindActionCreators({ // mapDispatchToProps
    addTodo: Action.addTodo,
    deleteTodo: Action.deleteTodo,
    editTodoText: Action.editTodoText,
    setTodoCompletion: Action.setTodoCompletion,
    clearCompletedTodos: Action.clearCompletedTodos,
  }, dispatch)
)(Home)
