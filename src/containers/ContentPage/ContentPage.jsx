import * as React from "react"
import * as ReactRouter from "react-router"
import { PageHeader, PageFooter } from "../../components"
const Styles = require("./ContentPage.less")

class ContentPage extends React.Component {
    static propTypes = {
        children: React.PropTypes.node,
        location: ReactRouter.locationShape,
        router: ReactRouter.routerShape
    }

    render() {
        return <div className={Styles.root}>
            <div className="content-wrapper">
                <PageHeader />

                {this.props.children}
            </div>

            <PageFooter />
        </div>
    }
}

export default ReactRouter.withRouter(ContentPage)
