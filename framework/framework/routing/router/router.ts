﻿module plat.routing {
    var __CHILD_ROUTE = '/*childRoute',
        __CHILD_ROUTE_LENGTH = __CHILD_ROUTE.length;

    export class Router {
        static currentRouter(router?: Router) {
            if (!isNull(router)) {
                Router.__currentRouter = router;
            }

            return Router.__currentRouter;
        }

        private static __currentRouter: Router;

        $Promise: async.IPromise = acquire(__Promise);
        $Injector: typeof dependency.Injector = acquire(__InjectorStatic);
        $EventManagerStatic: events.IEventManagerStatic = acquire(__EventManagerStatic);
        $browser: web.IBrowser = acquire(__Browser);

        recognizer: RouteRecognizer = acquire(__RouteRecognizerInstance);
        childRecognizer: RouteRecognizer = acquire(__RouteRecognizerInstance);
        navigating: boolean = false;
        previousUrl: string;
        previousPattern: string;

        currentRouteInfo: IDelegateInfo;

        result: IRouteResult;
        previousResult: IRouteResult;

        ports: Array<ISupportRouteNavigation> = [];
        parent: Router;
        children: Array<Router> = [];
        uid: string;

        constructor() {
            this.uid = uniqueId(__Plat);
            var current = Router.currentRouter();
            Router.currentRouter(this);

            if (isNull(current)) {
                this.$EventManagerStatic.on(this.uid, __urlChanged, (ev: events.IDispatchEventInstance, utils?: web.IUrlUtilsInstance) => {
                    postpone(() => {
                        this.navigate(utils.pathname);
                    });
                });
                this.previousUrl = this.$browser.urlUtils().pathname;
            }
        }

        initialize(parent?: Router) {
            this.parent = parent;
        }

        addChild(child: Router) {
            if (isNull(child) || this.children.indexOf(child) > -1) {
                return child;
            }

            child.initialize(this);
            this.children.push(child);

            return child;
        }

        removeChild(child: Router) {
            var children = this.children,
                index = this.children.indexOf(child);

            if (index < 0) {
                return;
            }

            children.splice(index, 1);
        }

        registerViewport(viewport: ISupportRouteNavigation) {
            var ports = this.ports;

            if (isNull(viewport) || ports.indexOf(viewport) > -1) {
                return this.$Promise.resolve();
            }

            ports.push(viewport);

            if (isArray(this.result)) {
                return this.performNavigation(this.result);
            }

            return this.$Promise.resolve();
        }

        unregisterViewport(viewport: ISupportRouteNavigation) {
            var ports = this.ports,
                index = ports.indexOf(viewport);

            if (index < 0) {
                return;
            }

            ports.splice(index, 1);

            if (ports.length === 0 && !isNull(this.parent)) {
                this.parent.removeChild(this);
            }
        }

        configure(routes: IRouteMapping): async.IThenable<void>;
        configure(routes: Array<IRouteMapping>): async.IThenable<void>;
        configure(routes: any) {
            if (isArray(routes)) {
                return mapAsync((route: IRouteMapping) => {
                    return this.configure(route);
                }, routes).then(() => { });
            }

            var resolve = this.$Promise.resolve,
                route: IRouteMapping = routes,
                view: string = this.$Injector.convertDependency(route.view);

            if (view === __NOOP_INJECTOR) {
                return resolve();
            }

            route.view = view;

            var routeDelegate: IRouteDelegate = {
                pattern: route.pattern,
                delegate: route
            },
                childPattern = route.pattern + __CHILD_ROUTE,
                childDelegate: IRouteDelegate = {
                    pattern: childPattern,
                    delegate: {
                        pattern: childPattern,
                        view: view
                    }
                };

            this.recognizer.register([routeDelegate], { name: view });
            this.childRecognizer.register([childDelegate]);

            return this.forceNavigate();
        }

        navigate(url: string, force?: boolean): async.IThenable<void> {
            var Promise = this.$Promise,
                resolve = Promise.resolve,
                reject = Promise.reject;

            force = force === true;

            if (!isString(url) || this.navigating || (!force && url === this.previousUrl)) {
                return resolve();
            }

            this.previousUrl = url;

            var result: IRouteResult = this.recognizer.recognize(url),
                routeInfo: IRouteInfo,
                pattern: string;

            if (isEmpty(result)) {
                result = this.childRecognizer.recognize(url);

                if (isEmpty(result)) {
                    // route has not been matched
                    return reject();
                }

                pattern = result[0].delegate.pattern;
                pattern = pattern.substr(0, pattern.length - __CHILD_ROUTE_LENGTH);

                if (this.previousPattern === pattern) {
                    // The pattern for this router is the same as the last pattern so 
                    // only navigate child routers.
                    return this.navigateChildren(result);
                }

                this.previousPattern = pattern;
            } else {
                this.previousPattern = result[0].delegate.pattern;
            }

            if (isEmpty(result)) {
                // route has not been matched.
                return reject();
            }

            routeInfo = result[0];

            if (this.currentRouteInfo === routeInfo) {
                return resolve();
            }

            this.currentRouteInfo = routeInfo;
            this.result = result;
            this.navigating = true;

            return this.canNavigate(result)
                .then((canNavigate) => {
                    return canNavigate && this.performNavigation(result);
                })
                .then(() => {
                    this.navigating = false;
                    this.previousResult = result;
                });
        }

        forceNavigate() {
            var resolve = this.$Promise.resolve;

            if (this.navigating) {
                return resolve();
            }

            if (!isEmpty(this.previousUrl)) {
                return this.navigate(this.previousUrl, true);
            }

            return resolve();
        }

        generate(name: string, parameters?: IObject<any>) {
            var router = this,
                prefix = '';

            while (!isNull(router) && !router.recognizer.exists(name)) {
                router = router.parent;
            }

            if (isNull(router)) {
                var Exception: IExceptionStatic = acquire(__ExceptionStatic);
                Exception.fatal('Route does not exist', Exception.NAVIGATION);
                return;
            }

            var path = router.recognizer.generate(name, parameters);

            while (!isNull(router = router.parent)) {
                prefix += (router.previousPattern !== '/') ? router.previousPattern : '';
            }

            return prefix + path;
        }

        navigateChildren(result: IRouteResult) {
            var resolve = this.$Promise.resolve;

            if (isEmpty(result)) {
                return resolve();
            }

            var childRoute = result[0].parameters.childRoute;

            if (!isString(childRoute)) {
                return resolve();
            }

            childRoute = '/' + childRoute;

            return mapAsync((child: Router) => {
                return child.navigate(childRoute);
            }, this.children).then(() => { });
        }

        performNavigation(result: IRouteResult) {
            return mapAsync((port: ISupportRouteNavigation) => {
                return port.navigateFrom(result)
                    .then(() => {
                        return port.navigateTo(result);
                    });
            }, this.ports).then(() => {
                return this.navigateChildren(result);
            });
        }

        canNavigate(result: IRouteResult) {
            return this.$Promise.all(this.runPreNavigationSteps(result)).then(this.reduce);
        }

        runPreNavigationSteps(result: IRouteResult): Array<async.IThenable<boolean>> {
            return this.children.reduce((promises, child) => {
                return promises.concat(child.runPreNavigationSteps(result));
            }, [this.preNavigate(result)]);
        }

        preNavigate(result: IRouteResult) {
            return this.canNavigateFrom(result).then((canNavigateFrom) => {
                return canNavigateFrom && this.canNavigateTo(result);
            });
        }

        canNavigateFrom(result: IRouteResult) {
            var resolve = this.$Promise.resolve;

            return mapAsync((port: ISupportRouteNavigation) => {
                return port.canNavigateFrom(result);
            }, this.ports).then(this.reduce);
        }

        canNavigateTo(result: IRouteResult) {
            var resolve = this.$Promise.resolve;

            return mapAsync((port: ISupportRouteNavigation) => {
                return port.canNavigateTo(result);
            }, this.ports).then(this.reduce);
        }

        reduce(values: Array<boolean>) {
            return values.reduce((prev, current) => {
                return prev && current;
            }, true);
        }
    }

    export function IRouter() {
        var router = new Router();
        router.initialize();
        return router;
    }
    
    plat.register.injectable(__Router, IRouter, null, __INSTANCE);

    export function IRouterStatic() {
        return Router;
    }

    plat.register.injectable(__RouterStatic, IRouterStatic);

    export interface IRouteMapping {
        pattern: string;
        view: any;
    }

    export interface IRouteResult extends Array<IRouteInfo> { }

    export interface IRouteInfo extends IDelegateInfo {
        delegate: IRouteMapping;
    }

    export interface ISupportRouteNavigation {
        canNavigateFrom(result: IRouteResult): async.IThenable<boolean>;
        canNavigateTo(result: IRouteResult): async.IThenable<boolean>;

        navigateFrom(result: IRouteResult): async.IThenable<any>;
        navigateTo(result: IRouteResult): async.IThenable<any>;
    }
}
