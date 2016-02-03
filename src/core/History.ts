import * as ReactRouter from "react-router";
import createHashHistory from "history/lib/createHashHistory"

export default (ReactRouter as any).useRouterHistory(createHashHistory)({ queryKey: false });
//export default (ReactRouter as any).hashHistory;
