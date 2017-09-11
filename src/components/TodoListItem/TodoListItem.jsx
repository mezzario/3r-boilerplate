import React from "react"
import PropTypes from "prop-types"
const shouldPureComponentUpdate = require("react-pure-render/function")
const classNames = require("classnames")
const Styles = require("./TodoListItem.less")
import * as Reducers from "../../core/Reducers"

export default class TodoListItem extends React.Component {
  static propTypes = {
    todo: Reducers.propTypes.todo,
    style: PropTypes.object,

    onBeforeEdit: PropTypes.func,
    deleteTodo: PropTypes.func.isRequired,
    editTodoText: PropTypes.func.isRequired,
    setTodoCompletion: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {editMode: false}
  }

  shouldComponentUpdate(/*nextProps, nextState, nextContext*/) {
    return shouldPureComponentUpdate.apply(this, Array.prototype.slice.call(arguments))
  }

  handleTextInputKeyDown(e) {
    if (e.which === 13)
      this.saveTodoText(e.target.value)
    else if (e.which === 27)
      this.setEditMode(false)
  }

  handleTextInputRefUpdate(ref) {
    this._textInput = ref

    if (ref) {
      ref.focus()
      ref.setSelectionRange(0, ref.value.length)
    }
  }

  saveTodoText(newText) {
    let text = newText.trim()
    if (text && text !== this.props.todo.text)
      this.props.editTodoText({id: this.props.todo.id, text})

    this.setEditMode(false)
  }

  setEditMode(editMode: boolean) {
    if (editMode && this.props.onBeforeEdit)
      this.props.onBeforeEdit()

    this.setState({editMode})
  }

  render() {
    let {todo} = this.props
    let {editMode} = this.state

    return <div className={classNames("ui attached segment", Styles.root, {"completed": todo.completed, "edit": editMode})}
      style={Object.assign({}, this.props.style)}
      onDoubleClick={() => this.setEditMode(true)}>

      <div className="checkbox-wrapper">
        <div className={classNames("ui slider checkbox", {checked: !todo.completed})}
          onClick={() => this.props.setTodoCompletion({id: todo.id, completed: !todo.completed})}>

          <input type="checkbox" checked={!todo.completed} readOnly={true} disabled={editMode} />
          <label>{!editMode ? <span>{todo.text}</span> : <span>&nbsp;</span>}</label>
        </div>
      </div>

      {!editMode && <i className="icon-edit inline-button edit" onClick={() => this.setEditMode(true)} />}
      {!editMode && <i className="icon-bin inline-button delete" onClick={() => this.props.deleteTodo(todo.id)} />}

      {editMode &&
        <div className="ui form text-editor">
          <div className="field">
            <input type="text"
              ref={this.handleTextInputRefUpdate.bind(this)}
              defaultValue={todo.text}
              onKeyDown={this.handleTextInputKeyDown.bind(this)} />
          </div>
        </div>}

      {editMode && <i className="icon-checkmark inline-button save" onClick={() => this.saveTodoText(this._textInput.value)} />}
      {editMode && <i className="icon-cancel inline-button cancel" onClick={() => this.setEditMode(false)} />}
    </div>
  }
}
