/// <reference path="../../../typings/tsd.d.ts" />

import * as React from "react";
import { PageHeader, PageFooter } from "../../components";
var classNames = require("classnames") as ClassNamesFn;
var Styles = require("./ContentPage.less");

interface ContentPageProps extends React.HTMLProps<HTMLElement> {
    withHeader?: boolean;
    withFooter?: boolean;
}

interface ContentPageState {
    withHeader: boolean;
    withFooter: boolean;
}

export default class ContentPage extends React.Component<ContentPageProps, ContentPageState> {
    constructor(props: ContentPageProps) {
        super(props);

        this.state = {
            withHeader: props.withHeader === undefined || props.withHeader,
            withFooter: props.withFooter === undefined || props.withFooter
        };
    }

    render() {
        return <div className={classNames("ui container", Styles.root, {
            "with-header": this.state.withHeader,
            "with-footer": this.state.withFooter
        })}>
            <div className="content-wrapper">
                {this.state.withHeader && <PageHeader />}
                {this.props.children}
            </div>

            {this.state.withFooter && <PageFooter />}
        </div>
    }
}
