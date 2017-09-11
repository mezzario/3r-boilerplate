import React from "react"
import PropTypes from "prop-types"
const shouldPureComponentUpdate = require("react-pure-render/function")
const classNames = require("classnames")
const Styles = require("./TodoList.less")
import {TodoListItem} from "../../components"
import * as Reducers from "../../core/Reducers"
const CssTransition = require("react-addons-css-transition-group")

export default class TodoList extends React.Component {
  static propTypes = {
    todos: PropTypes.arrayOf(Reducers.propTypes.todo).isRequired,
    emptyMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    header: PropTypes.node,
    footer: PropTypes.node,

    deleteTodo: PropTypes.func.isRequired,
    editTodoText: PropTypes.func.isRequired,
    setTodoCompletion: PropTypes.func.isRequired,
  }

  _itemComps = {}

  constructor(props) {
    super(props)

    this.state = {}
  }

  shouldComponentUpdate(/*nextProps, nextState, nextContext*/) {
    return shouldPureComponentUpdate.apply(this, Array.prototype.slice.call(arguments))
  }

  cancelEdit() {
    Object.keys(this._itemComps).forEach(id => {
      const itemComp = this._itemComps[id]
      if (itemComp)
        itemComp.setEditMode(false)
    })
  }

  render() {
    const todos = this.props.todos.length ? this.props.todos : [{id: 0}]

    return <div className={classNames(Styles.root)}>
      {this.props.header}

      <CssTransition
        component="div"
        className={classNames(Styles.root, "anim-wrapper ui attached")}
        transitionName="switch"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
      >
        {todos.map(todo =>
          todo.id
            ? <TodoListItem
              key={todo.id}
              todo={todo}
              ref={ref => this._itemComps[todo.id] = ref}
              onBeforeEdit={() => this.cancelEdit()}
              deleteTodo={this.props.deleteTodo}
              editTodoText={this.props.editTodoText}
              setTodoCompletion={this.props.setTodoCompletion}
            />
            : <div key={0} className={classNames(Styles.emptyMessage, "ui attached segment")}>
              {this.props.emptyMessage
                ? (typeof this.props.emptyMessage === "string"
                  ? this.props.emptyMessage
                  : this.props.emptyMessage())
                : "empty"}
            </div>)}
      </CssTransition>

      {this.props.footer}
    </div>
  }
}
