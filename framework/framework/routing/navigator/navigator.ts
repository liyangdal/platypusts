﻿module plat.routing {
    'use strict';

    export class Navigator {
        protected static root: Navigator;

        /**
         * @name $InjectorStatic
         * @memberof plat.routing.Navigator
         * @kind property
         * @access public
         * 
         * @type {plat.dependency.Injector}
         * 
         * @description
         * The {@link plat.dependency.Injector|Injector} injectable instance
         */
        $InjectorStatic: typeof dependency.Injector = acquire(__InjectorStatic);

        /**
         * @name $browserConfig
         * @memberof plat.routing.Navigator
         * @kind property
         * @access public
         * 
         * @type {plat.web.IBrowserConfig}
         * 
         * @description
         * The {@link plat.web.IBrowserConfig|IBrowserConfig} injectable instance
         */
        $browserConfig: web.IBrowserConfig = acquire(__BrowserConfig);

        /**
         * @name $browser
         * @memberof plat.routing.Navigator
         * @kind property
         * @access public
         * 
         * @type {plat.web.IBrowser}
         * 
         * @description
         * The {@link plat.web.IBrowser|IBrowser} injectable instance
         */
        $browser: web.IBrowser = acquire(__Browser);

        $EventManagerStatic: events.IEventManagerStatic = acquire(__EventManagerStatic);
        $window: Window = acquire(__Window);

        /**
         * @name router
         * @memberof plat.routing.Navigator
         * @kind property
         * @access public
         * 
         * @type {plat.routing.IRouter}
         * 
         * @description
         * The {@link plat.routing.IRouter|router} associated with this link.
         */
        router: Router;

        $history: History = plat.acquire(__History);

        uid = uniqueId(__Plat);
        removeUrlListener: IRemoveListener = noop;
        ignoreOnce = false;
        ignored = false;
        previousUrl: string;
        backNavigate: boolean = false;

        initialize(router: Router) {
            this.router = router;

            if (router.isRoot) {
                Navigator.root = this;
                this._observeUrl();
            }
        }

        navigate(view: any, options?: INavigateOptions) {
            options = isObject(options) ? options : {};
            var url: string;

            if (options.isUrl) {
                url = view;
            } else {
                url = this.generate(view, options.parameters, options.query);
            }

            this.$browser.url(url, options.replace);
        }

        goBack(options?: IBackNavigationOptions) {
            options = isObject(options) ? options : {};

            var length = Number(options.length);

            if (!isNumber(length)) {
                length = 1;
            }

            var root = Navigator.root;

            if (root !== this) {
                root.goBack(options);
            }

            var $history = this.$history,
                url = this.$browser.url();

            this.backNavigate = true;
            $history.go(-length);
            
            setTimeout(() => {
                if (!this.ignored && url === this.$browser.url()) {
                    this.$EventManagerStatic.dispatch(__shutdown, this, this.$EventManagerStatic.DIRECT);
                }
            }, 50);
        }

        dispose() {
            this.removeUrlListener();
            deleteProperty(this, 'router');
        }

        protected _observeUrl() {
            if (!isObject(this.router)) {
                return;
            }

            var config = this.$browserConfig,
                EventManager = this.$EventManagerStatic,
                prefix: string,
                previousUrl: string,
                previousQuery: string,
                backNavigate: boolean;

            this.previousUrl = this.$browser.url();

            EventManager.dispose(this.uid);
            EventManager.on(this.uid, __backButton, () => {
                var ev: events.IDispatchEventInstance = acquire(__DispatchEventInstance);
                ev.initialize('backButtonPressed', this);

                EventManager.sendEvent(ev);

                if (ev.defaultPrevented) {
                    return;
                }

                this.goBack();
            });

            EventManager.on(this.uid, __urlChanged, (ev: events.IDispatchEventInstance, utils?: web.IUrlUtilsInstance) => {
                if (this.ignoreOnce) {
                    this.ignoreOnce = false;
                    this.ignored = true;
                    return;
                }

                this.ignored = false;
                backNavigate = this.backNavigate;
                this.backNavigate = false;

                postpone(() => {
                    previousUrl = this.previousUrl;
                    this.router.navigate(utils.pathname, utils.query)
                        .then(() => {
                            this.previousUrl = utils.pathname;
                        })
                        .catch((e) => {
                            this.ignoreOnce = true;
                            this.previousUrl = previousUrl;
                            this.$browser.url(previousUrl, !backNavigate);
                        });
                });
            });
        }

        generate(view: any, parameters: any, query: any): string {
            if (isNull(this.router)) {
                return;
            }

            if (isEmpty(view)) {
                return view;
            }

            view = this.$InjectorStatic.convertDependency(view);
            return this.router.generate(view, parameters, query);
        }
    }

    export function INavigatorInstance() {
        return new Navigator();
    }

    register.injectable(__NavigatorInstance, INavigatorInstance, null, __INSTANCE);

    export interface INavigateOptions {
        isUrl?: boolean;
        parameters?: IObject<string>;
        query?: IObject<string>;
        replace?: boolean;
    }

    export interface IBackNavigationOptions {
        length?: number;
    }
}