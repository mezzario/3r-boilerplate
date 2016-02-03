import * as ReduxActions from "redux-actions";
const ReduxRouter = require("react-router-redux");
import AppHistory from "../core/History";
import * as Action from "../core/Actions";
import { TodosView } from "../core/Todos";

export default ReduxActions.handleActions({
    [Action.SetTodosView]: (state, action) => {
        updateTodosViewInUrl(action.payload);
        return action.payload;
    },

    [ReduxRouter.UPDATE_LOCATION]: (state, action) => {
        let url = (action.payload as HistoryModule.Location).pathname;
        let todosView = getTodosViewFromUrl(url);
        let fixedUrl = getUrlFromTodosView(todosView);

        if (fixedUrl !== url)
            updateTodosViewInUrl(todosView, true);

        return todosView;
    }
}, TodosView.All);

function getTodosViewFromUrl(url: string) {
    let todosViewStr = url.trim().replace(/^[/\\]+|[/\\]+$/g, "").toLowerCase();
    let todosView = TodosView.All;

    switch (todosViewStr) {
        case "active": todosView = TodosView.Active; break;
        case "completed": todosView = TodosView.Completed; break;
    }

    return todosView;
}

function getUrlFromTodosView(todosView: TodosView) {
    let url = "/";

    switch (todosView) {
        case TodosView.Active: return "/active";
        case TodosView.Completed: return "/completed";
    }

    return url;
}

function updateTodosViewInUrl(todosView: TodosView, replace = false) {
    let url = getUrlFromTodosView(todosView);
    setTimeout(() => replace ? AppHistory.replace(url) : AppHistory.push(url), 0);
}
