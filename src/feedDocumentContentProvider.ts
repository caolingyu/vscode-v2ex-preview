import { TextDocumentContentProvider, Uri, Event, CancellationToken, EventEmitter, ExtensionContext, workspace } from "vscode";
import { Feed, fetchFeed } from "./feed";

interface FeedService {
    address: string;
    lastUpdate: Date;
    feeds: Feed[];
}

export class FeedDocumentContentProvider implements TextDocumentContentProvider {
    private _service: FeedService = {
        address: "https://www.v2ex.com/index.xml",
        lastUpdate: new Date(),
        feeds: []
    };
    private _expireDuration: number = 20 * 60 * 1000;
    private _changeEvent = new EventEmitter<Uri>();

    public constructor(expireDuration?: number) {
        if (expireDuration) {
            this._expireDuration = expireDuration;
        }
    }

    public get onDidChange(): Event<Uri> {
        return this._changeEvent.event;
	}
	
	public get service(): FeedService{
		return this._service;
	}

    public provideTextDocumentContent(uri: Uri): Promise<string> {
		let feeds = this._service.feeds;
		// console.log(feeds);
        if (feeds.length != 0) {
			// console.log("feeds not empty");
            if ((Date.now() - this._service.lastUpdate.valueOf()) > this._expireDuration) {
				this._service.lastUpdate =  new Date();
				this._service.feeds = [];
            } else {
                return Promise.resolve(this._renderFeeds(feeds));
            }
        }

		let loading = Promise.resolve("<div> Loading... </div>");
        loading.then(() => fetchFeed(this._service.address).then(feeds => {
				// console.log(feeds);
                this._service.feeds = feeds;
                this._service.lastUpdate = new Date();
                this._changeEvent.fire(uri);
            }));
        return loading;
	}
	
	public getWebContent(uri: Uri): string {
		let feeds = this._service.feeds;
		return this._renderFeeds(feeds);
	}

    public register(ctx: ExtensionContext, scheme: string) {
        let disposable = workspace.registerTextDocumentContentProvider(scheme, this);
        ctx.subscriptions.push(disposable);
    }

    private _renderFeeds(feeds: Feed[]): string {
        let content = "";
        for (let feed of feeds) {
            content += this._renderFeed(feed);
        }
        return content;
    }

    private _renderFeed(feed: Feed): string {
        return `
<div style="border: 1px dashed; margin: 50px; padding: 0 20px 20px 20px;">
    <h2><a href="${feed.link}">${feed.title}</a></h2>
    <p style="margin-bottom: 20px;">${feed.author.name} 发表于 ${feed.published}</p>
    <div>${feed.content ? feed.content : ""}</div>
</div>
`;
    }
}