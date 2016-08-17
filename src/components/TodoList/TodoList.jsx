/* eslint-disable react/prop-types */

import * as React from "react"
const shouldPureComponentUpdate = require("react-pure-render/function")
const classNames = require("classnames")
const Styles = require("./TodoList.less")
import { TodoListItem } from "../../components"
const { spring, TransitionMotion } = require("react-motion")

let _firstRender = true

export default class TodoList extends React.Component {
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
            let itemComp = this._itemComps[id]
            if (itemComp)
                itemComp.setEditMode(false)
        })
    }

    render() {
        let anim = !_firstRender && !__SERVER__
        _firstRender = false

        const todos = this.props.todos.length ? this.props.todos : [{ id: 0 }]
        const preset = { stiffness: 300, damping: 30 }
        const itemHeight = 46

        let fixedStyle = { "opacity": 1,                 "height": itemHeight                 }
        let enterStyle = { "opacity": 0,                 "height": 0                          }
        let usualStyle = { "opacity": spring(1),         "height": spring(itemHeight, preset) }
        let leaveStyle = { "opacity": spring(0, preset), "height": spring(0, preset)          }

        if (!anim) {
            enterStyle = fixedStyle
            usualStyle = fixedStyle
        }

        let getConfigs = style => todos.map(todo => ({ key: String(todo.id), data: todo, style }))
        let defaultConfigs = getConfigs(enterStyle)
        let configs = getConfigs(usualStyle)

        return <TransitionMotion
            defaultStyles={defaultConfigs}
            styles={configs}
            willEnter={() => enterStyle}
            willLeave={() => Object.assign({}, leaveStyle, { "borderBottom": 0 })}>

            {configs =>
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
                                <div>{this.props.emptyMessage
                                    ? (typeof this.props.emptyMessage === "string"
                                        ? this.props.emptyMessage
                                        : (this.props.emptyMessage)())
                                    : "empty"}</div>
                            </div>)}

                    {this.props.footer}
                </div>}
        </TransitionMotion>
    }
}
