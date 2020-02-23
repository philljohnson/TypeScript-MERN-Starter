import React, { Fragment } from "react";
import connectAllProps from "../../../shared/connect";
import Thread from "../../../models/Thread";
import { Redirect, Link } from "react-router-dom";
import { byCommentedAtLatestFirst } from "../../../shared/date";
import { Container, List, Button, Pagination, Segment, Header, Icon } from "semantic-ui-react";
import { CONTAINER_STYLE } from "../../../shared/styles";
import Loading from "./Loading";
import { FormattedMessage } from "react-intl";
import User from "../../../models/User";
import UserAvatar from "../user/UserAvatar";
import moment from "moment";
import "../../css/thread.css";
import { DEFAULT_PAGE_SIZE } from "../../../shared/constants";
import { ComponentProps as Props } from "../../../shared/ComponentProps";

interface States {}

const MARGIN_VERTICAL: number = 10;

class ThreadList extends React.Component<Props, States> {
    render(): React.ReactElement<any> {
        if (this.props.state.userState.currentUser) {
            return <Fragment>
                <Container text style={{
                    ...CONTAINER_STYLE,
                    flex: 1,
                    flexDirection: "column"
                }}>
                    {this.renderControlBar()}
                    {this.renderPager()}
                    <div style={{flex: 1}}>
                        {this.renderThreads()}
                    </div>
                </Container>
            </Fragment>;
        } else {
            return <Redirect to="/login" />;
        }
    }
    componentDidMount() {
        this.props.actions.resetRedirectTask();
    }
    private renderThreads = (): React.ReactElement<any> => {
        if (this.props.state.threadState.loading
            && this.props.state.threadState.data
            && this.props.state.threadState.data.length === 0) {
            return <Loading />;
        } else if (this.props.state.threadState.data.length === 0) {
            return <Segment placeholder>
                <Header icon>
                    <Icon name="discussions" />
                    <FormattedMessage id="page.thread.empty" />
                </Header>
            </Segment>;
        } else {
            return <Segment>
                <List divided relaxed>
                    {
                        this.props.state.threadState.data
                        .sort(byCommentedAtLatestFirst).map(
                            (thread: Thread) => this.renderThreadItem(thread)
                        )
                    }
                </List>
            </Segment>;
        }
    }
    private renderThreadItem = (thread: Thread): React.ReactElement<any> => {
        const author: User = this.props.state.userDictionary[thread.author];
        const createTime: Date = thread.createdAt ? new Date(thread.createdAt) : new Date(0);
        const commentsCount: number = thread.commentsCount ? thread.commentsCount : 0;
        const likesCount: number = thread.likes ? thread.likes.length : 0;
        const lastCommentedBy: User | undefined = thread.lastCommentedBy ? this.props.state.userDictionary[thread.lastCommentedBy] : undefined;
        const lastCommentedTime: Date = thread.lastCommentedAt ? new Date(thread.lastCommentedAt) : new Date(0);
        return <List.Item as={Link} to={`/thread/${thread._id}`}
            key={thread._id} style={{
                display: "flex",
                flex: 1,
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "flex-start"
            }}>
            <div style={{flex: "none"}}>
                <UserAvatar user={author} />
            </div>
            <div style={{
                flex: "auto",
                justifyContent: "center",
                marginLeft: 10,
                marginRight: 10,
                flexDirection: "column"}}>
                <div className="title-text">
                    {thread.removedEternally ? <FormattedMessage id="page.thread.removed" /> : thread.title}
                </div>
                <div className="description-text" style={{marginTop: 4}}>
                    {author.name}
                    {" "}
                    <FormattedMessage id="post.created_at" />{moment(createTime).fromNow()}
                </div>
            </div>
            <div style={{
                display: "flex",
                flex: "none",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "space-between"
            }}>
                <div className="description-text">
                    <label style={{marginRight: 8}}>
                        <Icon name="like"  />{likesCount}
                    </label>
                    <label>
                        <Icon name="talk"  />{commentsCount}
                    </label>
                </div>
                <div className="description-text">
                {
                    lastCommentedBy ?
                    <div className="reply-info-text">
                        {lastCommentedBy.name}
                        {" "}
                        <FormattedMessage id="post.replied_at" />{moment(lastCommentedTime).fromNow()}
                    </div>
                    :
                    <div className="reply-info-text">
                        <FormattedMessage id="post.no_reply_yet" />
                    </div>
                }
                </div>
            </div>
        </List.Item>;
    }
    private renderPager = (): React.ReactElement<any> => {
        return <div style={{marginTop: MARGIN_VERTICAL, marginBottom: MARGIN_VERTICAL, flex: "none"}}>
            <Pagination
                defaultActivePage={this.props.state.threadState.pageIndex + 1}
                totalPages={Math.ceil(this.props.state.threadState.totalCount / DEFAULT_PAGE_SIZE)}
                onPageChange={(e, { activePage }) => this.handlePaginationChange(activePage)}
                />
        </div>;
    }
    private renderControlBar = (): React.ReactElement<any> | undefined => {
        return <div style={{marginTop: MARGIN_VERTICAL, marginBottom: MARGIN_VERTICAL}}>
            <Button loading={false} disabled={false} onClick={() => {
                    // Use <Link component={Button} to={`${match.url}/create`} /> does not work well
                    // So we use the raw method to navigate to the create page
                    this.props.history.push(`${this.props.match.url}/create`);
                }
            }>
                <Button.Content>
                    <Icon name="edit" />
                    <FormattedMessage id="page.thread.add" />
                </Button.Content>
            </Button>
        </div>;
    }
    private handlePaginationChange = (activePage: string | number | undefined): void => {
        if (activePage) {
            const pageIndex: number = Number.parseInt(activePage as string) - 1;
            this.props.actions.getThreads(pageIndex, DEFAULT_PAGE_SIZE);
        }
    }
}

export default connectAllProps(ThreadList);